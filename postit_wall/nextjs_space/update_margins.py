import pexpect
import sys

with open('app/page.tsx', 'r') as f:
    text = f.read()

# Try to remove the ml-6 entirely and add pl-something to the title text itself?
# Let's adjust the title container to exactly match the look the user wants.
# The user wants "başlığı postite göre hizala" (align the title to the postit).

old_title = """<div className={`relative inline-flex items-center justify-center group ${ottSettings.categoryTitleAlignment === 'left' ? 'ml-6' : ottSettings.categoryTitleAlignment === 'right' ? 'mr-4 mx-2' : 'mx-4'}`}>"""
new_title = """<div className={`relative inline-flex items-center justify-center group ${ottSettings.categoryTitleAlignment === 'left' ? 'ml-[24px]' : ottSettings.categoryTitleAlignment === 'right' ? 'mr-4 mx-2' : 'mx-4'}`}>"""

text = text.replace(old_title, new_title)

with open('app/page.tsx', 'w') as f:
    f.write(text)

print("Updated ml")
