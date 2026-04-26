import re

with open('app/page.tsx', 'r') as f:
    text = f.read()

# Enhance priority
old = """            {(() => {
              const currentStyleActive = categoryId ? selectedCategory?.isStyleModeActive : homeWall?.isStyleModeActive;"""

new = """            {(() => {
              const rootOttActive = categoryId ? selectedCategory?.isOttActive : homeWall?.isOttActive;
              const currentStyleActive = (categoryId ? selectedCategory?.isStyleModeActive : homeWall?.isStyleModeActive) && !rootOttActive;"""

text = text.replace(old, new)

with open('app/page.tsx', 'w') as f:
    f.write(text)
