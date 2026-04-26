import os

with open("app/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """                              ) : <div className="h-2" />
                            }
                            contentNode={
                              <div
                                className={`relative flex overflow-hidden transition-all duration-300"""

replacement = """                              )}
                            <AccordionContent>
                              <div
                                className={`relative flex overflow-hidden transition-all duration-300"""

content = content.replace(target, replacement)

with open("app/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fix applied")
