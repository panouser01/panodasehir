import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function stripHtml(html: string): string {
  if (!html) return '';
  // Paragraf sonlarını ve br'leri yeni satıra dönüştür
  let text = html.replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n');
  text = text.replace(/<(br|hr)\s*\/?>/gi, '\n');
  // Kalan tüm HTML taglerini sil
  text = text.replace(/<[^>]*>?/gm, '');
  // HTML tiplerini decode et
  text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  // Fazla yeni satırları temizle
  return text.trim();
}