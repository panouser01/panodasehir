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
        })

        if (!user) {
          throw new Error('Geçersiz email veya şifre')
        }

        if (!user.password) {
          throw new Error('Bu hesap Google ile oluşturulmuş. Lütfen Google ile giriş yapın.')
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
          userGroupId: user.userGroupId
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
        token.userGroupId = (user as any).userGroupId
      }

      // If we don't have user object (subsequent requests), fetch fresh data
      if (!token.role || !token.userGroupId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, userGroupId: true }
        })
        if (dbUser) {
          token.role = dbUser.role
          token.userGroupId = dbUser.userGroupId
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token?.id as string
        (session.user as any).role = token?.role as string
        (session.user as any).userGroupId = token?.userGroupId as string | null
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
