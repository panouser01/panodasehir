import re

content = open('app/api/categories/route.ts').read()

def add_viewers(text):
    return re.sub(
        r'(include: \{\s*)(assignedGroup:)',
        r'\1wallViewers: { select: { id: true, name: true, email: true } },\n        \2',text)

content = add_viewers(content)

open('app/api/categories/route.ts', 'w').write(content)
print("Updated route.ts")
