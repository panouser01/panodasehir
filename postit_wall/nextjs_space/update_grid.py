with open("components/postit/postit-masonry-grid.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Props
content = content.replace(
    'itemsPerRow?: number;',
    'itemsPerRow?: number;\n  cardRatio?: string;'
)

content = content.replace(
    ', itemsPerRow: propItemsPerRow',
    ', itemsPerRow: propItemsPerRow, cardRatio: propCardRatio'
)

# 2. Update variables
content = content.replace(
    "const imageRatio = postitAppearance?.editorImageRatio || '16/9'",
    "const imageRatio = propCardRatio || postitAppearance?.editorImageRatio || '16/9'"
)

with open("components/postit/postit-masonry-grid.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Props updated!")
