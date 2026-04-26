'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PostItCard } from './postit-card'

interface PostItStackProps {
    postits: any[]
    canDelete?: boolean
    currentUserId?: string
}

export function PostItStack({ postits, canDelete, currentUserId }: PostItStackProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const isInitialMount = useRef(true)

    useEffect(() => {
        if (!postits || postits.length <= 1) return
        if (isHovered || isModalOpen) return

        let timer: NodeJS.Timeout

        // Return a randomized interval between 4s and 7.5s for each tick
        const getNextInterval = () => 4000 + Math.random() * 3500

        const tick = () => {
            setCurrentIndex((prev) => (prev + 1) % postits.length)
            timer = setTimeout(tick, getNextInterval())
        }

        if (isInitialMount.current) {
            isInitialMount.current = false
            // Add a completely random delay for the very first tick to completely scatter starts
            const initialDelay = 3000 + Math.random() * 5000
            timer = setTimeout(tick, initialDelay)
        } else {
            // Standard unpausing
            timer = setTimeout(tick, getNextInterval())
        }

        return () => clearTimeout(timer)
    }, [postits, isHovered, isModalOpen])

    if (!postits || postits.length === 0) {
        return (
            <div className="flex items-center justify-center p-8 text-center text-gray-500/80 bg-black/5 backdrop-blur-sm rounded-xl m-4 h-[300px]">
                Bu alanda henüz not bulunmamaktadır.
            </div>
        )
    }

    return (
        <div
            className="relative w-full h-[320px] sm:h-[350px] flex justify-center pt-6 sm:pt-8 overflow-hidden rounded-xl"
            style={{ perspective: 1000 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >

            {/* Main active post-it */}
            <AnimatePresence>
                <motion.div
                    key={postits[currentIndex].id}
                    initial={{ opacity: 0, x: 200, rotateY: 90, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1, zIndex: 20 }}
                    exit={{ opacity: 0, x: -200, rotateY: -90, scale: 0.8, transition: { duration: 0.6 } }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                    className="absolute top-4 sm:top-6 w-[90%] sm:w-[80%] max-w-[350px] z-20"
                >
                    <div className="w-full shadow-2xl rounded-sm">
                        <PostItCard
                            id={postits[currentIndex].id}
                            content={postits[currentIndex].content}
                            imageUrl={postits[currentIndex].imageUrl}
                            images={postits[currentIndex].PostItImage?.map((img: any) => img.url) || []}
                            link={postits[currentIndex].link}
                            color={postits[currentIndex].color}
                            font={postits[currentIndex].font}
                            pushpin={postits[currentIndex].pushpin}
                            rotation={postits[currentIndex].rotation}
                            userName={postits[currentIndex]?.user?.nickname || postits[currentIndex]?.user?.name || 'Anonim'}
                            authorId={postits[currentIndex]?.user?.id}
                            categoryName={postits[currentIndex]?.category?.name || 'Genel'}
                            createdAt={new Date(postits[currentIndex].createdAt)}
                            canDelete={postits[currentIndex].isWeather ? false : canDelete}
                            onDelete={() => { }}
                            onInteraction={(open) => setIsModalOpen(open)}
                            isWeather={postits[currentIndex].isWeather}
                            weatherTemp={postits[currentIndex].weatherTemp}
                            weatherCondition={postits[currentIndex].weatherCondition}
                            weatherBg={postits[currentIndex].weatherBg}
                            weatherDaily={postits[currentIndex].weatherDaily}
                            weatherHourly={postits[currentIndex].weatherHourly}
                            initialLikesCount={postits[currentIndex].likesCount || 0}
                            initialHasLiked={postits[currentIndex].hasLiked || false}
                            initialViewsCount={postits[currentIndex].views || 0}
                            currentUserId={currentUserId}
                            isLarge={false}
                            comments={postits[currentIndex].comments || []}
                            postitAppearance={postits[currentIndex].category?.postitAppearance || undefined}
                            ottModalBgType={(postits[currentIndex].category?.ottModalBgType && postits[currentIndex].category.ottModalBgType !== 'postit') ? postits[currentIndex].category.ottModalBgType : (postits[currentIndex].category?.ottModalBgType || undefined)}
                            ottModalBgColor={(postits[currentIndex].category?.ottModalBgType && postits[currentIndex].category.ottModalBgType !== 'postit') ? postits[currentIndex].category.ottModalBgColor : undefined}
                            ottModalBgImage={(postits[currentIndex].category?.ottModalBgType && postits[currentIndex].category.ottModalBgType !== 'postit') ? postits[currentIndex].category.ottModalBgImage : undefined}
                        />
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Progress Indicators */}
            {postits.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-30">
                    {postits.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-6 bg-indigo-600' : 'w-1.5 bg-black/20'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
