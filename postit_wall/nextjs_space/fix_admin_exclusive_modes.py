import re

with open('app/admin/page.tsx', 'r') as f:
    text = f.read()

# Replace OTT mode switch logic
old_ott = """                      onCheckedChange={(checked) =>
                        setWallForm({ ...wallForm, isOttActive: !!checked })
                      }"""
new_ott = """                      onCheckedChange={(checked) =>
                        setWallForm({ 
                          ...wallForm, 
                          isOttActive: !!checked,
                          isStyleModeActive: checked ? false : wallForm.isStyleModeActive,
                          isEditorModeActive: checked ? false : wallForm.isEditorModeActive
                        })
                      }"""

text = text.replace(old_ott, new_ott)

# Replace Editor mode switch logic
old_editor = """                        onCheckedChange={(checked) =>
                          setWallForm({
                            ...wallForm,
                            isEditorModeActive: checked,
                          })
                        }"""
new_editor = """                        onCheckedChange={(checked) =>
                          setWallForm({
                            ...wallForm,
                            isEditorModeActive: checked,
                            isOttActive: checked ? false : wallForm.isOttActive,
                            isStyleModeActive: checked ? false : wallForm.isStyleModeActive
                          })
                        }"""
text = text.replace(old_editor, new_editor)

# Replace Style mode switch logic
old_style = """                        onCheckedChange={(checked) =>
                          setWallForm({
                            ...wallForm,
                            isStyleModeActive: checked,
                          })
                        }"""
new_style = """                        onCheckedChange={(checked) =>
                          setWallForm({
                            ...wallForm,
                            isStyleModeActive: checked,
                            isOttActive: checked ? false : wallForm.isOttActive,
                            isEditorModeActive: checked ? false : wallForm.isEditorModeActive
                          })
                        }"""
text = text.replace(old_style, new_style)

with open('app/admin/page.tsx', 'w') as f:
    f.write(text)
