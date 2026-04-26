import re
import sys

with open('app/page.tsx', 'r') as f:
    text = f.read()

text = text.replace('isTitularModeActive ? ', 'catOttIsActive ? ')
text = text.replace('isTitularModeActive &&', 'catOttIsActive &&')
text = text.replace('(!isTitularModeActive &&', '(!catOttIsActive &&')
text = text.replace('{(!isTitularModeActive ||', '{(!catOttIsActive ||')

with open('app/page.tsx', 'w') as f:
    f.write(text)
