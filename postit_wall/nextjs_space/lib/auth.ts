import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'
import * as bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email ve şifre gereklidir')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { userGroups: { select: { id: true } } }
        })

        if (!user) {
          throw new Error('Geçersiz email veya şifre')
        }

        if (!user.password) {
          throw new Error('Bu hesap Google ile oluşturulmuş. Lütfen Google ile giriş yapın.')
        }

        if (!user.emailVerified && user.role !== 'ADMIN') {
          throw new Error('Lütfen hesabınıza gönderilen onay bağlantısına tıklayarak e-postanızı doğrulayın.')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Geçersiz email veya şifre')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          userGroupIds: user.userGroups.map((ug: any) => ug.id)
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  cookies: {
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role ?? 'USER'
      }

      // If we don't have user object (subsequent requests), fetch fresh data
      if (!token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true }
        })
        if (dbUser) {
          token.role = dbUser.role
        }
      }

      // Important: Do NOT store large arrays like userGroupIds in the token.
      // This causes the NextAuth cookie to exceed 4KB-8KB, leading to 
      // HTTP 400 Bad Request errors from Nginx/Vercel when serving static chunks!
      if (token.userGroupIds) {
        delete token.userGroupIds
      }

      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token?.id as string
        (session.user as any).role = token?.role as string
        
        // Fetch userGroupIds directly from DB for each session access
        // This avoids bloating the NextAuth JWT cookie and causing HTTP 400s
        if (token?.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { 
              nickname: true, 
              permissions: true, 
              userGroups: { select: { id: true } },
              wallSubscriptions: {
                select: {
                  categoryId: true,
                  category: { select: { id: true, name: true } }
                }
              },
              following: {
                select: {
                  followingId: true,
                  following: { select: { id: true, nickname: true, name: true, image: true } }
                }
              }
            }
          })
          ;(session.user as any).userGroupIds = dbUser?.userGroups.map((ug: any) => ug.id) || []
          ;(session.user as any).nickname = dbUser?.nickname || null
          ;(session.user as any).permissions = dbUser?.permissions || []
          ;(session.user as any).wallSubscriptions = dbUser?.wallSubscriptions || []
          ;(session.user as any).following = dbUser?.following || []
        } else {
          ;(session.user as any).userGroupIds = []
          ;(session.user as any).permissions = []
          ;(session.user as any).wallSubscriptions = []
          ;(session.user as any).following = []
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
