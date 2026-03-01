'use client'

import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

import { useMemo, useRef } from 'react'

const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill')
        return function ({ forwardedRef, ...props }: any) {
            return <RQ ref={forwardedRef} {...props} />
        }
    },
    {
        ssr: false,
        loading: () => <div className="h-[500px] w-full bg-gray-50 animate-pulse rounded-md" />,
    }
)

interface RichEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
    const quillRef = useRef<any>(null)

    const imageHandler = () => {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')
        input.click()

        input.onchange = async () => {
            const file = input.files?.[0]
            if (file) {
                const formData = new FormData()
                formData.append('file', file)

                try {
                    const res = await fetch('/api/upload/local', {
                        method: 'POST',
                        body: formData,
                    })

                    const data = await res.json()
                    const quill = quillRef.current.getEditor()
                    const range = quill.getSelection()
                    quill.insertEmbed(range.index, 'image', data.fileUrl)
                } catch (error) {
                    console.error('Image upload failed:', error)
                }
            }
        }
    }

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                [{ align: [] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ color: [] }, { background: [] }],
                ['link', 'image'],
                ['clean'],
            ],
            handlers: {
                image: imageHandler,
            },
        },
    }), [])

    const formats = [
        'header',
        'align',
        'bold',
        'italic',
        'underline',
        'strike',
        'list',
        'bullet',
        'color',
        'background',
        'link',
        'image',
    ]

    return (
        <div className="bg-white">
            <ReactQuill
                forwardedRef={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="h-[450px] mb-12"
            />
        </div>
    )
}
