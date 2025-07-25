'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Link, 
  Image, 
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder = "اكتب محتوى المقال...", className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // تطبيق التنسيق
  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  // تحديث المحتوى
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  // إدراج رابط
  const insertLink = () => {
    const url = prompt('أدخل الرابط:')
    if (url) {
      applyFormat('createLink', url)
    }
  }

  // إدراج صورة
  const insertImage = () => {
    const url = prompt('أدخل رابط الصورة:')
    if (url) {
      applyFormat('insertImage', url)
    }
  }

  // أزرار التنسيق
  const formatButtons = [
    { icon: Bold, command: 'bold', tooltip: 'غامق' },
    { icon: Italic, command: 'italic', tooltip: 'مائل' },
    { icon: Underline, command: 'underline', tooltip: 'تحته خط' },
    { icon: List, command: 'insertUnorderedList', tooltip: 'قائمة نقطية' },
    { icon: ListOrdered, command: 'insertOrderedList', tooltip: 'قائمة مرقمة' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', tooltip: 'اقتباس' },
    { icon: Code, command: 'formatBlock', value: 'pre', tooltip: 'كود' },
    { icon: AlignLeft, command: 'justifyLeft', tooltip: 'محاذاة يسار' },
    { icon: AlignCenter, command: 'justifyCenter', tooltip: 'محاذاة وسط' },
    { icon: AlignRight, command: 'justifyRight', tooltip: 'محاذاة يمين' },
    { icon: Undo, command: 'undo', tooltip: 'تراجع' },
    { icon: Redo, command: 'redo', tooltip: 'إعادة' },
  ]

  // تحديث المحتوى عند تغيير القيمة من الخارج
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* شريط الأدوات */}
      <div className="border-b bg-gray-50 dark:bg-gray-800 p-2 flex flex-wrap gap-1">
        {formatButtons.map(({ icon: Icon, command, value, tooltip }) => (
          <Button
            key={command}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => applyFormat(command, value)}
            title={tooltip}
            className="h-8 w-8 p-0"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        
        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertLink}
          title="إدراج رابط"
          className="h-8 w-8 p-0"
        >
          <Link className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertImage}
          title="إدراج صورة"
          className="h-8 w-8 p-0"
        >
          <Image className="h-4 w-4" />
        </Button>
      </div>

      {/* منطقة التحرير */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "min-h-[300px] p-4 focus:outline-none",
          "prose prose-sm dark:prose-invert max-w-none",
          "text-right",
          !value && !isFocused && "text-gray-500"
        )}
        style={{ direction: 'rtl' }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* إحصائيات */}
      <div className="border-t bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 flex justify-between">
        <span>عدد الكلمات: {value.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length}</span>
        <span>عدد الأحرف: {value.replace(/<[^>]*>/g, '').length}</span>
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] blockquote {
          border-right: 4px solid #e5e7eb;
          padding-right: 16px;
          margin: 16px 0;
          color: #6b7280;
          font-style: italic;
        }
        
        [contenteditable] pre {
          background-color: #f3f4f6;
          padding: 12px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          overflow-x: auto;
        }
        
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
        }
      `}</style>
    </div>
  )
}
