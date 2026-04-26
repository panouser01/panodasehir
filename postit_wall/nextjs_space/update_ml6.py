import pexpect
import sys

with open('app/page.tsx', 'r') as f:
    text = f.read()

# Fix subcategories
old1 = """<div className={`relative inline-flex items-center justify-center group ${activeAlignment === 'left' ? 'ml-4' : activeAlignment === 'right' ? 'mr-4 mx-2' : 'mx-4'}`}>"""
new1 = """<div className={`relative inline-flex items-center justify-center group ${activeAlignment === 'left' ? 'ml-6' : activeAlignment === 'right' ? 'mr-4 mx-2' : 'mx-4'}`}>"""
text = text.replace(old1, new1)

# Fix direct postits
old2 = """<div className={`relative inline-flex items-center justify-center group ${ottSettings.categoryTitleAlignment === 'left' ? 'ml-4' : ottSettings.categoryTitleAlignment === 'right' ? 'mr-4 mx-2' : 'mx-4'}`}>"""
new2 = """<div className={`relative inline-flex items-center justify-center group ${ottSettings.categoryTitleAlignment === 'left' ? 'ml-6' : ottSettings.categoryTitleAlignment === 'right' ? 'mr-4 mx-2' : 'mx-4'}`}>"""
text = text.replace(old2, new2)

with open('app/page.tsx', 'w') as f:
    f.write(text)

print("Replaced ml-4 with ml-6!")
