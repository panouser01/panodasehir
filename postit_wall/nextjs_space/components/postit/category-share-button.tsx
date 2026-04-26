'use client';

import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Link2, Instagram, Mail } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CategoryShareButtonProps {
  categoryId: string;
  className?: string;
  variant?: 'large' | 'badge';
}

export function CategoryShareButton({ categoryId, className = '', variant = 'badge' }: CategoryShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?category=${categoryId}` : '';

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
        navigator.clipboard.writeText(shareUrl);
        alert('Link kopyalandı! Instagram açılıyor...');
        setTimeout(() => {
          window.open('https://www.instagram.com/', '_blank');
        }, 1500);
        setIsOpen(false);
        return;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('Link kopyalandı!');
        setIsOpen(false);
        return;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {variant === 'badge' ? (
          <div 
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className={`flex items-center justify-center px-1.5 py-0.5 rounded-md bg-green-100/90 text-green-800 shadow-sm transition-colors border border-green-500 hover:bg-green-200 cursor-pointer pointer-events-auto ${className}`}
            title="Duvarı Paylaş"
          >
            <Share2 className="w-3 h-3" />
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            title="Duvarı Paylaş"
            className={`transition-all duration-300 hover:scale-110 active:scale-95 group relative ${className}`}
          >
            <Share2 className="w-6 h-6 md:w-8 md:h-8 text-white/80 drop-shadow-md group-hover:text-white" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Paylaş
            </span>
          </button>
        )}
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-auto p-3 bg-white rounded-xl shadow-2xl border border-gray-200" 
        align="end"
        sideOffset={5}
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
          <button onClick={(e) => handleShare(e, 'email')} className="p-3 bg-[#ea4335] text-white rounded-full hover:opacity-90 pointer-events-auto cursor-pointer transition-transform hover:scale-105" title="E-posta ile Paylaş">
            <Mail className="w-5 h-5" />
          </button>
          <button onClick={(e) => handleShare(e, 'whatsapp')} className="p-3 bg-[#25D366] text-white rounded-full hover:opacity-90 pointer-events-auto cursor-pointer transition-transform hover:scale-105" title="WhatsApp'ta Paylaş">
            <MessageCircle className="w-5 h-5" />
          </button>
          <button onClick={(e) => handleShare(e, 'linkedin')} className="p-3 bg-[#0A66C2] text-white rounded-full hover:opacity-90 pointer-events-auto cursor-pointer transition-transform hover:scale-105" title="LinkedIn'de Paylaş">
            <Linkedin className="w-5 h-5" />
          </button>
          <button onClick={(e) => handleShare(e, 'copy')} className="p-3 bg-gray-600 text-white rounded-full hover:opacity-90 pointer-events-auto cursor-pointer transition-transform hover:scale-105" title="Linki Kopyala">
            <Link2 className="w-5 h-5" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
