'use client'

import { CloudSun } from 'lucide-react'

export function HavaDurumuShortcut({ mobile }: { mobile?: boolean }) {
  const scrollToWeather = () => {
    // Kullanıcının belirttiği direkt linke yönlendir
    window.location.href = '/?category=cmnf3wp0x0009m1lqsq7j87yh&from=root';
  }

  if (mobile) {
    return (
      <button 
        onClick={scrollToWeather} 
        className="flex items-center gap-1.5 ml-3 transition-transform duration-300 hover:scale-[1.03] opacity-90 hover:opacity-100 cursor-pointer border-none bg-transparent"
      >
        <div className="bg-white/20 p-1 rounded-sm backdrop-blur-sm shadow-sm flex items-center justify-center">
          <CloudSun className="w-5 h-5 text-white" />
        </div>
        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wide text-white drop-shadow-md" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}>Hava Durumu</span>
      </button>
    )
  }

  return (
    <button 
      onClick={scrollToWeather} 
      className="block mt-0.5 transition-transform duration-300 hover:scale-[1.05] hover:drop-shadow-sm opacity-95 hover:opacity-100 cursor-pointer border-none bg-transparent p-0" 
      title="Hava Durumu Duvarına Git"
    >
      <div className="bg-red-600 p-1 rounded-sm shadow-md flex items-center justify-center h-7 w-auto px-2">
        <CloudSun className="w-3.5 h-3.5 text-white mr-1.5 drop-shadow-sm" />
        <span className="text-[10px] font-bold text-white uppercase tracking-wider leading-none pt-0.5">Hava Durumu</span>
      </div>
    </button>
  )
}
