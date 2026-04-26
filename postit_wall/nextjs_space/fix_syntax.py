import os

with open('app/page.tsx', 'r') as f:
    text = f.read()

# Fix the template literal I broke
broken = '`relative ${ottSettings.categoryTitleAlignment === "left" ? "pl-0 pr-8 md:pr-14" : "px-8 md:px-14"} py-3 rounded-sm'
fixed = '`relative ${ottSettings.categoryTitleAlignment === "left" ? "pl-0 pr-8 md:pr-14" : "px-8 md:px-14"} py-3` + " rounded-sm'
# Actually it's easier to just use one big template literal or close the backtick.

# Let's find the specific line and fix it manually via string manipulation
if '`relative ${ottSettings.categoryTitleAlignment === "left" ? "pl-0 pr-8 md:pr-14" : "px-8 md:px-14"} py-3 rounded-sm' in text:
    text = text.replace('`relative ${ottSettings.categoryTitleAlignment === "left" ? "pl-0 pr-8 md:pr-14" : "px-8 md:px-14"} py-3 rounded-sm', '`relative ${ottSettings.categoryTitleAlignment === "left" ? "pl-0 pr-8 md:pr-14" : "px-8 md:px-14"} py-3` + " rounded-sm')

# Let's check for any other broken backticks from my previous alignment script
# I will just rewrite that part clearly.
