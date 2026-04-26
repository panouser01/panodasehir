import re

content = open('lib/services/category.service.ts').read()

target1 = """            children: {
              include: {
                children: {"""
replacement1 = """            children: {
              include: {
                wallViewers: { select: { id: true } },
                children: {"""
                
content = content.replace("include: {\n        wallManagers: {", "include: {\n        wallViewers: { select: { id: true } },\n        wallManagers: {")
content = content.replace("assignedGroup: true,\n            wallManagers:", "assignedGroup: true,\n            wallViewers: { select: { id: true } },\n            wallManagers:")
content = content.replace("assignedGroup: true,\n                wallManagers:", "assignedGroup: true,\n                wallViewers: { select: { id: true } },\n                wallManagers:")
content = content.replace("assignedGroup: true,\n                    wallManagers:", "assignedGroup: true,\n                    wallViewers: { select: { id: true } },\n                    wallManagers:")

# For the getCachedCategories which spans many lines
# Just do a blanket replace if needed
def add_viewers(text):
    return re.sub(
        r'(include: \{\s*)(children:)',
        r'\1wallViewers: { select: { id: true } },\n        \2',text, count=1)

content = add_viewers(content)

# add to all nested includes where wallManagers is NOT present but we need wallViewers?
# For getCachedCategories the include is:
#      include: {
#        children: {
#          include: {
#            children: {
#              include: {
#                children: {

content = content.replace('      include: {\n        children', '      include: {\n        wallViewers: { select: { id: true } },\n        wallManagers: { select: { id: true } },\n        children')
content = content.replace('          include: {\n            children', '          include: {\n            wallViewers: { select: { id: true } },\n            wallManagers: { select: { id: true } },\n            children')
content = content.replace('              include: {\n                children', '              include: {\n                wallViewers: { select: { id: true } },\n                wallManagers: { select: { id: true } },\n                children')

open('lib/services/category.service.ts', 'w').write(content)
print("Updated category.service.ts")
