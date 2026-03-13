'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar as CalendarIcon, MapPin } from 'lucide-react'

interface CalendarPopupProps {
    children: React.ReactNode;
    dailyData: {
        categoryName: string;
        content: string;
        isWallSpecific?: boolean;
    }[];
    backgroundImage?: string | null;
}

export function CalendarPopup({ children, dailyData, backgroundImage }: CalendarPopupProps) {
    const [isOpen, setIsOpen] = useState(false)

    const dateStr = new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date());

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent
                className="max-w-md w-11/12 p-0 overflow-hidden border-0 shadow-2xl bg-white/95 rounded-xl"
                style={{
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className={`p-6 ${backgroundImage ? 'bg-black/10' : ''} max-h-[85vh] overflow-y-auto custom-scrollbar`}>
                    <DialogHeader className="mb-6">
                        <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900 border-b border-gray-900/10 pb-4 mix-blend-plus-darker">
                            <CalendarIcon className="w-8 h-8 text-red-600 drop-shadow-sm" />
                            <span style={{ textShadow: backgroundImage ? '0 1px 2px rgba(255,255,255,0.8)' : 'none' }}>{dateStr}</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {dailyData.length > 0 ? (
                            dailyData.map((item, idx) => (
                                <div key={idx} className={`relative p-5 rounded-lg border-l-4 shadow-sm bg-white/90 ${item.isWallSpecific ? 'border-indigo-500' : 'border-amber-500'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {item.isWallSpecific ? (
                                            <MapPin className="w-4 h-4 text-indigo-500" />
                                        ) : (
                                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                                        )}
                                        <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wide">{item.categoryName}</h4>
                                    </div>
                                    <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed font-medium">{item.content}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 px-4 bg-gray-50/80 rounded-lg border border-gray-100 italic text-gray-500 shadow-inner">
                                Bugün için planlanmış bir not veya etkinlik bulunmuyor.
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
