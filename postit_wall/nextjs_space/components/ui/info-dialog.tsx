'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState, useEffect } from 'react'

interface InfoDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    title: string
    content: string
}

export const InfoDialog = ({ isOpen, onOpenChange, title, content }: InfoDialogProps) => {
    useEffect(() => {
        if (isOpen) {
            window.history.pushState({ infoDialog: true }, '', '#info')
            
            const handlePopState = () => {
                onOpenChange(false)
            }
            
            window.addEventListener('popstate', handlePopState)
            
            return () => {
                window.removeEventListener('popstate', handlePopState)
            }
        }
    }, [isOpen, onOpenChange])

    const handleOpenChange = (open: boolean) => {
        if (!open && window.location.hash === '#info') {
            window.history.back()
        }
        onOpenChange(open)
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="w-[92vw] sm:w-full max-w-3xl max-h-[85vh] overflow-y-auto overflow-x-hidden p-4 md:p-6 rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl md:text-2xl font-bold border-b pb-3 md:pb-4 pr-10">{title}</DialogTitle>
                </DialogHeader>
                <div
                    className="py-4 md:py-6 leading-relaxed text-gray-700 prose prose-sm md:prose-base max-w-none break-words"
                    dangerouslySetInnerHTML={{ __html: content || 'İçerik henüz eklenmemiştir.' }}
                />
            </DialogContent>
        </Dialog>
    )
}
