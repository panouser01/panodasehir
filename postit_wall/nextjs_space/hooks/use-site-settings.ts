'use client'

import { useState, useEffect } from 'react'

export function useSiteSettings() {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchSettings() {
            try {
                const response = await fetch('/api/settings')
                if (!response.ok) throw new Error('Settings not found')
                const data = await response.json()
                setSettings(data.settings)
            } catch (error) {
                console.error('Failed to fetch settings:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    return { settings, loading }
}
