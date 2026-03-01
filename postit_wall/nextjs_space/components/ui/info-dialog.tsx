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
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold border-b pb-4">{title}</DialogTitle>
                </DialogHeader>
                <div
                    className="py-6 leading-relaxed text-gray-700 prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: content || 'İçerik henüz eklenmemiştir.' }}
                />
            </DialogContent>
        </Dialog>
    )
}
