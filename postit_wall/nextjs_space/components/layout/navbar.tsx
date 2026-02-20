'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Settings, User, LogIn, StickyNote } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const userRole = (session?.user as any)?.role

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              📌 Panoda Şehir
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="w-4 h-4" />
                    {session?.user?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium leading-none">{session?.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userRole === 'SUPER_ADMIN' && (
                    <DropdownMenuItem onClick={() => router.push('/admin')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  )}
                  {userRole === 'WALL_MANAGER' && (
                    <DropdownMenuItem onClick={() => router.push('/wall-manager')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Yönetici Panel</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil Ayarları</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/my-postits')}>
                    <StickyNote className="mr-2 h-4 w-4" />
                    <span>Postlarım</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Çıkış Yap</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="gap-2">Kayıt Ol</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
