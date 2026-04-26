const parseSize = (size) => {
  const sizeMap = {
    'text-xs': '0.75rem',
    'text-sm': '0.875rem',
    'text-base': '1rem',
    'text-lg': '1.125rem',
    'text-xl': '1.25rem',
    'text-2xl': '1.5rem',
    'text-3xl': '1.875rem',
    'xs': '0.75rem',
    'sm': '0.875rem',
    'base': '1rem',
    'lg': '1.125rem',
    'xl': '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  }
  return sizeMap[size] || '1.125rem'
}

const parseFont = (font) => {
  const fontMap = {
    'font-sans': '"Inter", ui-sans-serif, system-ui, sans-serif',
    'sans-serif': '"Inter", ui-sans-serif, system-ui, sans-serif',
    'font-serif': '"Playfair Display", ui-serif, Georgia, serif',
    'serif': '"Playfair Display", ui-serif, Georgia, serif',
    'font-handwriting': '"Caveat", cursive',
    'handwriting': '"Caveat", cursive',
    'london': '"London Presley", sans-serif',
    'puerto': '"Puerto", sans-serif',
    'retosta': '"Retosta", sans-serif',
    'font-mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    'font-comic': '"Comic Sans MS", "Chalkboard SE", "Comic Neue", sans-serif',
  }
  return fontMap[font] || 'inherit'
}
