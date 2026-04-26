'use client';

import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Link2, Instagram, Mail } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import toast from 'react-hot-toast';

interface PostitShareButtonProps {
  postitId: string;
  className?: string;
  iconClassName?: string;
  initialShareCount?: number;
}

export function PostitShareButton({ postitId, className, iconClassName = "w-6 h-6", initialShareCount = 0 }: PostitShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareCount, setShareCount] = useState(initialShareCount);
  
  // URL to share the specific post-it
  // Safely splitting to ensure no existing hash duplicates
  const shareUrl = typeof window !== 'undefined' ? `${window.location.href.split('#')[0]}#postit-${postitId}-front-cover` : '';

  const handleShare = (e: React.MouseEvent, platform: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!shareUrl) return;

    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent('Panoda Şehir Paylaşımı')}&body=${encodeURIComponent('Buna bir göz at: ' + shareUrl)}`;
        break;
      case 'instagram':
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            toast.success('Link kopyalandı! Instagram açılıyor...');
            setTimeout(() => {
              window.open('https://www.instagram.com/', '_blank');
            }, 1500);
          })
          .catch(() => toast.error('Kopyalanamadı'));
        setIsOpen(false);
        setShareCount(prev => prev + 1);
        fetch(`/api/postits/${postitId}/share`, { method: 'POST' }).catch(console.error);
        return;
      case 'copy':
        navigator.clipboard.writeText(shareUrl)
          .then(() => toast.success('Link kopyalandı!'))
          .catch(() => toast.error('Kopyalanamadı'));
        setIsOpen(false);
        setShareCount(prev => prev + 1);
        fetch(`/api/postits/${postitId}/share`, { method: 'POST' }).catch(console.error);
        return;
    }

    if (url) {
      // Optimiztic UI update
      setShareCount(prev => prev + 1);
      fetch(`/api/postits/${postitId}/share`, { method: 'POST' }).catch(console.error);

      window.open(url, '_blank', 'width=600,height=400');
      setIsOpen(false);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div 
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className={`flex items-center gap-1.5 cursor-pointer transition-colors z-50 relative pointer-events-auto ${className || ''}`}
            title="Paylaş / Kopyala"
          >
            <Share2 className={iconClassName} />
            <span className="font-medium text-sm font-sans">{shareCount}</span>
          </div>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-auto p-3 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999]" 
          align="center"
          side="top"
          sideOffset={10}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <div className="flex gap-3">
            <button onClick={(e) => handleShare(e, 'facebook')} className="p-3 bg-[#1877F2] text-white rounded-full hover:opacity-90 pointer-events-auto cursor-pointer transition-transform hover:scale-105" title="Facebook'ta Paylaş">
              <Facebook className="w-5 h-5" />
            </button>
            <button onClick={(e) => handleShare(e, 'twitter')} className="p-3 bg-[#1DA1F2] text-white rounded-full hover:opacity-90 pointer-events-auto cursor-pointer transition-transform hover:scale-105" title="Twitter'da Paylaş">
              <Twitter className="w-5 h-5" />
            </button>
            <button onClick={(e) => handleShare(e, 'instagram')} className="p-3 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white rounded-full hover:opacity-90 pointer-events-auto cursor-pointer transition-transform hover:scale-105" title="Instagram'da Paylaş">
              <Instagram className="w-5 h-5" />
            </button>
            <button onClick={(e) => handleShare(e, 'whatsapp')} className="p-3 bg-[#25D366] text-white rounded-full hover:opacity-90 pointer-events-auto cursor-pointer transition-transform hover:scale-105" title="WhatsApp'ta Paylaş">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button onClick={(e) => handleShare(e, 'linkedin')} className="p-3 bg-[#0A66C2] text-white rounded-full hover:opacity-90 pointer-events-auto cursor-pointer transition-transform hover:scale-105" title="LinkedIn'de Paylaş">
              <Linkedin className="w-5 h-5" />
            </button>
            <button onClick={(e) => handleShare(e, 'email')} className="p-3 bg-[#ea4335] text-white rounded-full hover:opacity-90 pointer-events-auto cursor-pointer transition-transform hover:scale-105" title="E-posta ile Paylaş">
              <Mail className="w-5 h-5" />
            </button>
            <button onClick={(e) => handleShare(e, 'copy')} className="p-3 bg-gray-600 text-white rounded-full hover:opacity-90 pointer-events-auto cursor-pointer transition-transform hover:scale-105" title="Linki Kopyala">
              <Link2 className="w-5 h-5" />
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
