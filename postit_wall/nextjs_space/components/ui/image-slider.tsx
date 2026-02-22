'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function ImageSlider({ images, links, className }: { images: string[], links?: string[], className?: string }) {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Auto-play
    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
        }, 5000)
        return () => clearInterval(interval)
    }, [images])

    if (!images || images.length === 0) return null

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    const wrapperClass = className || "relative w-full max-w-[1170px] mx-auto h-[130px] sm:h-[160px] md:h-[200px] lg:h-[300px] mb-8 mt-4 rounded-xl shadow-lg"

    return (
        <div className={`${wrapperClass} overflow-hidden group`}>
            {/* Images */}
            <div
                className="flex transition-transform duration-500 ease-in-out h-full w-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((url, idx) => {
                    const hasLink = links && links[idx] && links[idx].trim() !== ''

                    const imgElement = (
                        <img
                            key={`img-${idx}`}
                            src={url}
                            alt={`Slide ${idx + 1}`}
                            className="w-full h-full object-cover flex-shrink-0"
                        />
                    )

                    return hasLink ? (
                        <a
                            key={idx}
                            href={links[idx]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 w-full h-full block cursor-pointer transition-transform hover:scale-105 duration-700"
                        >
                            {imgElement}
                        </a>
                    ) : (
                        <div key={idx} className="flex-shrink-0 w-full h-full">
                            {imgElement}
                        </div>
                    )
                })}
            </div>

            {/* Navigation arrows (Only show if multiple images) */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={handlePrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-3 h-3 rounded-full transition-colors ${currentIndex === idx ? 'bg-white' : 'bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
