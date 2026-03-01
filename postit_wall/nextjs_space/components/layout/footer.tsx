'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Twitter, Instagram, Linkedin, Mail, ArrowUp, Youtube, Github, Share2 } from 'lucide-react'
const SocialIcon = ({ name, className }: { name: string, className?: string }) => {
    switch (name) {
        case 'Facebook': return <Facebook className={className} />
        case 'Twitter': return <Twitter className={className} />
        case 'Instagram': return <Instagram className={className} />
        case 'Linkedin': return <Linkedin className={className} />
        case 'Youtube': return <Youtube className={className} />
        case 'Github': return <Github className={className} />
        case 'Share2': return <Share2 className={className} />
        case 'Mail': return <Mail className={className} />
        default: return <Share2 className={className} />
    }
}
import { Button } from '@/components/ui/button'
import { InfoDialog } from '@/components/ui/info-dialog'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

const infoDialogLinks = [
    { href: '/hakkimizda', field: 'aboutContent', title: 'Hakkımızda' },
    { href: '/iletisim', field: 'contactContent', title: 'İletişim' },
    { href: '/kosullar', field: 'termsContent', title: 'Kullanım Koşulları' },
    { href: '/gizlilik', field: 'privacyContent', title: 'Gizlilik Politikası' },
    { href: '/cerezler', field: 'cookiesContent', title: 'Çerez Politikası' },
    { href: '/yardim', field: 'helpContent', title: 'Yardım Merkezi' },
    { href: '/kvkk', field: 'kvkkContent', title: 'KVKK Metni' },
    { href: '/cerez-politikasi', field: 'cookiesContent', title: 'Çerez Politikası' },
]

const footerLinks = [
    {
        title: 'Panoda Şehir',
        links: [
            { label: 'Hakkımızda', href: '/hakkimizda' },
            { label: 'İletişim', href: '/iletisim' },
            { label: 'Kullanım Koşulları', href: '/kosullar' },
            { label: 'Gizlilik Politikası', href: '/gizlilik' },
            { label: 'Çerez Politikası', href: '/cerezler' },
            { label: 'Yardım Merkezi', href: '/yardim' },
            { label: 'KVKK Metni', href: '/kvkk' },
        ],
    },
    {
        title: 'Popüler Kategoriler',
        links: [
            { label: 'Etkinlikler', href: '/kategori/etkinlikler' },
            { label: 'İlanlar', href: '/kategori/ilanlar' },
            { label: 'Haberler', href: '/kategori/haberler' },
            { label: 'Yeme - İçme', href: '/kategori/yeme-icme' },
            { label: 'Spor', href: '/kategori/spor' },
            { label: 'Kültür Sanat', href: '/kategori/kultur-sanat' },
        ],
    },
    {
        title: 'Keşfet',
        links: [
            { label: 'En Sevilenler', href: '/kesfet/en-sevilenler' },
            { label: 'Yeni Paylaşılanlar', href: '/kesfet/yeni' },
            { label: 'Yakınımdakiler', href: '/kesfet/yakinimdakiler' },
            { label: 'Öne Çıkanlar', href: '/kesfet/one-cikanlar' },
            { label: 'Blog', href: '/blog' },
        ],
    },
    {
        title: 'Hızlı Erişim',
        links: [
            { label: 'Giriş Yap', href: '/login' },
            { label: 'Üye Ol', href: '/signup' },
            { label: 'Post Oluştur', href: '/?action=create' },
            { label: 'Postlarım', href: '/my-postits' },
            { label: 'Profilim', href: '/profile' },
        ],
    },
]

export const Footer = () => {
    const { data: session } = useSession()
    const isLoggedIn = !!session
    const { settings } = useSiteSettings()
    const [openDialog, setOpenDialog] = useState<{ title: string; content: string } | null>(null)

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleLinkClick = async (e: React.MouseEvent, href: string, label: string) => {
        const dialogLink = infoDialogLinks.find(l => l.href === href)
        if (dialogLink) {
            e.preventDefault()

            // Re-fetch settings to get the latest content (important as Footer stays mounted)
            try {
                const res = await fetch('/api/settings')
                const data = await res.json()
                const freshSettings = data.settings
                const content = freshSettings?.[dialogLink.field] || ''
                setOpenDialog({ title: dialogLink.title || label, content })
            } catch (error) {
                console.error('Settings fetch failed', error)
                setOpenDialog({ title: dialogLink.title || label, content: settings?.[dialogLink.field] || '' })
            }
        }
    }

    return (
        <footer className="bg-[#0f172a] text-gray-300 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
                    {/* Menu Columns */}
                    {footerLinks.map((column, idx) => {
                        let linksToDisplay = column.links;

                        // If this is the Popular Categories column and we have dynamic links, use them
                        if (column.title === 'Popüler Kategoriler' && settings?.popularLinks && Array.isArray(settings.popularLinks) && settings.popularLinks.length > 0) {
                            linksToDisplay = settings.popularLinks as { label: string; href: string }[];
                        }

                        // If this is the Discover column and we have dynamic links, use them
                        if (column.title === 'Keşfet' && settings?.discoverLinks && Array.isArray(settings.discoverLinks) && settings.discoverLinks.length > 0) {
                            linksToDisplay = settings.discoverLinks as { label: string; href: string }[];
                        }

                        // Handle Quick Access (Hızlı Erişim) - Conditional based on login state
                        if (column.title === 'Hızlı Erişim') {
                            linksToDisplay = column.links.filter(link => {
                                if (isLoggedIn) {
                                    return ['Post Oluştur', 'Postlarım', 'Profilim'].includes(link.label);
                                } else {
                                    return ['Giriş Yap', 'Üye Ol'].includes(link.label);
                                }
                            });
                        }

                        return (
                            <div key={idx} className="space-y-4">
                                <h3 className="text-white font-semibold text-lg border-b border-gray-700 pb-2 mb-4">
                                    {column.title}
                                </h3>
                                <ul className="space-y-2">
                                    {linksToDisplay.map((link, linkIdx) => (
                                        <li key={linkIdx}>
                                            <Link
                                                href={link.href}
                                                onClick={(e) => handleLinkClick(e, link.href, link.label)}
                                                className="hover:text-white transition-colors duration-200 text-sm"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}

                    {/* Social and Info Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                Panoda Şehir
                            </span>
                        </div>

                        <p className="text-sm leading-relaxed text-gray-400">
                            Şehrin nabzını tutan, fikirlerin özgürce paylaşıldığı dijital pano.
                            Sanal post-it'lerle anılarını paylaş, topluluğa katıl.
                        </p>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                {settings?.socialLinks && Array.isArray(settings.socialLinks) && settings.socialLinks.length > 0 ? (
                                    (settings.socialLinks as any[]).map((social, idx) => (
                                        <Link
                                            key={idx}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-yellow-500 hover:text-white transition-all duration-300"
                                            title={social.platform}
                                        >
                                            <SocialIcon name={social.icon} className="w-5 h-5" />
                                        </Link>
                                    ))
                                ) : (
                                    <>
                                        <Link href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-yellow-500 hover:text-white transition-all duration-300">
                                            <Facebook className="w-5 h-5" />
                                        </Link>
                                        <Link href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-yellow-500 hover:text-white transition-all duration-300">
                                            <Twitter className="w-5 h-5" />
                                        </Link>
                                        <Link href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-yellow-500 hover:text-white transition-all duration-300">
                                            <Instagram className="w-5 h-5" />
                                        </Link>
                                        <Link href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-yellow-500 hover:text-white transition-all duration-300">
                                            <Linkedin className="w-5 h-5" />
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer">
                                <Mail className="w-4 h-4" />
                                <span>destek@panodasehir.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>© {new Date().getFullYear()} Panoda Şehir.</span>
                        <span className="hidden md:inline">|</span>
                        <span>Tüm hakları saklıdır.</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
                        <Link href="/cerez-politikasi" onClick={(e) => handleLinkClick(e, '/cerez-politikasi', 'Çerez Politikası')} className="hover:text-gray-300">Çerez Politikası</Link>
                        <Link href="/gizlilik" onClick={(e) => handleLinkClick(e, '/gizlilik', 'Gizlilik Sözleşmesi')} className="hover:text-gray-300">Gizlilik Sözleşmesi</Link>
                        <Link href="/hakkimizda" onClick={(e) => handleLinkClick(e, '/hakkimizda', 'Hakkımızda')} className="hover:text-gray-300">Hakkımızda</Link>
                        <Link href="/yardim" onClick={(e) => handleLinkClick(e, '/yardim', 'Yardım')} className="hover:text-gray-300">Yardım</Link>
                        <Link href="/kvkk" onClick={(e) => handleLinkClick(e, '/kvkk', 'KVKK Metni')} className="hover:text-gray-300">KVKK Metni</Link>
                    </div>

                    <button
                        onClick={scrollToTop}
                        className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
                        title="Yukarı Git"
                    >
                        <ArrowUp className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <InfoDialog
                isOpen={!!openDialog}
                onOpenChange={(open) => !open && setOpenDialog(null)}
                title={openDialog?.title || ''}
                content={openDialog?.content || ''}
            />
        </footer>
    )
}
