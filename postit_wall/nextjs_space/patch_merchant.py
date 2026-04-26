import re

with open('app/merchant/register/page.tsx', 'r') as f:
    code = f.read()

# Add onSubmit to TabsContent for SOLE
code = code.replace('<TabsContent value="sole" className="p-6 md:p-8 m-0 outline-none">', 
                    '<TabsContent value="sole" className="p-6 md:p-8 m-0 outline-none"><form onSubmit={(e) => handleSubmit(e, "SOLE")}>')
code = code.replace('</TabsContent>', '</form></TabsContent>')

# The second replaces might break if not careful, let's just do it manually with specific splits
parts = code.split('<TabsContent')
if len(parts) == 3:
    # First part is before sole
    sole_part = parts[1]
    corp_part = parts[2]
    
    # Wrap SOLE
    sole_part = sole_part.replace('value="sole" className="p-6 md:p-8 m-0 outline-none">', 'value="sole" className="p-6 md:p-8 m-0 outline-none">\n<form onSubmit={(e) => handleSubmit(e, "SOLE")}>', 1)
    
    # Wrap CORP
    corp_part = corp_part.replace('value="corp" className="p-6 md:p-8 m-0 outline-none">', 'value="corp" className="p-6 md:p-8 m-0 outline-none">\n<form onSubmit={(e) => handleSubmit(e, "CORP")}>', 1)
    
    # Append </form> before </TabsContent>
    # but wait, parts are split by `<TabsContent`, the closing tag is `</TabsContent>`. 
    # This is tricky using split. 

with open('app/merchant/register/page.tsx', 'w') as f:
    f.write(code)

