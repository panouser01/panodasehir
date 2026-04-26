'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  try {
    const str = url.trim();
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
    const match = str.match(regExp);
    if (match && match[2] && match[2].length >= 10) {
      return match[2];
    }
  } catch (e) {
    return null;
  }
  return null;
}

function extractInstagramPath(url: string): string | null {
  if (!url) return null;
  try {
    const parsedUrl = new URL(url.trim());
    if (parsedUrl.hostname.toLowerCase().includes('instagram.com')) {
      return url.trim();
    }
  } catch (e) {
    if (url.includes('instagram.com')) return url.trim();
  }
  return null;
}

function InstagramEmbedScript({ url }: { url: string }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!(window as any).instgrm) {
        const s = document.createElement('script');
        s.async = true;
        s.src = '//www.instagram.com/embed.js';
        document.body.appendChild(s);
      } else {
        setTimeout(() => {
          (window as any).instgrm?.Embeds?.process();
        }, 100);
      }
    }
  }, [url]);

  return (
    <blockquote
      className="instagram-media w-full"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{
        background: '#FFF',
        border: '0',
        borderRadius: '3px',
        boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
        margin: '1px',
        maxWidth: '100%',
        minWidth: '200px',
        padding: '0',
        width: '99.375%',
      }}
    >
      <div className="p-4 text-center text-sm text-gray-400">Instagram yükleniyor...</div>
    </blockquote>
  );
}

function InstagramScaledFallback({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // The base internal minWidth of Instagram embeds is ~326px.
        // We calculate precisely what float scale multiplier maps 326px to our cell's exact width.
        const ratio = entry.contentRect.width / 326;
        setScale(ratio > 1 ? 1 : ratio); // Avoid scaling UP if the cell is somehow huge.
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-white rounded-lg overflow-hidden relative shadow-sm border border-gray-200 pointer-events-none flex items-center justify-center"
    >
       <div 
         className="w-[326px] shrink-0 bg-white flex items-start justify-center"
         style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
       >
           <InstagramEmbedScript url={url} />
       </div>
       {/* Overlay to ensure nothing intercepts internal frames */}
       <div className="absolute inset-0 z-20"></div>
    </div>
  );
}

function extractGoogleMapsQuery(url: string): string | null {
  if (!url) return null;
  if (!url.toLowerCase().includes('google.com/maps') && !url.toLowerCase().includes('goo.gl/maps') && !url.toLowerCase().includes('maps.app.goo.gl')) return null;
  try {
    const parsed = new URL(url);
    const q = parsed.searchParams.get('q') || parsed.searchParams.get('query');
    if (q) return q;
    const placeMatch = parsed.pathname.match(/\/place\/([^\/]+)/);
    if (placeMatch && placeMatch[1]) return placeMatch[1];
    const coordMatch = parsed.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) return `${coordMatch[1]},${coordMatch[2]}`;
  } catch (e) {}
  return null;
}

export function CustomLinkPreview({ url, compact = false, fill = false, hideIcon = false }: { url: string, compact?: boolean, fill?: boolean, hideIcon?: boolean }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const videoId = extractYoutubeId(url);
  const isYoutube = !!videoId;
  
  const instagramPath = extractInstagramPath(url);
  const isInstagram = !!instagramPath;

  const googleMapQuery = extractGoogleMapsQuery(url);
  const isGoogleMaps = !!googleMapQuery;

  useEffect(() => {
    if (!url || isYoutube || isGoogleMaps || (isInstagram && !fill)) {
      setLoading(false);
      return;
    }
    const fetchMetadata = async () => {
      try {
        setLoading(true)
        const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`)
        const result = await res.json()
        if (result.status === 'success' && result.data) {
          setData(result.data)
        }
      } catch (err) {
        console.error('Failed to fetch link preview', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMetadata()
  }, [url, isYoutube, isInstagram])

  if (isGoogleMaps && googleMapQuery) {
    if (fill) {
      return (
        <div className="w-full h-full bg-gray-100 overflow-hidden relative group flex items-center justify-center">
          <iframe
            className="absolute inset-0 w-full h-full pointer-events-none"
            src={`https://maps.google.com/maps?q=${googleMapQuery}&output=embed`}
            title="Google Maps Location"
          />
        </div>
      )
    }
    if (compact) {
      return (
        <div className="w-full bg-gray-100 rounded-lg overflow-hidden h-[150px] sm:min-h-[120px] relative border border-gray-200 shadow hover:shadow-md transition-all">
           <iframe
             className="absolute top-0 left-0 w-full h-full pointer-events-none"
             src={`https://maps.google.com/maps?q=${googleMapQuery}&output=embed`}
             title="Google Maps Location"
           />
        </div>
      )
    }
    return (
      <div className="w-full bg-gray-100 rounded-lg overflow-hidden relative shadow-md border border-gray-200 group aspect-video">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          style={{ pointerEvents: 'auto' }}
          src={`https://maps.google.com/maps?q=${googleMapQuery}&output=embed`}
          title="Google Maps Location"
        />
      </div>
    )
  }

  if (isYoutube && videoId) {
    if (fill) {
      return (
        <div className="w-full h-full bg-black overflow-hidden relative group flex items-center justify-center">
          <Image 
            src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`} 
            fill
            unoptimized={true} // external dynamic domains might crash if unexpected, so we just use fill for layout stability initially, but let's actually optimize it:
            alt="YouTube Thumbnail" 
            className="absolute inset-0 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <div className="w-16 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg z-10 opacity-90 group-hover:opacity-100 transition-all group-hover:scale-110">
             <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
          </div>
        </div>
      )
    }
    if (compact) {
      return (
        <div className="w-full bg-black rounded-lg overflow-hidden h-[150px] sm:min-h-[120px] relative border border-gray-200 shadow hover:shadow-md transition-all">
           <iframe
             className="absolute top-0 left-0 w-full h-full pointer-events-none"
             src={`https://www.youtube.com/embed/${videoId}?rel=0`}
             title="YouTube Video"
             allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
             allowFullScreen
           />
        </div>
      )
    }
    const isShort = url.includes('/shorts/') || url.includes('/reel/') || url.includes('tiktok.com');

    if (isShort) {
      return (
        <div className="mx-auto bg-black rounded-lg overflow-hidden relative shadow-md border border-gray-200 group h-[60vh] md:h-[70vh] aspect-[9/16]">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            style={{ pointerEvents: 'auto' }}
            src={`https://www.youtube.com/embed/${videoId}?rel=0`}
            title="YouTube Video"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }

    return (
      <div className="w-full bg-black rounded-lg overflow-hidden relative shadow-md border border-gray-200 group aspect-video">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          style={{ pointerEvents: 'auto' }}
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title="YouTube Video"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  if (isInstagram && instagramPath) {
    if (fill) {
      if (loading) {
        return <div className="w-full h-full bg-gray-100/50 animate-pulse flex overflow-hidden pointer-events-none" />
      }
      if (data?.image?.url) {
        return (
          <div className="w-full h-full bg-black overflow-hidden relative group flex items-center justify-center">
            <Image 
              src={data.image.url} 
              fill
              unoptimized={data.image.url.startsWith('data:')}
              alt="Instagram Thumbnail" 
              className="absolute inset-0 object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
            />
            {!hideIcon && (
              <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center shadow-lg z-10 opacity-90 group-hover:opacity-100 transition-all group-hover:scale-110">
                 <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </div>
            )}
          </div>
        )
      }
      // Fallback robust embed for OTT if Microlink fails to scrape image
      return <InstagramScaledFallback url={instagramPath} />
    }
    if (compact) {
      return (
        <div className="mx-auto bg-white rounded-lg overflow-hidden relative shadow-sm border border-gray-200 group flex flex-col items-center justify-start overflow-y-auto custom-scrollbar pointer-events-none h-[450px]">
           <InstagramEmbedScript url={instagramPath} />
        </div>
      )
    }
    return (
      <div className="mx-auto bg-white rounded-lg overflow-hidden w-[326px] max-w-full relative shadow-sm border border-gray-200 group flex flex-col items-center justify-start overflow-hidden" style={{ pointerEvents: 'auto' }}>
        <InstagramEmbedScript url={instagramPath} />
      </div>
    )
  }

  if (loading) {
    if (fill) {
      return (
        <div className="w-full h-full bg-gray-100/50 animate-pulse flex overflow-hidden pointer-events-none" />
      )
    }
    return compact ? (
      <div className="w-full bg-gray-100/50 animate-pulse rounded-md flex h-[80px] overflow-hidden border border-white/10">
        <div className="w-[100px] h-full shrink-0 bg-gray-200/50" />
        <div className="p-3 flex-1 flex flex-col justify-center">
          <div className="w-full h-3 bg-gray-200/50 rounded mb-2" />
          <div className="w-1/2 h-2 bg-gray-200/50 rounded" />
        </div>
      </div>
    ) : (
      <div className="w-full bg-gray-100/50 animate-pulse rounded-md flex flex-col min-h-[120px] rounded-lg overflow-hidden border border-white/10">
        <div className="w-full h-[200px] bg-gray-200/50" />
        <div className="p-3">
          <div className="w-3/4 h-4 bg-gray-200/50 rounded mb-2" />
          <div className="w-1/2 h-3 bg-gray-200/50 rounded" />
        </div>
      </div>
    )
  }

  if (!data) {
    if (fill) return null;
    // Fallback simple link
    if (compact) {
      return (
        <div className="flex items-center gap-1.5 text-blue-500 hover:text-blue-700 underline text-sm py-2 px-3">
          <ExternalLink className="w-4 h-4" />
          <span className="truncate cursor-pointer">{url}</span>
        </div>
      )
    }
    return (
      <a href={url} target={(url.includes('panodasehir.com') || url.startsWith('/')) ? '_self' : '_blank'} rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-500 hover:text-blue-700 underline text-sm py-2 px-3">
        <ExternalLink className="w-4 h-4" />
        <span className="truncate">{url}</span>
      </a>
    )
  }

  // Extract fields
  const imageUrl = data.image?.url ?? data.logo?.url ?? ''
  const title = data.title ?? url
  const publisher = data.publisher ?? ''
  const description = data.description ?? ''

  if (fill) {
    return (
       <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden pointer-events-none">
          {imageUrl ? (
            <Image src={imageUrl} width={600} height={400} unoptimized={imageUrl.startsWith('data:')} alt={title || 'Link Preview'} className="w-full h-full object-cover" />
          ) : (
            <ExternalLink className="w-8 h-8 text-gray-400" />
          )}
       </div>
    )
  }

  if (compact) {
    return (
      <div 
        className="flex w-full bg-white text-gray-800 rounded-lg overflow-hidden border border-gray-200 shadow hover:shadow-md transition-all hover:bg-gray-50 group min-h-[70px] max-h-[100px] cursor-pointer"
      >
        {imageUrl && (
          <div className="w-[100px] sm:w-[120px] h-auto shrink-0 relative bg-black/5 overflow-hidden">
            <Image 
              src={imageUrl} 
              fill
              unoptimized={imageUrl.startsWith('data:')}
              alt={title} 
              className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          </div>
        )}
        <div className="p-3 flex-1 flex flex-col justify-center gap-1 overflow-hidden pointer-events-none">
          <p className="font-bold text-[13px] leading-tight line-clamp-2 text-gray-900">
            {title}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 px-0.5">
            {data.logo?.url ? (
              <img src={data.logo.url} alt="Logo" className="w-3.5 h-3.5 rounded-sm object-contain" />
            ) : (
              <ExternalLink className="w-3 h-3 text-gray-400" />
            )}
            <span className="text-[10px] items-center font-medium text-gray-500 uppercase tracking-wider truncate">
              {publisher || (tryGetHostname(url))}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <a 
      href={url} 
      target={(url.includes('panodasehir.com') || url.startsWith('/')) ? '_self' : '_blank'} 
      rel="noopener noreferrer" 
      className="block w-full bg-white text-gray-800 rounded-lg overflow-hidden border border-gray-200 shadow hover:shadow-md transition-shadow group no-underline"
    >
      {imageUrl && (
        <div className="w-full max-h-[350px] relative bg-gradient-to-b from-black/5 to-black/10 overflow-hidden flex justify-center items-center">
          <Image 
            src={imageUrl} 
            width={800}
            height={600}
            unoptimized={imageUrl.startsWith('data:')}
            style={{ width: '100%', height: 'auto', maxHeight: '350px' }}
            alt={title} 
            className="object-contain group-hover:scale-105 transition-transform duration-500 block" 
          />
        </div>
      )}
      <div className="p-3.5 bg-white flex flex-col gap-1.5 border-t border-gray-100">
        <p className="font-bold text-[15px] leading-tight line-clamp-2 text-gray-900">
          {title}
        </p>
        {description && (
          <p className="text-[13px] leading-snug line-clamp-2 text-gray-600">
            {description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1 px-1">
          {data.logo?.url ? (
            <img src={data.logo.url} alt="Logo" className="w-4 h-4 rounded-sm object-contain" />
          ) : (
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          )}
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider truncate">
            {publisher || (tryGetHostname(url))}
          </span>
        </div>
      </div>
    </a>
  )
}
function tryGetHostname(url: string) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}
