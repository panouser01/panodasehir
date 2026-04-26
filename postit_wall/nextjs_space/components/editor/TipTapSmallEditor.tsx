'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { Bold, Italic, Strikethrough, Underline as UnderlineIcon, List, ListOrdered, LinkIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

interface TipTapSmallEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  maxLength?: number
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null

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

  const MenuButton = ({ onClick, isActive, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${
        isActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-slate-200 bg-slate-50/50 rounded-t-[20px]">
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
      
      <div className="w-px h-4 bg-slate-300 mx-1 border-r" />

      <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Sola Hizala">
        <AlignLeft className="w-4 h-4" />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Ortala">
        <AlignCenter className="w-4 h-4" />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Sağa Hizala">
        <AlignRight className="w-4 h-4" />
      </MenuButton>

      <div className="w-px h-4 bg-slate-300 mx-1 border-r" />

      <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Madde İşaretli Liste">
        <List className="w-4 h-4" />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numaralı Liste">
        <ListOrdered className="w-4 h-4" />
      </MenuButton>
      
      <div className="w-px h-4 bg-slate-300 mx-1" />

      <MenuButton onClick={setLink} isActive={editor.isActive('link')} title="Bağlantı">
        <LinkIcon className="w-4 h-4" />
      </MenuButton>
    </div>
  )
}

export default function TipTapSmallEditor({ content, onChange, placeholder, maxLength = 2500 }: TipTapSmallEditorProps) {
  const [charCount, setCharCount] = React.useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-4 min-h-[120px] focus:outline-none placeholder:text-slate-400 text-slate-800',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
      setCharCount(editor.getText().length)
    },
    onCreate: ({ editor }) => {
      setCharCount(editor.getText().length)
    }
  })

  // Watch content changes from outside (e.g., reset form)
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
      setCharCount(editor.getText().length)
    }
  }, [content, editor])

  return (
    <div className="flex flex-col w-full bg-slate-50/50 hover:bg-slate-100/50 border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus-within:ring-2 focus-within:ring-slate-900 rounded-[20px] transition-all">
      <MenuBar editor={editor} />
      <div className="flex-1 cursor-text bg-transparent overflow-hidden rounded-b-[20px]" onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
      <div className="flex justify-end p-2 border-t border-slate-100/50">
        <span className={`text-xs ${charCount > maxLength * 0.95 ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
          {charCount}/{maxLength}
        </span>
      </div>
    </div>
  )
}
