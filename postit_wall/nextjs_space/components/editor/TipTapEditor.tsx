'use client'

import React, { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import Highlight from '@tiptap/extension-highlight'

import { 
  Bold, Italic, Strikethrough, Underline as UnderlineIcon, 
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, 
  ImageIcon, LinkIcon, Heading1, Heading2, Heading3, Quote, 
  Undo, Redo, Type, Highlighter, Palette, RemoveFormatting
} from 'lucide-react'

interface TipTapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize }).run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
      },
    }
  },
})

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }
  const [selectedFont, setSelectedFont] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    const handleUpdate = () => {
      setSelectedFont(getCurrentFont());
      setSelectedSize(getCurrentSize());
    };
    editor.on('transaction', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);
    handleUpdate();
    
    return () => {
      editor.off('transaction', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor]);

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Bağlantı (URL):', previousUrl)
    
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('Resim Bağlantısı (URL):')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const getCurrentFont = () => {
    // 1. Try standard getAttributes
    let attrFont = editor.getAttributes('textStyle').fontFamily;
    if (attrFont) return attrFont.replace(/['"]/g, '');

    // 2. Check storedMarks (used when selection is empty and mark was just applied)
    if (editor.state.storedMarks) {
      const tsMark = editor.state.storedMarks.find((m: any) => m.type.name === 'textStyle');
      if (tsMark && tsMark.attrs.fontFamily) {
        return tsMark.attrs.fontFamily.replace(/['"]/g, '');
      }
    }

    // 3. Fallback to head node marks
    if (editor.state.selection.$head?.marks) {
      const marks = editor.state.selection.$head.marks();
      const tsMark = marks.find((m: any) => m.type.name === 'textStyle');
      if (tsMark && tsMark.attrs.fontFamily) {
        return tsMark.attrs.fontFamily.replace(/['"]/g, '');
      }
    }

    return "";
  };

  const getCurrentSize = () => {
    let attrSize = editor.getAttributes('textStyle').fontSize;
    if (attrSize) return attrSize.replace(/['"]/g, '');

    if (editor.state.storedMarks) {
      const tsMark = editor.state.storedMarks.find((m: any) => m.type.name === 'textStyle');
      if (tsMark && tsMark.attrs.fontSize) {
        return tsMark.attrs.fontSize.replace(/['"]/g, '');
      }
    }

    if (editor.state.selection.$head?.marks) {
      const marks = editor.state.selection.$head.marks();
      const tsMark = marks.find((m: any) => m.type.name === 'textStyle');
      if (tsMark && tsMark.attrs.fontSize) {
        return tsMark.attrs.fontSize.replace(/['"]/g, '');
      }
    }

    return "";
  };

  const MenuButton = ({ onClick, isActive, disabled = false, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-colors flex items-center justify-center ${
        isActive ? 'bg-indigo-600 text-white shadow-inner' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-transparent hover:border-slate-300'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )

  return (
    <div className="flex flex-col w-full bg-slate-50 border-b border-slate-200 rounded-t-xl overflow-hidden">
      {/* Top Main Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-slate-200 bg-slate-100">
        
        {/* Undo Redo */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-300">
          <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} title="Geri Al">
            <Undo className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} title="İleri Al">
            <Redo className="w-4 h-4" />
          </MenuButton>
        </div>

        {/* Text Formats */}
        <div className="flex items-center gap-1 px-2 border-r border-slate-300">
          <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Kalın">
            <Bold className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="İtalik">
            <Italic className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Altı Çizili">
            <UnderlineIcon className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Üstü Çizik">
            <Strikethrough className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Biçimlendirmeleri Temizle">
            <RemoveFormatting className="w-4 h-4 text-red-500" />
          </MenuButton>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 px-2 border-r border-slate-300">
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Sola Hizala">
            <AlignLeft className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Ortala">
            <AlignCenter className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Sağa Hizala">
            <AlignRight className="w-4 h-4" />
          </MenuButton>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 px-2 border-r border-slate-300">
          <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Başlık 1">
            <Heading1 className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Başlık 2">
            <Heading2 className="w-4 h-4" />
          </MenuButton>
           <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Başlık 3">
            <Heading3 className="w-4 h-4" />
          </MenuButton>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center gap-1 px-2 border-r border-slate-300">
          <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Madde İşaretli Liste">
            <List className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numaralı Liste">
            <ListOrdered className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Alıntı Blok">
            <Quote className="w-4 h-4" />
          </MenuButton>
        </div>

        {/* Media */}
        <div className="flex items-center gap-1 px-2">
          <MenuButton onClick={setLink} isActive={editor.isActive('link')} title="Bağlantı (Link)">
            <LinkIcon className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={addImage} title="Görsel (Resim)">
            <ImageIcon className="w-4 h-4" />
          </MenuButton>
        </div>

      </div>

      {/* Secondary Bar for Colors and Fonts */}
      <div className="flex flex-wrap items-center gap-4 p-2 bg-slate-50">
        
        {/* Font Family */}
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-slate-500" />
          <select
            className="text-sm bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:border-indigo-500"
            onChange={(e) => {
              const val = e.target.value;
              setSelectedFont(val);
              if (val) {
                editor.chain().focus().setFontFamily(val).run();
              } else {
                editor.chain().focus().unsetFontFamily().run();
              }
            }}
            value={selectedFont}
          >
            <option value="">Varsayılan Font</option>
            <option value="Inter">Inter (Sade)</option>
            <option value="Playfair Display">Playfair Display (Zarif)</option>
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="Tahoma">Tahoma</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
            <option value="Comic Sans MS">Comic Sans</option>
            <option value="Impact">Impact</option>
            <option value="Courier New">Courier New (Sabit Aralıklı)</option>
            <option value="monospace">Monospace</option>
          </select>
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-2">
          <select
            className="text-sm bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:border-indigo-500 w-20"
            onChange={(e) => {
              const val = e.target.value;
              setSelectedSize(val);
              if (val) {
                editor.chain().focus().setFontSize(val).run();
              } else {
                editor.chain().focus().unsetFontSize().run();
              }
            }}
            value={selectedSize}
          >
            <option value="">Oto.</option>
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="20px">20</option>
            <option value="24px">24</option>
            <option value="28px">28</option>
            <option value="32px">32</option>
            <option value="36px">36</option>
            <option value="48px">48</option>
            <option value="64px">64</option>
            <option value="72px">72</option>
          </select>
        </div>

        {/* Text Color */}
        <div className="flex items-center gap-2 relative group">
          <div className="flex items-center justify-center p-1.5 rounded-md hover:bg-slate-200 border border-transparent hover:border-slate-300">
           <Palette className="w-4 h-4 text-slate-600 mr-2" />
           <input
              type="color"
              className="w-6 h-6 p-0 border-0 outline-none rounded bg-transparent cursor-pointer"
              onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
              value={editor.getAttributes('textStyle').color || '#000000'}
              title="Metin Rengi"
            />
          </div>
        </div>

        {/* Highlight Color */}
        <div className="flex items-center gap-2 relative group">
           <div className="flex items-center justify-center p-1.5 rounded-md hover:bg-slate-200 border border-transparent hover:border-slate-300">
             <Highlighter className="w-4 h-4 text-slate-600 mr-2" />
             <input
                type="color"
                className="w-6 h-6 p-0 border-0 outline-none rounded bg-transparent cursor-pointer"
                onInput={event => editor.chain().focus().setHighlight({ color: (event.target as HTMLInputElement).value }).run()}
                value={editor.getAttributes('highlight').color || '#ffff00'}
                title="Vurgu (Arka Plan) Rengi"
              />
           </div>
        </div>

      </div>
    </div>
  )
}

export default function TipTapEditor({ content, onChange, placeholder }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-[1200px] w-full min-h-[400px] p-6 text-slate-800 focus:outline-none placeholder:text-slate-400 bg-white font-sans text-base lg:text-lg leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="w-full flex justify-center items-center font-sans shadow-lg rounded-xl overflow-hidden mt-2 mb-2">
      <div className="w-full bg-white border border-slate-300 flex flex-col">
        <MenuBar editor={editor} />
        <div className="flex-1 overflow-y-auto cursor-text bg-white" onClick={() => editor?.commands.focus()}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
