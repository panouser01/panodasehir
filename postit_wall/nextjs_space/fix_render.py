import re

with open('app/admin/page.tsx', 'r') as f:
    content = f.read()

# Find start of renderSiteGorseli
start_idx = content.find("const renderSiteGorseli = () => {")

# find the matching closing brace
brace_count = 0
in_function = False
end_idx = -1

for i in range(start_idx, len(content)):
    if content[i] == '{':
        brace_count += 1
        in_function = True
    elif content[i] == '}':
        brace_count -= 1
        
    if in_function and brace_count == 0:
        end_idx = i + 1
        break

if end_idx != -1:
    section = content[start_idx:end_idx]
    
    # Replace setSiteSettings with setWallForm
    section = section.replace('setSiteSettings(s => ({ ...s,', 'setWallForm(s => ({ ...s,')
    section = section.replace('setSiteSettings({...siteSettings,', 'setWallForm({...wallForm,')
    section = section.replace('setSiteSettings({ ...siteSettings,', 'setWallForm({ ...wallForm,')
    
    # Replace siteSettings. with wallForm.
    section = section.replace('siteSettings.', 'wallForm.')
    
    new_content = content[:start_idx] + section + content[end_idx:]
    
    with open('app/admin/page.tsx', 'w') as f:
        f.write(new_content)
    print("Fixed!")
else:
    print("Could not find end of function")
