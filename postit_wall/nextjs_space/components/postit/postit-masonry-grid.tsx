'use client'

import React, { useState, useEffect } from 'react'
import { Eye, Heart, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { PostItCard } from './postit-card'
import { stripHtml } from '@/lib/utils'

interface PostitMasonryGridProps {
  postits: any[];
  postitAppearance?: any;
  itemsPerRow?: number;
  cardRatio?: string;
  ottModalBgType?: string;
  ottModalBgColor?: string;
  ottModalBgColorAlpha?: number;
  ottModalBgImage?: string;
  ottModalTextColor?: string;
  canDelete?: boolean;
  currentUserId?: string;
}

function MasonryGridCard({ postit, getCardStyleClass, cardStyle, cardBgColor, imageRatio, titleColor, getFontFamily, getFontSize, textLineClamp, postitAppearance, ottModalBgType, ottModalBgColor, ottModalBgColorAlpha, ottModalBgImage, ottModalTextColor, canDelete, currentUserId, handleDelete }: any) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const additionalImages = postit.PostItImage?.map((img: any) => img.url) || postit.imageUrls || [];
  const rawImages = postit.imageUrl ? [postit.imageUrl, ...additionalImages] : additionalImages;
  const allImages = Array.from(new Set(rawImages.filter(Boolean))) as string[];

  useEffect(() => {
    if (allImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [allImages.length]);

  const currentImageUrl = allImages.length > 0 ? allImages[currentImageIndex] : null;

  return (
    <>
      <div className="hidden">
          <PostItCard
              postitAppearance={postitAppearance}
              ottCardStyle={postitAppearance?.ottCardStyle || 'cover'}
              id={postit.id}
              content={postit.content}
              imageUrl={postit.imageUrl}
              images={allImages}
              link={postit.link}
              color={postit.color}
              font={postit.font}
              pushpin={postit.pushpin}
              rotation={0} 
              userName={postit?.user?.nickname || postit?.user?.name || 'Anonim'}
              userImage={postit?.user?.showAvatarOnPostit ? postit?.user?.image : null}
              authorId={postit?.user?.id}
              categoryName={postit?.category?.name ?? 'Genel'}
              createdAt={postit.createdAt instanceof Date ? postit.createdAt : new Date(postit.createdAt)}
              canDelete={postit.isWeather ? false : (canDelete ?? false)}
              onDelete={handleDelete}
              currentUserId={currentUserId} 
              initialLikesCount={postit.likesCount ?? 0}
              initialHasLiked={postit.hasLiked ?? false}
              initialViewsCount={postit.views ?? 0}
              initialSharesCount={postit.sharesCount ?? 0}
              isWeather={postit.isWeather}
              weatherTemp={postit.weatherTemp}
              weatherCondition={postit.weatherCondition}
              weatherBg={postit.weatherBg}
              triggerComponent={<div id={`postit-${postit.id}-front-cover`}></div>}
              ottModalBgType={ottModalBgType}
              ottModalBgColor={ottModalBgColor}
              ottModalBgColorAlpha={ottModalBgColorAlpha}
              ottModalBgImage={ottModalBgImage}
              ottModalTextColor={ottModalTextColor}
          />
      </div>

      <div 
        className={`flex flex-col transition-all duration-300 ${getCardStyleClass()} relative cursor-pointer group hover:opacity-90`}
        style={{ backgroundColor: cardStyle !== 'glass' ? cardBgColor : undefined }}
        onClick={() => {
                  if ((postit as any).isVirtualNav) { window.location.href = `/?category=${(postit as any).categoryTargetId}`; return; }
           const postitBtn = document.getElementById(`postit-${postit.id}-front-cover`);
           if (postitBtn) postitBtn.click();
        }}
      >
      {currentImageUrl && (
        <div className="w-full relative bg-slate-100 overflow-hidden" style={{ aspectRatio: imageRatio === "auto" ? "auto" : imageRatio, backgroundColor: '#f1f5f9' }}>
          {currentImageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
            <video
              src={`${currentImageUrl}#t=0.1`}
              className="absolute inset-0 w-full h-full object-cover"
              preload="metadata"
              playsInline
              muted
            />
          ) : (
             <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: `url('${currentImageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', transition: 'background-image 0.5s ease-in-out' }} />
          )}

          {allImages.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-20">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      )}

      <div className="p-5 flex flex-col flex-1 justify-start">
        {(() => {
           // Temiz içerik ayrıştırma işlemleri
           const cleanContent = stripHtml(postit.content || '');
           
           const lines = cleanContent.split('\n').map((l: string) => l.trim()).filter(Boolean);
           const titleText = lines[0] || '';
           const descText = lines.slice(1).join(' ') || '';

           return (
             <>
               <h3 
                 className={`font-black mb-2 leading-tight break-words text-left`}
                 style={{ 
                   color: titleColor,
                   fontFamily: getFontFamily(),
                   fontSize: getFontSize(),
                 }}
               >
                 {titleText}
               </h3>
               {descText && (
                 <p className={`text-sm md:text-base text-slate-600 mb-4 leading-relaxed break-words text-left ${textLineClamp}`}>
                   {descText}
                 </p>
               )}
             </>
           );
        })()}

         <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400">
           <div className="truncate pr-2">#{postit?.category?.name || 'Kategori'}</div>
           <div className="shrink-0 flex items-center gap-2">
             <span>{postit.createdAt ? new Date(postit.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
             {(canDelete && !postit.isWeather && !(postit as any).isVirtualNav) && (
               <button
                 onClick={(e) => { e.stopPropagation(); handleDelete(postit.id); }}
                 className="text-slate-400 hover:text-red-500 transition-colors pointer-events-auto p-1 rounded-full hover:bg-red-50 ml-1"
                 title="Sil"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
               </button>
             )}
           </div>
         </div>
       </div>
     </div>
    </>
  );
}


export function PostitMasonryGrid({ postits: initialPostits, postitAppearance, itemsPerRow: propItemsPerRow, cardRatio: propCardRatio, ottModalBgType, ottModalBgColor, ottModalBgColorAlpha, ottModalBgImage, ottModalTextColor, canDelete, currentUserId }: PostitMasonryGridProps) {
  const [postits, setPostits] = useState<any[]>(initialPostits)

  useEffect(() => {
    setPostits(initialPostits)
  }, [initialPostits])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/postits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: false })
      })
      if (!response.ok) throw new Error('Silme başarısız')
      setPostits(prev => prev.filter(p => p.id !== id))
      toast.success('Postit silindi')
    } catch (e) {
      toast.error('Silinemedi')
    }
  }

  const itemsPerRow = propItemsPerRow || postitAppearance?.editorItemsPerRow || 3
  const imageRatio = propCardRatio || postitAppearance?.editorImageRatio || '16/9'
  const cardBgColor = postitAppearance?.editorCardBgColor || '#ffffff'
  const titleColor = postitAppearance?.textColor || postitAppearance?.editorTitleColor || '#111827'
  const titleFont = postitAppearance?.font || postitAppearance?.editorTitleFont || 'sans-serif'
  const titleSize = postitAppearance?.textSize || postitAppearance?.editorTitleSize || 'xl'
  const cardStyle = postitAppearance?.editorCardStyle || 'modern'
  const editorTextLinesClamp = postitAppearance?.editorTextLinesClamp || 'none'

  const getTextLineClampClass = () => {
    const clampMap: Record<string, string> = {
      '3': 'line-clamp-3',
      '5': 'line-clamp-5',
      '8': 'line-clamp-[8]',
      '12': 'line-clamp-[12]',
      '16': 'line-clamp-[16]',
      'none': ''
    };
    return clampMap[editorTextLinesClamp] || '';
  }

  const getGridCols = () => {
    switch(itemsPerRow) {
      case 1: return 'grid-cols-1'
      case 2: return 'grid-cols-1 md:grid-cols-2'
      case 4: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
      case 5: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
      case 3:
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    }
  }

  


  const getCardStyleClass = () => {
    switch (cardStyle) {
      case 'flat': return 'border-none shadow-none rounded-none'
      case 'bordered': return 'border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-xl'
      case 'glass': return 'bg-white/40 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl'
      case 'modern':
      default: return 'border-gray-100 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1'
    }
  }

  const getFontFamily = () => {
    switch (titleFont) {
      case 'font-serif':
      case 'serif': return '"Playfair Display", ui-serif, Georgia, serif'
      case 'font-handwriting':
      case 'handwriting': return '"Caveat", cursive'
      case 'london': return '"London Presley", sans-serif'
      case 'puerto': return '"Puerto", sans-serif'
      case 'retosta': return '"Retosta", sans-serif'
      case 'font-mono': return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
      case 'font-comic': return '"Comic Sans MS", "Chalkboard SE", "Comic Neue", sans-serif'
      case 'font-sans':
      case 'sans-serif':
      default: return 'inherit'
    }
  }

  const getFontSize = () => {
    const sizeMap: Record<string, string> = {
      'text-xs': '0.75rem',
      'text-sm': '0.875rem',
      'text-base': '1rem',
      'text-lg': '1.125rem',
      'text-xl': '1.25rem',
      'text-2xl': '1.5rem',
      'text-3xl': '1.875rem',
      'sm': '0.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    }
    return sizeMap[titleSize] || '1.125rem'
  }

  return (
    <div className="w-full flex-col flex items-center mb-8 px-4 sm:px-0">
      {postits.length === 0 ? (
        <div className="w-full text-center py-20 bg-white/50 backdrop-blur border border-dashed border-slate-300 rounded-3xl max-w-4xl opacity-80 mt-4">
          <h3 className="text-xl font-bold text-slate-600">Henüz Not Yok</h3>
        </div>
      ) : (
        <div className={`grid ${getGridCols()} gap-6 lg:gap-8 w-full max-w-[1400px]`}>
          {postits.map((postit) => (
            <MasonryGridCard 
              key={postit.id} 
              postit={postit}
              getCardStyleClass={getCardStyleClass}
              cardStyle={cardStyle}
              cardBgColor={cardBgColor}
              imageRatio={imageRatio}
              titleColor={titleColor}
              getFontFamily={getFontFamily}
              getFontSize={getFontSize}
              textLineClamp={getTextLineClampClass()}
              postitAppearance={postitAppearance}
              ottModalBgType={ottModalBgType}
              ottModalBgColor={ottModalBgColor}
              ottModalBgColorAlpha={ottModalBgColorAlpha}
              ottModalBgImage={ottModalBgImage}
              ottModalTextColor={ottModalTextColor}
              canDelete={canDelete}
              currentUserId={currentUserId}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
