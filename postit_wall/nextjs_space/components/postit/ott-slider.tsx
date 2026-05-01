'use client'

import { PostItCard } from './postit-card'
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Eye, Heart, MessageSquare, Trash2, Flag, Share2, Sun, Moon, Cloud, CloudFog, CloudRain, CloudSnow, CloudLightning, FileText, Quote } from 'lucide-react'
import { CustomLinkPreview } from './link-preview'
import { PostitShareButton } from './postit-share-button'
import { stripHtml } from '@/lib/utils'

const getConditionStr = (code: number) => {
  if (code === 0 || code === 1) return 'sunny';
  if (code === 2 || code === 3) return 'cloudy';
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 71 && code <= 77) return 'snowy';
  if (code >= 80 && code <= 82) return 'rainy';
  if (code >= 85 && code <= 86) return 'snowy';
  if (code >= 95 && code <= 99) return 'storm';
  if (code === 45 || code === 48) return 'foggy';
  return 'cloudy';
}

const getConditionDescTR = (code: number) => {
  if (code === 0) return 'Açık ve sıcak.';
  if (code === 1) return 'Güneşli hava etkili olacak.';
  if (code === 2) return 'Az bulutlu ve sıcak.';
  if (code === 3) return 'Parçalı bulutlu bir gün.';
  if (code >= 51 && code <= 67) return 'Öğleden sonra yer yer kısa süreli sağanak geçişleri bekleniyor.';
  if (code >= 71 && code <= 77) return 'Kar yağışlı bir gün.';
  if (code >= 80 && code <= 82) return 'Sağanak yağış bekleniyor.';
  if (code >= 85 && code <= 86) return 'Yoğun kar yağışlı.';
  if (code >= 95 && code <= 99) return 'Gök gürültülü sağanak geçişleri bekleniyor.';
  if (code === 45 || code === 48) return 'Yer yer yoğun sisli.';
  return 'Genellikle bulutlu.';
}

const getSuffix = (word: string) => {
  if (!word) return 'de';
  const match = word.toLocaleLowerCase('tr-TR').match(/[aıoueiöü]/g);
  const lastVowel = match ? match[match.length - 1] : 'e';
  const lastChar = word.toLocaleLowerCase('tr-TR').slice(-1);
  const isHardConsonant = ['f','s','t','k','ç','ş','h','p'].includes(lastChar);
  const isFront = ['e','i','ö','ü'].includes(lastVowel);
  if (isFront) return isHardConsonant ? 'te' : 'de';
  return isHardConsonant ? 'ta' : 'da';
};

const getWeatherUI = (weatherBg: string, iconSet: string = 'default', appearance: any = {}) => {
  if (!weatherBg) return { bg: '', icon: null, text: 'text-white', bgImage: null };
  const parts = weatherBg.split('_');
  const condition = parts[0];
  const isNight = parts.length > 1 && parts[1] === 'night';
  
  let bgColClass = "bg-slate-800";
  
  if (condition === 'sunny') {
    if (isNight) bgColClass = "bg-slate-900";
    else bgColClass = "bg-sky-500";
  } else if (condition === 'cloudy') {
    if (isNight) bgColClass = "bg-slate-800";
    else bgColClass = "bg-slate-600";
  } else if (condition === 'rainy' || condition === 'storm') {
    bgColClass = "bg-slate-700";
  } else if (condition === 'snowy' || condition === 'foggy') {
    bgColClass = "bg-slate-400";
  }
  
  const bg = `${bgColClass}`;

  const renderIcon = (defaultIcon: any, emoji: string) => {
    if (iconSet === 'emoji') {
       return <span className="text-3xl sm:text-5xl min-w-[32px] min-h-[32px] md:text-7xl leading-none drop-shadow-md flex items-center justify-center">{emoji}</span>;
    } else if (iconSet === 'animated') {
       return <span className="text-3xl sm:text-5xl min-w-[32px] min-h-[32px] md:text-7xl leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse flex items-center justify-center">{emoji}</span>;
    }
    return defaultIcon;
  };

  let bgImage = null;
  if (condition === 'sunny' && appearance?.weatherBgSunny) bgImage = appearance.weatherBgSunny;
  else if (condition === 'cloudy' && appearance?.weatherBgCloudy) bgImage = appearance.weatherBgCloudy;
  else if (condition === 'rainy' && appearance?.weatherBgRainy) bgImage = appearance.weatherBgRainy;
  else if (condition === 'snowy' && appearance?.weatherBgSnowy) bgImage = appearance.weatherBgSnowy;
  else if (condition === 'foggy' && appearance?.weatherBgFoggy) bgImage = appearance.weatherBgFoggy;
  else if ((condition === 'storm' || condition === 'stormy') && appearance?.weatherBgStormy) bgImage = appearance.weatherBgStormy;

  if (condition === 'sunny') {
    if (isNight) return { bg, text: 'text-indigo-100 drop-shadow-xl', bgImage, icon: renderIcon(<Moon className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 min-w-[32px] min-h-[32px] text-blue-100 drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]" fill="currentColor" />, '🌙') };
    return { bg, text: 'text-white drop-shadow-xl', bgImage, icon: renderIcon(<Sun className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 min-w-[32px] min-h-[32px] text-yellow-300 drop-shadow-[0_0_35px_rgba(253,224,71,1)]" fill="currentColor" />, '☀️') };
  }
  if (condition === 'cloudy') {
    if (isNight) return { bg, text: 'text-indigo-50 drop-shadow-xl', bgImage, icon: renderIcon(<Cloud className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 min-w-[32px] min-h-[32px] text-gray-200 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" fill="currentColor" />, '☁️') };
    return { bg, text: 'text-white drop-shadow-xl', bgImage, icon: renderIcon(<Cloud className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 min-w-[32px] min-h-[32px] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]" fill="currentColor" />, '⛅') };
  }
  if (condition === 'rainy') {
    if (isNight) return { bg, text: 'text-blue-100 drop-shadow-xl', bgImage, icon: renderIcon(<CloudRain className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 min-w-[32px] min-h-[32px] text-blue-200 drop-shadow-[0_0_25px_rgba(147,197,253,0.7)]" />, '🌧️') };
    return { bg, text: 'text-blue-50 drop-shadow-xl', bgImage, icon: renderIcon(<CloudRain className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 min-w-[32px] min-h-[32px] text-white drop-shadow-[0_0_30px_rgba(255,255,255,1)]" />, '🌧️') };
  }
  if (condition === 'snowy') {
    if (isNight) return { bg, text: 'text-indigo-50 drop-shadow-xl', bgImage, icon: renderIcon(<CloudSnow className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 min-w-[32px] min-h-[32px] text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]" />, '❄️') };
    return { bg, text: 'text-white drop-shadow-xl', bgImage, icon: renderIcon(<CloudSnow className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 min-w-[32px] min-h-[32px] text-white drop-shadow-[0_0_30px_rgba(255,255,255,1)]" fill="currentColor" />, '❄️') };
  }
  if (condition === 'foggy') {
    if (isNight) return { bg, text: 'text-gray-200 drop-shadow-xl', bgImage, icon: renderIcon(<CloudFog className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 min-w-[32px] min-h-[32px] text-gray-300 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />, '🌫️') };
    return { bg, text: 'text-white drop-shadow-xl', bgImage, icon: renderIcon(<CloudFog className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 min-w-[32px] min-h-[32px] text-white drop-shadow-[0_0_30px_rgba(255,255,255,1)]" fill="currentColor" />, '🌫️') };
  }
  // storm
  return { bg, text: 'text-white drop-shadow-xl', bgImage, icon: renderIcon(<CloudLightning className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 min-w-[32px] min-h-[32px] text-yellow-400 drop-shadow-[0_0_35px_rgba(250,204,21,0.9)]" />, '⛈️') };
}

const fontClasses: { [key: string]: string } = {
  HANDWRITING: 'font-handwriting',
  SERIF: 'font-serif',
  SANS: 'font-sans',
  MONO: 'font-mono',
  CURSIVE: 'font-cursive',
  SYSTEM: 'font-system',
  MODERN: 'font-modern',
  COMIC: 'font-comic',
}

interface PostIt {
  id: string
  content: string
  imageUrl?: string | null
  link?: string | null
  color: string
  font?: string
  pushpin?: string
  rotation: number
  user: {
    id: string
    name?: string | null
    email?: string | null
  }
  category: {
    id: string
    name: string
    postitAppearance?: any
  }
  createdAt: Date | string
  PostItImage?: { url: string }[]
  likesCount?: number
  hasLiked?: boolean
  views?: number
  sharesCount?: number
  comments?: any[]
  isWeather?: boolean
  weatherTemp?: number
  weatherCondition?: string
  weatherBg?: string
  weatherDaily?: any
  weatherHourly?: any
}

interface OttSliderProps {
  initialPostits: PostIt[]
  canDelete?: boolean
  currentUserId?: string
  separatorAds?: any[]
  postitAppearance?: any
  ottItemsPerRow?: number
  ottCardRatio?: string
  ottAutoScrollSpeed?: number
  ottCardStyle?: string
  ottCardBgType?: string
  ottCardBgColor?: string
  ottCardBgColorAlpha?: number
  ottCardBgImage?: string
  ottModalBgType?: string
  ottModalBgColor?: string
  ottModalBgColorAlpha?: number
  ottModalBgImage?: string
  ottModalTextColor?: string
}

// Custom hook for interval
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])
  useEffect(() => {
    if (delay !== null && delay > 0) {
      const id = setInterval(() => savedCallback.current(), delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

function OttSliderCard({ postit, getItemWidthClass, ratioStyles, ottCardStyle, canDelete, currentUserId, handleDelete, postitAppearance, ottCardBgType, ottCardBgColor, ottCardBgColorAlpha, ottCardBgImage, ottModalBgType, ottModalBgColor, ottModalBgColorAlpha, ottModalBgImage, ottModalTextColor, ottCardRatio }: any) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = postit.PostItImage?.map((img: any) => img.url) || [];
  const allImages = postit.imageUrl ? [postit.imageUrl, ...images] : images;
  
  useEffect(() => {
    if (allImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [allImages.length]);

  const currentImageUrl = allImages.length > 0 ? allImages[currentImageIndex] : null;

  const weatherUI = postit.isWeather ? getWeatherUI(postit.weatherBg || '', postitAppearance?.weatherIconSet, postitAppearance) : null;
  const cleanContent = stripHtml(postit.content);
  
  const rawBgAlpha = ottCardBgColorAlpha ?? 100;
  const processHexAlpha = (hex: string, alpha: number) => {
      if (!hex || !hex.startsWith("#")) return hex;
      if (alpha >= 100) return hex;
      // Handle comma separated for gradients
      if (hex.includes(",")) {
          return hex.split(",").map(part => {
              const p = part.trim();
              if (p.startsWith("#") && p.length === 7) return p + Math.round((alpha / 100) * 255).toString(16).padStart(2, "0");
              if (p.startsWith("#") && p.length === 9) return p.slice(0,7) + Math.round((alpha / 100) * 255).toString(16).padStart(2, "0");
              return p;
          }).join(",");
      }
      const a = Math.round((alpha / 100) * 255).toString(16).padStart(2, "0");
      return hex.substring(0,7) + a;
  };
  const finalOttCardBgColor = processHexAlpha(ottCardBgColor, rawBgAlpha);

  return (
    <div 
      className={`relative snap-center shrink-0 flex flex-col justify-start overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-transform hover:scale-[1.03] duration-300 ${ottCardStyle === 'polaroid' ? 'w-full' : getItemWidthClass()}`}
      style={{ ...ratioStyles, contentVisibility: 'auto', borderRadius: ottCardStyle === 'cover' ? '12px' : '0' }}
    >
      {ottCardStyle === 'magazine' ? (
         <div 
           className="w-full h-full relative flex flex-col overflow-hidden"
           style={{ backgroundColor: ottCardBgType === 'transparent' ? 'transparent' : (finalOttCardBgColor || '#ffffff'), borderRadius: '12px' }}
         >
             <div className="relative w-full shrink-0 overflow-hidden" style={{ aspectRatio: postit.isWeather ? '16/9' : '4/3' }}>
                 {(currentImageUrl && !currentImageUrl.match(/\.(mp4|webm|ogg)$/i)) ? (
                    <Image src={currentImageUrl} fill className={`${(postit as any).isVirtualNav ? 'object-contain p-4' : 'object-cover'} transition-transform hover:scale-105 duration-500`} alt="" unoptimized={currentImageUrl.startsWith('data:')} />
                 ) : (currentImageUrl && currentImageUrl.match(/\.(mp4|webm|ogg)$/i)) ? (
                    <video src={`${currentImageUrl}#t=0.1`} className="absolute inset-0 w-full h-full object-cover" preload="metadata" playsInline muted />
                 ) : postit.isWeather && weatherUI ? (
                    <div className={`w-full h-full flex flex-col items-center justify-center ${weatherUI.bg}`} style={{ backgroundImage: weatherUI.bgImage ? `url('${weatherUI.bgImage}')` : 'none', backgroundSize: 'cover' }}>
                        {weatherUI.icon}
                        <h3 className={`mt-2 font-bold text-lg ${weatherUI.text}`}>{postit.weatherTemp}°C {postit.content}</h3>
                    </div>
                 ) : (postit.link && allImages.length === 0) ? (
                    <div className="w-full h-full bg-black/90 pointer-events-none relative">
                        {postit.link.match(/\.(jpeg|jpg|gif|png|webp|avif)$/i) ? (
                           <Image src={postit.link} fill unoptimized={postit.link.startsWith('data:')} className={`${(postit as any).isVirtualNav ? 'object-contain p-4' : 'object-cover'}`} alt="" />
                        ) : (
                          <CustomLinkPreview url={postit.link} fill={true} hideIcon={true} />
                        )}
                    </div>
                 ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                       <span className="text-slate-300">Medya Yok</span>
                    </div>
                 )}
                 {!postit.isWeather && postit?.category?.name && (
                   <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm text-gray-800 z-10">
                      {postit.category.name}
                   </div>
                 )}
             </div>
             <div className="flex flex-col p-4 md:p-5 flex-1 overflow-hidden relative z-20" style={{ backgroundColor: ottCardBgType === 'transparent' ? 'transparent' : (finalOttCardBgColor || '#ffffff') }}>
                 <div className={`line-clamp-[5] md:line-clamp-[6] mb-2 font-bold leading-tight ${postitAppearance?.magazineTitleFont === 'london' ? 'font-london' : postitAppearance?.magazineTitleFont === 'puerto' ? 'font-puerto' : postitAppearance?.magazineTitleFont === 'retosta' ? 'font-retosta' : postitAppearance?.magazineTitleFont === 'serif' ? 'font-serif' : postitAppearance?.magazineTitleFont === 'handwriting' ? 'font-handwriting' : 'font-sans'}`}
                      style={{ 
                          color: postitAppearance?.magazineTitleColor || '#1f2937', 
                          fontSize: postitAppearance?.magazineTitleSize === '3xl' ? '1.875rem' : postitAppearance?.magazineTitleSize === '2xl' ? '1.5rem' : postitAppearance?.magazineTitleSize === 'lg' ? '1.125rem' : '1.25rem',
                          fontFamily: postitAppearance?.magazineDescFont === 'handwriting' ? '"Caveat", cursive' : undefined
                      }}
                 >
                     {cleanContent}
                 </div>
                 <div className="mt-auto flex items-center gap-3 pt-3 border-t border-gray-100">
                     {postit?.user?.image ? (
                        <Image src={postit.user.image} width={24} height={24} className="w-6 h-6 rounded-full object-cover" unoptimized={postit.user.image.startsWith('data:')} alt="" />
                     ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200" />
                     )}
                     <span className="text-xs font-semibold text-gray-500 line-clamp-1 flex-1">{postit?.user?.nickname || postit?.user?.name || 'Anonim'}</span>
                     <span className="text-[10px] font-medium text-gray-400 ml-auto whitespace-nowrap">{typeof postit.createdAt === 'string' ? new Date(postit.createdAt).toLocaleDateString('tr-TR') : postit.createdAt.toLocaleDateString('tr-TR')}</span>
                 </div>
             </div>
             <div className="absolute inset-0 z-30 cursor-pointer" onClick={() => {
                  if ((postit as any).isVirtualNav) { window.location.href = `/?category=${(postit as any).categoryTargetId}`; return; }
                  const postitBtn = document.getElementById(`postit-${postit.id}-front-cover`);
                  if (postitBtn) postitBtn.click();
             }}></div>

             <div className="hidden">
                 <PostItCard
                    postitAppearance={postitAppearance}
                    ottCardStyle={ottCardStyle}
                    id={postit.id}
                    content={postit.content}
                    detail={postit.detail}
                    imageUrl={postit.imageUrl}
                    images={postit.PostItImage?.map((img: any) => img.url) || []}
                    link={postit.link}
                    color={postit.color}
                    font={postit.font}
                    pushpin={postit.pushpin}
                    rotation={0} 
                    userName={postit?.user?.nickname || postit?.user?.name || 'Anonim'}
                    userImage={postit?.user?.image}
                    authorId={postit?.user?.id}
                    categoryName={postit?.category?.name ?? 'Genel'}
                    createdAt={postit.createdAt instanceof Date ? postit.createdAt : new Date(postit.createdAt)}
                    canDelete={postit.isWeather ? false : (canDelete ?? false)}
                    onDelete={handleDelete}
                    initialLikesCount={postit.likesCount ?? 0}
                    initialHasLiked={postit.hasLiked ?? false}
                    initialViewsCount={postit.views ?? 0}
                    initialSharesCount={postit.sharesCount ?? 0}
                    isWeather={postit.isWeather}
                    weatherTemp={postit.weatherTemp}
                    currentUserId={currentUserId}
                    ottModalBgType={ottModalBgType}
                    ottModalBgColor={ottModalBgColor}
                    ottModalBgColorAlpha={ottModalBgColorAlpha}
                    ottModalBgImage={ottModalBgImage}
                    ottModalTextColor={ottModalTextColor}
                    triggerComponent={<div id={`postit-${postit.id}-front-cover`}></div>}
                 />
             </div>
         </div>
      ) : ottCardStyle === 'polaroid' ? (() => {
         let pApp = postitAppearance || {};
         const txtColor = pApp?.textColor || '#64748b';
         const bgType = ottCardBgType;
         const bgColor = finalOttCardBgColor;
         const isTransp = bgType === 'transparent';
         const isDrk = !isTransp && bgColor && bgColor.toLowerCase() !== '#ffffff' && bgColor.toLowerCase() !== '#fff';
         
         const hasDynBorder = pApp?.ottCellBorderEnabled;
         const outBorderStyles: React.CSSProperties = hasDynBorder ? {
             borderStyle: pApp.ottCellBorderStyle || 'solid',
             borderColor: pApp.ottCellBorderColor || '#000000',
             borderWidth: pApp.ottCellBorderWidth || '1px',
             borderRadius: pApp.ottCellBorderRadius || '0px',
         } : {};

         const innerBorderCls = hasDynBorder ? '' : (isDrk || isTransp ? 'border-t border-white/5' : 'border-t border-slate-100');
         const outerBorderCls = hasDynBorder ? '' : (isDrk || isTransp ? 'rounded-xl border border-white/5' : 'rounded-xl border border-slate-100');
         
         const internalBorderStyle: React.CSSProperties = hasDynBorder ? {
             borderTopStyle: pApp.ottCellBorderStyle || 'solid',
             borderTopColor: pApp.ottCellBorderColor || '#000000',
             borderTopWidth: pApp.ottCellBorderWidth || '1px',
         } : {};
         
         return (
         <div 
           className={`absolute inset-0 flex flex-col overflow-hidden shadow-md p-4 transition-shadow hover:shadow-xl group ${outerBorderCls}`}
           style={{ backgroundColor: bgType === 'transparent' ? 'transparent' : (bgColor || '#ffffff'), ...outBorderStyles }}
         >
             <div className="relative w-full flex-1 min-h-0 overflow-hidden rounded-lg mb-4">
                 {(currentImageUrl && !currentImageUrl.match(/\.(mp4|webm|ogg)$/i)) ? (
                    <Image src={currentImageUrl} fill className={`${(postit as any).isVirtualNav ? 'object-contain p-4' : 'object-cover object-top'} transition-transform group-hover:scale-105 duration-700 scale-[1.01]`} alt="" unoptimized={currentImageUrl.startsWith('data:')} />
                 ) : (currentImageUrl && currentImageUrl.match(/\.(mp4|webm|ogg)$/i)) ? (
                    <video src={`${currentImageUrl}#t=0.1`} className="absolute inset-0 w-full h-full object-cover" preload="metadata" playsInline muted />
                 ) : postit.isWeather && weatherUI ? (
                    <div className={`w-full h-full flex flex-col items-center justify-center ${weatherUI.bg}`} style={{ backgroundImage: weatherUI.bgImage ? `url('${weatherUI.bgImage}')` : 'none', backgroundSize: 'cover' }}>
                        {weatherUI.icon}
                        <h3 className={`mt-2 font-bold text-lg ${weatherUI.text}`}>{postit.weatherTemp}°C {postit.content}</h3>
                    </div>
                 ) : (postit.link && allImages.length === 0) ? (
                    <div className="w-full h-full bg-slate-900 pointer-events-none relative">
                        {postit.link.match(/\.(jpeg|jpg|gif|png|webp|avif)$/i) ? (
                           <Image src={postit.link} fill unoptimized={postit.link.startsWith('data:')} className={`${(postit as any).isVirtualNav ? 'object-contain p-4' : 'object-cover object-top'}`} alt="" />
                        ) : (
                          <CustomLinkPreview url={postit.link} fill={true} hideIcon={true} />
                        )}
                    </div>
                 ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden ${isDrk || isTransp ? 'bg-white/5' : 'bg-black/5'}`}>
                       <Quote className={`absolute top-4 left-4 w-12 h-12 opacity-10`} style={{ color: txtColor }} />
                       <div className="text-center font-serif italic font-medium z-10 leading-snug line-clamp-4" style={{ fontSize: 'clamp(1rem, 5cqw, 1.4rem)', color: txtColor, opacity: 0.85 }}>
                          &ldquo;{cleanContent.split(/\s+/).slice(0, 15).join(' ')}{cleanContent.split(/\s+/).length > 15 ? '...' : ''}&rdquo;
                       </div>
                    </div>
                 )}
             </div>
             
             <div className="flex flex-col shrink-0 overflow-hidden relative z-40 pointer-events-none">
                 <p className="text-sm line-clamp-2 md:line-clamp-3 leading-relaxed mb-4" style={{ color: txtColor }}>
                     {cleanContent.split('\n').slice(1).join(' ') || cleanContent}
                 </p>
                 <div className={`mt-auto pt-2 flex items-center justify-between text-xs font-semibold ${innerBorderCls}`} style={{ color: pApp?.textColor ? txtColor : (isDrk || isTransp ? '#94a3b8' : '#94a3b8'), ...internalBorderStyle }}>
                     <span className="truncate pr-2">#{postit.category?.name}</span>
                     <span className="shrink-0">{typeof postit.createdAt === 'string' ? new Date(postit.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : postit.createdAt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                 </div>
                 
                 {/* Interactive Icons */}
                 {!(postit as any).isVirtualNav && (
                   <div className={`flex items-center gap-4 pointer-events-auto relative z-40 w-full mt-3 pt-2 ${innerBorderCls}`} style={{ color: pApp?.textColor ? txtColor : (isDrk || isTransp ? '#64748b' : '#475569'), ...internalBorderStyle }} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                     {!postit.isWeather && (
                         <div className="flex items-center gap-1.5">
                             <Eye className="w-6 h-6" />
                             <span className="font-medium text-sm font-sans">{postit.views || 0}</span>
                         </div>
                     )}
                     <div 
                         className={`flex items-center gap-1.5 cursor-pointer transition-colors ${postit.hasLiked ? 'text-red-500' : 'hover:opacity-80'}`}
                         onClick={(e) => { e.stopPropagation(); const btn = document.getElementById(`postit-${postit.id}-like-btn`); if(btn) btn.click(); }}
                     >
                         <Heart className={`w-6 h-6 ${postit.hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                         <span className="font-medium text-sm font-sans">{postit.likesCount || 0}</span>
                     </div>
                     {!postit.isWeather && (
                         <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900" onClick={(e) => { e.stopPropagation(); document.getElementById(`postit-${postit.id}-front-cover`)?.click(); }}>
                             <MessageSquare className="w-6 h-6" />
                             <span className="font-medium text-sm font-sans">{postit.comments?.length || 0}</span>
                         </div>
                     )}
                     <PostitShareButton 
                         postitId={postit.id} 
                         className="hover:text-slate-900 ml-1" 
                         iconClassName="w-6 h-6"
                         initialShareCount={postit.sharesCount || 0}
                     />
                     {(canDelete && !postit.isWeather) ? (
                         <button
                             onClick={(e) => { e.stopPropagation(); handleDelete(postit.id); }}
                             className="text-slate-400 hover:text-red-500 transition-colors ml-auto flex items-center justify-center p-1 hover:bg-red-50 rounded-md"
                             title="Sil"
                         >
                             <Trash2 className="w-6 h-6" />
                         </button>
                     ) : currentUserId && !postit.isWeather ? (
                         <button
                           onClick={async (e) => { 
                             e.stopPropagation(); 
                             if(window.confirm('Bu notu şikayet etmek istiyor musunuz?')) {
                               await fetch(`/api/postits/${postit.id}/report`, { method: 'POST' });
                               toast.success('Şikayetiniz alındı');
                             }
                           }}
                           className="text-slate-400 hover:text-red-500 transition-colors ml-auto flex items-center justify-center p-1 hover:bg-red-50 rounded-md"
                           title="Şikayet Et"
                         >
                           <Flag className="w-6 h-6" />
                         </button>
                     ) : null}
                 </div>
                 )}
             </div>
             <div className="absolute inset-0 z-30 cursor-pointer" onClick={() => {
                  if ((postit as any).isVirtualNav) { window.location.href = `/?category=${(postit as any).categoryTargetId}`; return; }
                  const postitBtn = document.getElementById(`postit-${postit.id}-front-cover`);
                  if (postitBtn) postitBtn.click();
             }}></div>

             <div className="hidden">
                 <PostItCard
                    postitAppearance={postitAppearance}
                    ottCardStyle={ottCardStyle}
                    id={postit.id}
                    content={postit.content}
                    detail={postit.detail}
                    imageUrl={postit.imageUrl}
                    images={postit.PostItImage?.map((img: any) => img.url) || []}
                    link={postit.link}
                    color={postit.color}
                    font={postit.font}
                    pushpin={postit.pushpin}
                    rotation={0} 
                    userName={postit?.user?.nickname || postit?.user?.name || 'Anonim'}
                    userImage={postit?.user?.image}
                    authorId={postit?.user?.id}
                    categoryName={postit?.category?.name ?? 'Genel'}
                    createdAt={postit.createdAt instanceof Date ? postit.createdAt : new Date(postit.createdAt)}
                    canDelete={postit.isWeather ? false : (canDelete ?? false)}
                    onDelete={handleDelete}
                    initialLikesCount={postit.likesCount ?? 0}
                    initialHasLiked={postit.hasLiked ?? false}
                    initialViewsCount={postit.views ?? 0}
                    initialSharesCount={postit.sharesCount ?? 0}
                    isWeather={postit.isWeather}
                    weatherTemp={postit.weatherTemp}
                    currentUserId={currentUserId}
                    ottModalBgType={ottModalBgType}
                    ottModalBgColor={ottModalBgColor}
                    ottModalBgColorAlpha={ottModalBgColorAlpha}
                    ottModalBgImage={ottModalBgImage}
                    ottModalTextColor={ottModalTextColor}
                    isVirtualNav={(postit as any).isVirtualNav}
                    triggerComponent={<div id={`postit-${postit.id}-front-cover`}></div>}
                 />
             </div>
         </div>
         );
      })() : ottCardStyle === 'cover' ? (
        <div 
          className={`w-full h-full relative ${weatherUI && (!ottCardBgType || ottCardBgType === 'postit') ? weatherUI.bg : ''}`} 
          style={{ 
            backgroundColor: (ottCardBgType === 'transparent' ? 'transparent' : ottCardBgType === 'color' ? (finalOttCardBgColor || 'transparent') : (ottCardBgType === 'gradient' || ottCardBgType === 'image') ? 'transparent' : (postit.isWeather ? 'transparent' : (postit.color === 'YELLOW' ? '#fdfd96' : postit.color === 'BLUE' ? '#a2cffe' : postit.color === 'PINK' ? '#ffb7b2' : postit.color === 'GREEN' ? '#b2e2b2' : '#fdfd96'))),
            backgroundImage: (postit.isWeather && weatherUI?.bgImage && (!ottCardBgType || ottCardBgType === 'postit')) ? `url('${weatherUI.bgImage}')` : ((ottCardBgType === 'gradient' && finalOttCardBgColor) ? `linear-gradient(to right, ${finalOttCardBgColor.split(',')[0]}, ${finalOttCardBgColor.split(',')[1] || finalOttCardBgColor.split(',')[0]}, ${finalOttCardBgColor.split(',')[2] || finalOttCardBgColor.split(',')[0]})` : ((ottCardBgType === 'image' && ottCardBgImage) ? `url('${ottCardBgImage}')` : (postit.isWeather ? undefined : ((currentImageUrl && !currentImageUrl.match(/\.(mp4|webm|ogg)$/i)) ? `url('${currentImageUrl}')` : undefined)))),
            backgroundSize: (postit.isWeather && weatherUI?.bgImage && (!ottCardBgType || ottCardBgType === 'postit')) ? 'cover' : ((ottCardBgType === 'image' && postitAppearance?.ottCardBgImageSize) ? postitAppearance.ottCardBgImageSize : ((postit as any).isVirtualNav ? 'contain' : 'cover')),
            backgroundPosition: (postit.isWeather && weatherUI?.bgImage && (!ottCardBgType || ottCardBgType === 'postit')) ? 'center' : ((ottCardBgType === 'image' && postitAppearance?.ottCardBgImagePosition) ? postitAppearance.ottCardBgImagePosition : ((postit as any).isVirtualNav ? 'center' : 'top')),
            backgroundRepeat: 'no-repeat',
            borderRadius: '12px',
            transition: 'background-image 0.5s ease-in-out'
          }}
        >
          {currentImageUrl?.match(/\.(mp4|webm|ogg)$/i) && !postit.isWeather && (
            <video
              src={`${currentImageUrl}#t=0.1`}
              className="absolute inset-0 w-full h-full object-cover object-top"
              style={{ borderRadius: '12px' }}
              preload="metadata"
              playsInline
              muted
            />
          )}
          {/* Fallback pattern if no image */}
          {(!currentImageUrl && !postit.isWeather && ottCardBgType !== 'image') && (
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }} />
          )}
          
          {/* Link Preview as Background (if exists AND NO images are attached) */}
          {(postit.link && allImages.length === 0) && (
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-black/90 pointer-events-none flex flex-col justify-center" style={{ borderRadius: '12px' }}>
              {postit.link.match(/\.(jpeg|jpg|gif|png|webp|avif)$/i) ? (
                 <Image src={postit.link} fill unoptimized={postit.link.startsWith('data:')} className={`object-cover mx-auto block`} alt="Bağlantı Görseli" />
              ) : (
                <CustomLinkPreview url={postit.link} fill={true} hideIcon={true} />
              )}
            </div>
          )}

          {/* Click overlay */}
          <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => {
                  if ((postit as any).isVirtualNav) { window.location.href = `/?category=${(postit as any).categoryTargetId}`; return; }
               const postitBtn = document.getElementById(`postit-${postit.id}-front-cover`);
               if (postitBtn) postitBtn.click();
          }}></div>

          {/* User Avatar Badge (Top Left) */}
          {!postit.isWeather && postit?.user?.image && (
            <div className="absolute top-3 left-3 z-30 pointer-events-none">
              <Image src={postit.user.image} width={40} height={40} unoptimized={postit.user.image.startsWith('data:')} alt={postit.user.nickname || postit.user.name || ''} title={postit.user.nickname || postit.user.name || ''} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white/80 shadow-md opacity-90 transition-opacity" />
            </div>
          )}

          <div 
            className={`absolute z-20 pointer-events-none flex flex-col w-full h-full ${
              postit.isWeather ? 'inset-0 justify-center items-center' :
              (allImages.length === 0 && !postit.link) 
                ? 'inset-0 justify-center items-center px-6 pb-16 pt-6 text-center bg-black/40 backdrop-blur-[2px]' 
                : 'inset-x-0 bottom-0 justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12 p-4 top-auto h-auto'
            }`} 
            style={{ 
              color: postitAppearance?.textColor || postit.textColor || 'white',
              containerType: postit.isWeather ? 'size' : 'normal', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', borderTopLeftRadius: (allImages.length === 0 && !postit.link || postit.isWeather) ? '12px' : '0', borderTopRightRadius: (allImages.length === 0 && !postit.link || postit.isWeather) ? '12px' : '0' 
            }}
          >
            {postit.isWeather && weatherUI ? (
              <div className={`flex flex-col w-full h-full justify-start items-center p-2 sm:p-4 relative z-10 w-full ${weatherUI?.bgImage ? 'bg-black/30 backdrop-blur-[2px] rounded-xl' : ''}`}>
                  <h3 className="font-bold text-center tracking-wide mb-3 drop-shadow-md text-sm sm:text-lg md:text-xl">
                    {postit.content}&apos;{getSuffix(postit.content)} Haftalık<br/>Hava Durumu Tahmini
                  </h3>
                
                {postit.weatherDaily && postit.weatherDaily.time && (
                  <div className="grid grid-cols-5 w-full h-full gap-0 sm:gap-1 drop-shadow-md mt-1">
                    {postit.weatherDaily.time.slice(0, 5).map((dateStr: string, index: number) => {
                       const dateObj = new Date(dateStr);
                       const dayNum = dateObj.getDate();
                       const monthName = dateObj.toLocaleDateString('tr-TR', { month: 'long' });
                       const dayName = dateObj.toLocaleDateString('tr-TR', { weekday: 'long' });
                       
                       const min = Math.round(postit.weatherDaily.temperature_2m_min[index]);
                       const max = Math.round(postit.weatherDaily.temperature_2m_max[index]);
                       const code = postit.weatherDaily.weather_code[index];
                       const dayStr = getConditionStr(code);
                       const dIcon = getWeatherUI(dayStr + '_day', postitAppearance?.weatherIconSet, postitAppearance).icon;
                       
                       return (
                         <div key={dateStr} className="flex flex-col items-center justify-start text-center border-r border-white/30 last:border-0 px-1 sm:px-2 w-full h-full tracking-tight">
                               <span className="font-bold leading-none text-base sm:text-xl">{dayNum}</span>
                               <span className="font-bold opacity-90 leading-tight mt-1 capitalize text-[10px] sm:text-xs">{monthName}</span>
                               <span className="font-bold opacity-90 leading-tight capitalize text-[10px] sm:text-xs">{dayName}</span>
                           
                           <div className="my-2 sm:my-3 scale-[0.4] sm:scale-[0.55] h-8 sm:h-12 flex items-center justify-center shrink-0">
                              {dIcon}
                           </div>
                           
                           <span className="font-medium opacity-90 leading-none sm:leading-tight flex-grow flex items-start justify-center mt-1 w-full text-center text-[9px] sm:text-xs">
                              {getConditionDescTR(code)}
                           </span>
                           
                           <div className="mt-auto flex flex-col items-center gap-[2px] w-full pt-2">
                             <span className="font-bold text-xs sm:text-base">{max}°C</span>
                             <span className="font-semibold opacity-80 mb-1 text-[10px] sm:text-sm">{min}°C</span>
                           </div>
                         </div>
                       )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                <p className={`font-bold drop-shadow-md leading-relaxed ${fontClasses[postitAppearance?.font || ''] || postitAppearance?.font || fontClasses[postit.font || ''] || postit.font || ''} ${
                  (allImages.length === 0 && !postit.link) 
                    ? `text-lg md:text-xl lg:text-3xl line-clamp-[8] ${(!postit.font && !postitAppearance?.font) ? 'font-handwriting' : ''} tracking-wide` 
                    : 'text-sm md:text-md lg:text-lg line-clamp-3'
                }`}>
                  {cleanContent}
                </p>
                <div className={`flex items-center justify-between w-full font-medium opacity-80 ${
                  (allImages.length === 0 && !postit.link) 
                    ? 'mt-4 text-sm tracking-widest uppercase' 
                    : 'text-xs mt-1'
                }`}>
                  <span className="truncate pr-2">#{postit.category?.name}</span>
                  <span className="shrink-0">{typeof postit.createdAt === 'string' ? new Date(postit.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : postit.createdAt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </>
            )}

            {/* Interactive Icons */}
            {!(postit as any).isVirtualNav && (
            <div className={`flex items-center gap-4 pointer-events-auto relative z-30 w-full ${
              (allImages.length === 0 && !postit.link && !postit.isWeather) 
                ? 'justify-center border-t border-white/20 pt-3 mt-6 absolute bottom-4 px-4 text-white/90' 
                : postit.isWeather ? 'justify-end pr-4 absolute bottom-4 right-0 text-white/60 drop-shadow-sm' : 'mt-3 pt-2 border-t border-white/20 text-white/90'
            }`} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
              {!postit.isWeather && (
                <div className="flex items-center gap-1.5">
                  <Eye className="w-6 h-6" />
                  <span className="font-medium text-sm font-sans">{postit.views || 0}</span>
                </div>
              )}
              <div 
                className={`flex items-center gap-1.5 cursor-pointer transition-colors ${postit.hasLiked ? 'text-red-500' : 'hover:text-red-400'}`}
                onClick={(e) => { e.stopPropagation(); const btn = document.getElementById(`postit-${postit.id}-like-btn`); if(btn) btn.click(); }}
              >
                <Heart className={`w-6 h-6 ${postit.hasLiked ? 'fill-red-500' : ''}`} />
                <span className="font-medium text-sm font-sans">{postit.likesCount || 0}</span>
              </div>
              {!postit.isWeather && (
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-white" onClick={(e) => { e.stopPropagation(); document.getElementById(`postit-${postit.id}-front-cover`)?.click(); }}>
                  <MessageSquare className="w-6 h-6" />
                  <span className="font-medium text-sm font-sans">{postit.comments?.length || 0}</span>
                </div>
              )}
              <PostitShareButton 
                postitId={postit.id} 
                className="hover:text-white ml-1" 
                iconClassName="w-6 h-6"
                initialShareCount={postit.sharesCount || 0}
              />
              {(canDelete && !postit.isWeather) ? (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(postit.id); }}
                  className="ml-auto text-white/70 hover:text-red-500 transition-colors"
                  title="Sil"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              ) : currentUserId && !postit.isWeather ? (
                <button
                  onClick={async (e) => { 
                    e.stopPropagation(); 
                    if(window.confirm('Bu notu şikayet etmek istiyor musunuz?')) {
                      await fetch(`/api/postits/${postit.id}/report`, { method: 'POST' });
                      toast.success('Şikayetiniz alındı');
                    }
                  }}
                  className="ml-auto text-white/70 hover:text-red-400 transition-colors"
                  title="Şikayet Et"
                >
                  <Flag className="w-6 h-6" />
                </button>
              ) : null}
            </div>
           )}
          </div>
          {/* Hidden real PostItCard to keep the exact same functional click trigger modal / likes sync functionality active */}
          <div className="hidden flex-1">
            <PostItCard
                postitAppearance={postitAppearance}
                ottCardStyle={ottCardStyle}
                id={postit.id}
                content={postit.content}
                detail={postit.detail}
                imageUrl={postit.imageUrl}
                images={postit.PostItImage?.map((img: any) => img.url) || []}
                link={postit.link}
                color={postit.color}
                font={postit.font}
                pushpin={postit.pushpin}
                rotation={0} 
                userName={postit?.user?.nickname || postit?.user?.name || 'Anonim'}
                userImage={postit?.user?.image}
                authorId={postit?.user?.id}
                categoryName={postit?.category?.name ?? 'Genel'}
                createdAt={postit.createdAt instanceof Date ? postit.createdAt : new Date(postit.createdAt)}
                canDelete={postit.isWeather ? false : (canDelete ?? false)}
                onDelete={handleDelete}
                initialLikesCount={postit.likesCount ?? 0}
                initialHasLiked={postit.hasLiked ?? false}
                initialViewsCount={postit.views ?? 0}
                initialSharesCount={postit.sharesCount ?? 0}
                isWeather={postit.isWeather}
                weatherTemp={postit.weatherTemp}
                weatherCondition={postit.weatherCondition}
                weatherBg={postit.weatherBg}
                weatherDaily={postit.weatherDaily}
                weatherHourly={postit.weatherHourly}
                currentUserId={currentUserId}
                isLarge={false}
                comments={postit.comments}
                ottModalBgType={ottModalBgType}
                ottModalBgColor={ottModalBgColor}
                ottModalBgColorAlpha={ottModalBgColorAlpha}
                ottModalBgImage={ottModalBgImage}
                ottModalTextColor={ottModalTextColor}
                ottCardRatio={ottCardRatio}
                textColor={postit.textColor}
                textSize={postit.textSize}
                isVirtualNav={(postit as any).isVirtualNav}
                triggerComponent={<div id={`postit-${postit.id}-front-cover`}></div>}
            />
          </div>
        </div>
      ) : (
        <div 
          className={`w-full h-full p-2 rounded-xl overflow-hidden ${weatherUI && (!ottCardBgType || ottCardBgType === 'postit') ? weatherUI.bg : ''}`} 
          style={{ 
            backgroundColor: (ottCardBgType === 'transparent' ? 'transparent' : ottCardBgType === 'color' ? (finalOttCardBgColor || 'transparent') : (ottCardBgType === 'gradient' || ottCardBgType === 'image') ? 'transparent' : (postit.isWeather ? 'transparent' : (postit.color === 'YELLOW' ? '#fdfd96' : postit.color === 'BLUE' ? '#a2cffe' : postit.color === 'PINK' ? '#ffb7b2' : postit.color === 'GREEN' ? '#b2e2b2' : '#fdfd96'))),
            backgroundImage: (ottCardBgType === 'gradient' && finalOttCardBgColor) ? `linear-gradient(to right, ${finalOttCardBgColor.split(',')[0]}, ${finalOttCardBgColor.split(',')[1] || finalOttCardBgColor.split(',')[0]}, ${finalOttCardBgColor.split(',')[2] || finalOttCardBgColor.split(',')[0]})` : ((ottCardBgType === 'image' && ottCardBgImage) ? `url(${ottCardBgImage})` : undefined),
            backgroundSize: (ottCardBgType === 'image' && postitAppearance?.ottCardBgImageSize) ? postitAppearance.ottCardBgImageSize : 'cover',
            backgroundPosition: (ottCardBgType === 'image' && postitAppearance?.ottCardBgImagePosition) ? postitAppearance.ottCardBgImagePosition : 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
            <div className="w-full h-full scale-[0.95] transform origin-top-left pointer-events-none" style={{ willChange: 'transform' }}>
               <PostItCard
                  postitAppearance={postitAppearance}
                  ottCardStyle={ottCardStyle}
                  id={postit.id}
                  content={postit.content}
                  detail={postit.detail}
                  imageUrl={postit.imageUrl}
                  images={postit.PostItImage?.map((img: any) => img.url) || []}
                  link={postit.link}
                  color={postit.color}
                  font={postit.font}
                  pushpin={postit.pushpin}
                  rotation={0} 
                  userName={postit?.user?.nickname || postit?.user?.name || 'Anonim'}
                  authorId={postit?.user?.id}
                  categoryName={postit?.category?.name ?? 'Genel'}
                  createdAt={postit.createdAt instanceof Date ? postit.createdAt : new Date(postit.createdAt)}
                  canDelete={postit.isWeather ? false : (canDelete ?? false)}
                  onDelete={handleDelete}
                  initialLikesCount={postit.likesCount ?? 0}
                  initialHasLiked={postit.hasLiked ?? false}
                  initialViewsCount={postit.views ?? 0}
                  initialSharesCount={postit.sharesCount ?? 0}
                  isWeather={postit.isWeather}
                  weatherTemp={postit.weatherTemp}
                  weatherCondition={postit.weatherCondition}
                  weatherBg={postit.weatherBg}
                  weatherDaily={postit.weatherDaily}
                  weatherHourly={postit.weatherHourly}
                  currentUserId={currentUserId}
                  isLarge={false}
                  comments={postit.comments}
                  ottModalBgType={ottModalBgType}
                  ottModalBgColor={ottModalBgColor}
                  ottModalBgColorAlpha={ottModalBgColorAlpha}
                  ottModalBgImage={ottModalBgImage}
                  ottModalTextColor={ottModalTextColor}
                  ottCardRatio={ottCardRatio}
                  textColor={postit.textColor}
                  textSize={postit.textSize}
                  triggerComponent={<div id={`postit-${postit.id}-front-cover`}></div>}
                />
            </div>
            {/* Click overlay */}
            <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => {
                  if ((postit as any).isVirtualNav) { window.location.href = `/?category=${(postit as any).categoryTargetId}`; return; }
                 const postitBtn = document.getElementById(`postit-${postit.id}-front-cover`);
                 if (postitBtn) postitBtn.click();
            }}></div>
        </div>
      )}
    </div>
  );
}

export function OttSlider({ 
  initialPostits, 
  canDelete, 
  currentUserId, 
  postitAppearance,
  ottItemsPerRow = 4,
  ottCardRatio = '16/9',
  ottAutoScrollSpeed = 0,
  ottCardStyle = 'cover',
  ottCardBgType = 'postit',
  ottCardBgColor,
  ottCardBgColorAlpha,
  ottCardBgImage,
  ottModalBgType,
  ottModalBgColor,
  ottModalBgColorAlpha,
  ottModalBgImage,
  ottModalTextColor
}: OttSliderProps) {
  const [postits, setPostits] = useState<PostIt[]>(initialPostits)
  const isHoveredRef = useRef(false)
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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
      if (!response.ok) throw new Error('Kaldırma işlemi başarısız')
      setPostits(prev => prev.filter(p => p.id !== id))
      toast.success('Post-it yayından kaldırıldı')
    } catch (error) {
      toast.error('Silme işlemi başarısız oldu')
    }
  }

  // Auto scroll logic
  useInterval(() => {
    if (!isHoveredRef.current && scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 300
      
      // If reached end, go back to start
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        scrollContainerRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' })
      }
    }
  }, ottAutoScrollSpeed > 0 ? (ottAutoScrollSpeed > 50 ? ottAutoScrollSpeed : ottAutoScrollSpeed * 1000) : null)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 300
      scrollContainerRef.current.scrollBy({ left: -itemWidth * 2, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 300
      scrollContainerRef.current.scrollBy({ left: itemWidth * 2, behavior: 'smooth' })
    }
  }

  if (postits.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-center w-full">
        <div>
          <p className="text-xl text-gray-400 font-semibold mb-2">Bu bölümde henüz içerik yok</p>
          <p className="text-sm text-gray-500">İlk notu ekleyerek bu panoyu doldurabilirsiniz!</p>
        </div>
      </div>
    )
  }

  // Parse width mapping based on items per row for normal horizontal slider
  const getItemWidthClass = () => {
    if (ottItemsPerRow === 1) return 'min-w-[90vw] md:min-w-[100%]'
    if (ottItemsPerRow === 2) return 'min-w-[80vw] sm:min-w-[45%] md:min-w-[48%]'
    if (ottItemsPerRow === 3) return 'min-w-[75vw] sm:min-w-[40%] md:min-w-[32%]'
    if (ottItemsPerRow === 4) return 'min-w-[70vw] sm:min-w-[40%] md:min-w-[24%]'
    if (ottItemsPerRow === 5) return 'min-w-[65vw] sm:min-w-[30%] md:min-w-[19%]'
    if (ottItemsPerRow === 6) return 'min-w-[60vw] sm:min-w-[25%] md:min-w-[15.5%]'
    return 'min-w-[70vw] sm:min-w-[40%] md:min-w-[24%]' // default 4
  }

  // Map items per row to grid cols for polaroid view
  const getGridColsClass = () => {
    if (ottItemsPerRow === 1) return 'grid-cols-1'
    if (ottItemsPerRow === 2) return 'grid-cols-1 sm:grid-cols-2'
    if (ottItemsPerRow === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    if (ottItemsPerRow === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    if (ottItemsPerRow === 5) return 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5'
    if (ottItemsPerRow === 6) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  }

  // Build aspect ratio class
  const ratioStyles: React.CSSProperties = {}
  if (ottCardRatio) {
    if (ottCardRatio.includes('/')) {
      const [w, h] = ottCardRatio.split('/').map(Number)
      if (ottCardStyle === 'polaroid' && !isNaN(w) && !isNaN(h)) {
        ratioStyles.aspectRatio = `${w}/${h * 1.5}`
      } else {
        ratioStyles.aspectRatio = ottCardRatio
      }
    } else {
      ratioStyles.aspectRatio = ottCardStyle === 'polaroid' ? '16/13.5' : '16/9'
    }
  } else if (ottCardStyle === 'polaroid') {
    ratioStyles.aspectRatio = '16/13.5'
  }

  return (
    <div 
      className="relative w-full pt-1 pb-2 group"
      onMouseEnter={() => { isHoveredRef.current = true }}
      onMouseLeave={() => { isHoveredRef.current = false }}
    >
      {ottCardStyle !== 'polaroid' && postits.length > 1 && (
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-r-md backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      <div 
        ref={scrollContainerRef}
        className={ottCardStyle === 'polaroid'
          ? `grid w-full gap-4 md:gap-6 px-4 pb-12 mx-auto ${getGridColsClass()}`
          : `flex overflow-x-auto hide-scrollbar gap-4 px-4 pb-4 snap-x snap-mandatory will-change-scroll scroll-smooth`
        }
        style={ottCardStyle !== 'polaroid' ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : undefined}
      >
        {postits.map((postit) => (
          <OttSliderCard
            key={postit.id}
            postit={postit}
            getItemWidthClass={getItemWidthClass}
            ratioStyles={ratioStyles}
            ottCardStyle={ottCardStyle}
            canDelete={canDelete}
            currentUserId={currentUserId}
            handleDelete={handleDelete}
            postitAppearance={postitAppearance}
            ottCardBgType={ottCardBgType}
            ottCardBgColor={ottCardBgColor}
            ottCardBgColorAlpha={ottCardBgColorAlpha}
            ottCardBgImage={ottCardBgImage}
            ottModalBgType={ottModalBgType}
            ottModalBgColor={ottModalBgColor}
            ottModalBgColorAlpha={ottModalBgColorAlpha}
            ottModalBgImage={ottModalBgImage}
            ottModalTextColor={ottModalTextColor}
            ottCardRatio={ottCardRatio}
          />
        ))}
      </div>

      {ottCardStyle !== 'polaroid' && postits.length > 1 && (
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-l-md backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight size={32} />
        </button>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  )
}
