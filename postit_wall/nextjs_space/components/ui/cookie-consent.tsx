'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';
import { InfoDialog } from '@/components/ui/info-dialog';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [openDialog, setOpenDialog] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    // Check if user has already accepted or rejected cookies
    const consent = localStorage.getItem('panodasehir_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('panodasehir_cookie_consent', 'accepted');
    setIsVisible(false);
  };
  
  const handleReject = () => {
    localStorage.setItem('panodasehir_cookie_consent', 'rejected');
    setIsVisible(false);
  };

  const openCookiePolicy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      const content = data.settings?.cookiesContent || 'Çerez politikası detayları yüklenemedi.';
      setOpenDialog({ title: 'Çerez Politikası', content });
    } catch (error) {
      console.error('Settings fetch failed', error);
      setOpenDialog({ title: 'Çerez Politikası', content: 'İçerik yüklenemedi.' });
    }
  };

  if (!isVisible && !openDialog) return null;

  return (
    <>
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[100] transform transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 md:p-6 pb-safe">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <Cookie className="w-5 h-5 text-yellow-600" />
                <h3 className="text-sm font-semibold text-gray-900">Çerez ve Gizlilik Tercihleri</h3>
              </div>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Platformumuzun düzgün çalışabilmesi (hesaba giriş, güvenlik) için gerekli olan temel teknolojik çerezleri kullanmaktayız. Detaylı bilgi için{' '}
                <button onClick={openCookiePolicy} className="text-blue-600 hover:text-blue-800 hover:underline font-medium focus:outline-none">
                  Çerez Politikamızı
                </button>{' '}
                inceleyebilirsiniz.
              </p>
            </div>
            
            <div className="flex w-full md:w-auto items-center gap-2 shrink-0 justify-end md:justify-start">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReject}
                className="flex-1 md:flex-none text-xs"
              >
                Gerekli Olanlar
              </Button>
              <Button 
                size="sm" 
                onClick={handleAccept}
                className="flex-1 md:flex-none text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Tümünü Kabul Et
              </Button>
              <button 
                onClick={handleAccept} 
                className="p-2 ml-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors hidden sm:block"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <InfoDialog
        isOpen={!!openDialog}
        onOpenChange={(open) => {
          if (!open) setOpenDialog(null);
        }}
        title={openDialog?.title || ''}
        content={openDialog?.content || ''}
      />
    </>
  );
}
