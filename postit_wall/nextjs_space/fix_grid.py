import re

with open("components/postit/postit-masonry-grid.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'export function PostitMasonryGrid({ postits, postitAppearance }: PostitMasonryGridProps) {',
    'export function PostitMasonryGrid({ postits, postitAppearance, itemsPerRow: propItemsPerRow }: PostitMasonryGridProps) {'
)

content = content.replace(
    'postitAppearance?: any;',
    'postitAppearance?: any;\n  itemsPerRow?: number;'
)

content = content.replace(
    'const itemsPerRow = postitAppearance?.editorItemsPerRow || 3',
    'const itemsPerRow = propItemsPerRow || postitAppearance?.editorItemsPerRow || 3'
)

with open("components/postit/postit-masonry-grid.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Grid fixed!")
