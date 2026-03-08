'use client'

import React from 'react'

interface PushpinLogoProps {
    className?: string
    size?: number
}

export function PushpinLogo({ className, size = 24 }: PushpinLogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {/* Metal Pin Needle - More metallic and sharp */}
                <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#94A3B8" />
                    <stop offset="40%" stopColor="#F8FAFC" /> {/* Shiny highlight */}
                    <stop offset="100%" stopColor="#334155" />
                </linearGradient>
                {/* Plastic Head Case */}
                <linearGradient id="pinBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE047" /> {/* Yellow-300 */}
                    <stop offset="100%" stopColor="#A16207" /> {/* Yellow-800 for depth */}
                </linearGradient>
                {/* Highlights for 3D effect */}
                <radialGradient id="highlightGradient" cx="30%" cy="30%" r="50%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                {/* Sub-body gradient */}
                <linearGradient id="subBodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EAB308" />
                    <stop offset="50%" stopColor="#FACC15" />
                    <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
            </defs>

            {/* Shadow under the needle point */}
            <ellipse cx="38" cy="94" rx="8" ry="4" fill="black" fillOpacity="0.2" filter="blur(2px)" transform="rotate(15 38 94)" />

            {/* Tilted Pin Group */}
            <g transform="rotate(30 50 50)">
                {/* The Needle (The pointy part) - Tapered and outlined for prominence */}
                <path
                    d="M48.5 65 L51.5 65 L50.5 98 L49.5 98 Z"
                    fill="url(#needleGradient)"
                    stroke="#475569"
                    strokeWidth="0.5"
                />

                {/* Main Plastic Body (Cylinder shape) */}
                <rect x="38" y="25" width="24" height="40" rx="3" fill="url(#pinBodyGradient)" />

                {/* Top Flange (The wider top part) */}
                <rect x="30" y="12" width="40" height="15" rx="6" fill="#FACC15" /> {/* The brightest part */}
                <rect x="30" y="18" width="40" height="7" rx="2" fill="url(#subBodyGradient)" />

                {/* Highlights to make it look shiny/realistic */}
                <rect x="42" y="28" width="4" height="34" rx="2" fill="url(#highlightGradient)" />
                <ellipse cx="40" cy="18" rx="5" ry="3" fill="white" fillOpacity="0.5" />

                {/* Decorative ring near needle */}
                <rect x="40" y="60" width="20" height="5" rx="1" fill="#CA8A04" />
            </g>
        </svg>
    )
}
