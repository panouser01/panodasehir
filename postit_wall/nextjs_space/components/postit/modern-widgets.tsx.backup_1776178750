'use client'

import React, { useEffect, useState } from 'react'
import { CloudSun, Wind, Droplets, Plus, ChevronRight, Cloud, CloudRain, CloudSnow, CloudFog, CloudLightning, Sun, Moon } from 'lucide-react'
import { EczanePopup } from './eczane-popup'

// Hava Durumu kodlarını simgelere çeviren yardımcı fonksiyon
function getWeatherIcon(code: number, isDay: boolean, className: string) {
  if (code === 0) return isDay ? <Sun className={className} /> : <Moon className={className} />
  if (code >= 1 && code <= 3) return isDay ? <CloudSun className={className} /> : <Cloud className={className} />
  if (code >= 45 && code <= 48) return <CloudFog className={className} />
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain className={className} />
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return <CloudSnow className={className} />
  if (code >= 95 && code <= 99) return <CloudLightning className={className} />
  return <CloudSun className={className} />
}

function getWeatherText(code: number) {
  if (code === 0) return 'Açık'
  if (code === 1) return 'Çoğunlukla Açık'
  if (code === 2) return 'Parçalı Bulutlu'
  if (code === 3) return 'Çok Bulutlu'
  if (code >= 45 && code <= 48) return 'Sisli'
  if (code >= 51 && code <= 67) return 'Yağmurlu'
  if (code >= 71 && code <= 77) return 'Karlı'
  if (code >= 95 && code <= 99) return 'Fırtınalı'
  return 'Genellikle Bulutlu'
}

import { CalendarPopup } from './calendar-popup'

interface ModernWidgetsProps {
  dailyData?: any;
  popupBg?: string;
}

export function ModernWidgets({ dailyData, popupBg }: ModernWidgetsProps) {
  const [weather, setWeather] = useState<{ temp: number, text: string, code: number, isDay: boolean, wind: number, humidity: number } | null>(null)

  // İzmir Coordinates (Default fallback)
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=38.4127&longitude=27.1384&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&timezone=auto')
      .then(res => res.json())
      .then(data => {
        if (data && data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            text: getWeatherText(data.current.weather_code),
            code: data.current.weather_code,
            isDay: data.current.is_day === 1,
            wind: data.current.wind_speed_10m,
            humidity: data.current.relative_humidity_2m
          })
        }
      })
      .catch(e => console.error(e))
  }, [])

  const today = new Date()
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
  const months = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK']

  return (
    <div className="flex flex-col gap-2 md:gap-4 w-full h-full max-w-[320px] shrink-0 font-sans mx-auto">
      
      {/* Calendar Block */}
      <CalendarPopup dailyData={dailyData || []} backgroundImage={popupBg}>
        <div 
          className="relative overflow-hidden rounded-[12px] md:rounded-[20px] shadow-lg flex flex-col cursor-pointer transition-transform hover:scale-[1.02] border border-white/5"
          style={{ background: '#131b2f' }}
        >
          <div className="bg-gradient-to-r from-red-600 to-pink-600 p-2 md:p-4 pb-1 md:pb-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 md:w-24 md:h-24 bg-white/10 rounded-full translate-x-4 -translate-y-4 md:translate-x-8 md:-translate-y-8 blur-lg"></div>
            <div className="text-white/90 text-[10px] md:text-xs font-bold tracking-widest">{months[today.getMonth()]} {today.getFullYear()}</div>
            <div className="text-white text-[10px] md:text-sm opacity-90">{days[today.getDay()]}</div>
          </div>
          
          <div className="p-2 md:p-4 pt-1 md:pt-2 flex items-center justify-between">
            <div className="text-3xl md:text-6xl font-black text-white tracking-tighter" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {today.getDate()}
            </div>
            <div className="text-right text-[10px] md:text-sm">
              <div className="text-gray-400 font-medium">Bugün</div>
              <div className="text-white font-bold opacity-90">{dailyData ? dailyData.length : 0} etkinlik</div>
            </div>
          </div>
        </div>
      </CalendarPopup>

      {/* Weather Block */}
      <div 
        className="relative overflow-hidden rounded-[12px] md:rounded-[20px] shadow-lg flex flex-col cursor-pointer transition-transform hover:scale-[1.02] border border-white/5"
        style={{ background: '#131b2f' }}
        onClick={() => window.location.href = '/?category=cmnf3wp0x0009m1lqsq7j87yh&from=root'}
      >
        <div className="bg-gradient-to-br from-indigo-700 via-blue-800 to-purple-800 p-2 md:p-4 pb-0 relative overflow-hidden h-12 md:h-20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="text-white/90 text-[9px] md:text-xs font-bold tracking-widest uppercase">İZMİR</div>
              <div className="text-indigo-100 text-[10px] md:text-sm mt-0.5">{weather ? weather.text : 'Yükleniyor...'}</div>
            </div>
            {weather && getWeatherIcon(weather.code, weather.isDay, "w-5 h-5 md:w-8 md:h-8 text-white drop-shadow-md")}
          </div>
        </div>
        
        <div className="p-2 md:p-4 pt-1 flex flex-col">
          <div className="text-2xl md:text-[3.5rem] font-black text-white tracking-tighter leading-none flex items-start">
            {weather ? weather.temp : '--'}
            <span className="text-sm md:text-2xl mt-0.5 md:mt-2 ml-1 md:ml-1 text-gray-300 font-normal">°C</span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-4 text-[9px] md:text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1 md:gap-1.5">
              <Wind className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span>{weather ? weather.wind : '--'} km/s</span>
            </div>
            <div className="flex items-center gap-1 md:gap-1.5">
              <Droplets className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span>%{weather ? weather.humidity : '--'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pharmacies Block */}
      <EczanePopup>
        <button 
          className="relative overflow-hidden rounded-[12px] md:rounded-[20px] shadow-lg p-2 md:p-4 flex items-center justify-between cursor-pointer transition-transform hover:scale-[1.02] border border-white/5 group bg-[#131b2f]"
          style={{ background: '#131b2f' }}
        >
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-6 h-6 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
              <div className="w-3.5 h-3.5 md:w-6 md:h-6 bg-rose-600 rounded-[4px] md:rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(225,29,72,0.6)]">
                <Plus className="w-2 h-2 md:w-4 md:h-4 text-white stroke-[3px]" />
              </div>
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-[10px] md:text-sm">Eczaneler</div>
              <div className="text-slate-400 text-[9px] md:text-xs mt-0.5">Nöbetçi bul</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-slate-500 group-hover:text-white transition-colors" />
        </button>
      </EczanePopup>

    </div>
  )
}
