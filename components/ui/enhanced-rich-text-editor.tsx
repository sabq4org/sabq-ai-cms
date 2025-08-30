'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Redo,
  Upload,
  Smile,
  ImagePlus,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface EnhancedRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  enableImageUpload?: boolean
  enableEmoji?: boolean
  maxImageSize?: number // في MB
}

// مجموعة إيموجي شاملة مصنفة
const EMOJI_CATEGORIES = {
  'وجوه وأشخاص': [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊',
    '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛',
    '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑',
    '😶', '😶‍🌫️', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😔', '😪', '🤤',
    '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '😵‍💫',
    '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮',
    '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱',
    '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈',
    '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'
  ],
  'يد وإشارات': [
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘',
    '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛',
    '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪'
  ],
  'طبيعة وحيوانات': [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁',
    '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦',
    '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝',
    '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️',
    '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀',
    '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍',
    '🦧', '🐘', '🦣', '🦏', '🦛', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄',
    '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺'
  ],
  'طعام وشراب': [
    '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒',
    '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️',
    '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖',
    '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴',
    '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘',
    '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙',
    '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁',
    '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯'
  ],
  'رياضة وأنشطة': [
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓',
    '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿',
    '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂',
    '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️'
  ],
  'سفر وأماكن': [
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚',
    '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🚁', '✈️', '🛩️', '🛫', '🛬',
    '🪂', '💺', '🚀', '🛸', '🚉', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆',
    '🚇', '🚊', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🎢', '🎡', '🎠', '🏗️',
    '🗼', '🏭', '⛲', '🎪', '💒', '🏛️', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋',
    '⛱️', '🏖️', '🏝️', '🗻', '🌋', '⛰️', '🏔️', '🗾', '🏕️', '⛺', '🏠',
    '🏡', '🏘️', '🏚️', '🏗️', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨',
    '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🕋', '⛩️'
  ],
  'رموز وعلامات': [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕',
    '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️',
    '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌',
    '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️',
    '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐',
    '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️',
    '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷',
    '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️',
    '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯',
    '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾',
    '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼',
    '⚧️', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠',
    '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣',
    '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣'
  ],
  'أعلام': [
    '🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🇸🇦', '🇦🇪', '🇰🇼', '🇶🇦',
    '🇧🇭', '🇴🇲', '🇯🇴', '🇱🇧', '🇸🇾', '🇮🇶', '🇾🇪', '🇪🇬', '🇱🇾',
    '🇹🇳', '🇩🇿', '🇲🇦', '🇸🇩', '🇸🇴', '🇩🇯', '🇰🇲', '🇲🇷', '🇵🇸',
    '🇺🇸', '🇬🇧', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇷🇺', '🇨🇳', '🇯🇵',
    '🇰🇷', '🇮🇳', '🇧🇷', '🇨🇦', '🇦🇺', '🇲🇽', '🇹🇷', '🇮🇷', '🇦🇫',
    '🇵🇰', '🇧🇩', '🇲🇾', '🇮🇩', '🇹🇭', '🇻🇳', '🇵🇭', '🇸🇬', '🇲🇲',
    '🇰🇭', '🇱🇦', '🇧🇳', '🇹🇱', '🇫🇯', '🇵🇬', '🇳🇨', '🇻🇺', '🇼🇸',
    '🇰🇮', '🇹🇴', '🇹🇻', '🇳🇷', '🇵🇼', '🇫🇲', '🇲🇭', '🇬🇺', '🇲🇵',
    '🇦🇸', '🇺🇲', '🇻🇮', '🇵🇷', '🇩🇴', '🇭🇹', '🇯🇲', '🇨🇺', '🇧🇸'
  ]
}

const EMOJI_SEARCH_MAP: Record<string, string[]> = {
  'سعيد': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊'],
  'حب': ['❤️', '🧡', '💛', '💚', '💙', '💜', '💕', '💞', '💓', '💗', '💖', '💘'],
  'حزين': ['😢', '😭', '😔', '😞', '😓', '😩', '😫', '🥺'],
  'غضب': ['😤', '😡', '😠', '🤬', '💢'],
  'مفاجأة': ['😮', '😯', '😲', '😳', '🤯'],
  'نجح': ['✅', '✔️', '👍', '💯', '🎉', '🏆'],
  'فشل': ['❌', '👎', '💔', '😞'],
  'طعام': ['🍎', '🍕', '🍔', '🍜', '☕', '🥛'],
  'سفر': ['✈️', '🚗', '🏖️', '🗺️', '🧳'],
  'رياضة': ['⚽', '🏀', '🏈', '🎾', '🏐'],
  'عمل': ['💼', '💻', '📊', '📈', '📉', '📋'],
  'مدرسة': ['📚', '✏️', '📝', '🎓', '📖'],
  'طقس': ['☀️', '⛅', '☁️', '🌧️', '⛈️', '🌈', '❄️'],
  'وقت': ['⏰', '⏲️', '⏱️', '🕐', '🕑', '🕒'],
  'المال': ['💰', '💵', '💸', '💳', '🏦'],
  'نار': ['🔥', '💥', '⚡', '🌟', '✨'],
  'ماء': ['💧', '🌊', '🏊', '🚿', '⛲'],
  'هواء': ['💨', '🌪️', '🪁', '🎈'],
  'أرض': ['🌍', '🌎', '🌏', '🗺️', '🏔️'],
  'زهور': ['🌸', '🌺', '🌻', '🌷', '🌹', '💐'],
  'حيوانات': ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻'],
  'علم السعودية': ['🇸🇦'],
  'أعلام عربية': ['🇸🇦', '🇦🇪', '🇰🇼', '🇶🇦', '🇧🇭', '🇴🇲', '🇯🇴', '🇱🇧', '🇸🇾', '🇮🇶', '🇾🇪', '🇪🇬']
}

export function EnhancedRichTextEditor({ 
  value, 
  onChange, 
  placeholder = "اكتب محتوى المقال...", 
  className,
  enableImageUpload = true,
  enableEmoji = true,
  maxImageSize = 5
}: EnhancedRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [emojiSearch, setEmojiSearch] = useState('')
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('وجوه وأشخاص')
  const [isUploading, setIsUploading] = useState(false)

  // تطبيق التنسيق
  const applyFormat = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  // تحديث المحتوى
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  // إدراج رابط
  const insertLink = useCallback(() => {
    const url = prompt('أدخل الرابط:')
    if (url) {
      applyFormat('createLink', url)
    }
  }, [applyFormat])

  // إدراج صورة من رابط
  const insertImageFromUrl = useCallback(() => {
    const url = prompt('أدخل رابط الصورة:')
    if (url) {
      applyFormat('insertImage', url)
    }
  }, [applyFormat])

  // رفع صورة
  const uploadImage = useCallback(async (file: File) => {
    if (!file) return

    // فحص نوع الملف
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح')
      return
    }

    // فحص حجم الملف
    if (file.size > maxImageSize * 1024 * 1024) {
      toast.error(`حجم الصورة يجب أن يكون أقل من ${maxImageSize} ميجابايت`)
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'editor')

      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        // إدراج الصورة في المحرر
        const imageHtml = `<img src="${data.url}" alt="صورة مرفوعة" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" />`
        
        if (editorRef.current) {
          const selection = window.getSelection()
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            range.deleteContents()
            const div = document.createElement('div')
            div.innerHTML = imageHtml
            range.insertNode(div.firstChild!)
          } else {
            editorRef.current.innerHTML += imageHtml
          }
          handleInput()
        }
        
        toast.success('تم رفع الصورة بنجاح')
      } else {
        toast.error('فشل في رفع الصورة')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('حدث خطأ أثناء رفع الصورة')
    } finally {
      setIsUploading(false)
    }
  }, [maxImageSize, handleInput])

  // التعامل مع رفع الصور
  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadImage(file)
    }
    // إعادة تعيين قيمة input لتمكين رفع نفس الملف مرة أخرى
    event.target.value = ''
  }, [uploadImage])

  // التعامل مع drag and drop للصور
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    if (imageFile) {
      uploadImage(imageFile)
    }
  }, [uploadImage])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  // إدراج إيموجي
  const insertEmoji = useCallback((emoji: string) => {
    if (editorRef.current) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        range.insertNode(document.createTextNode(emoji))
        range.collapse(false)
      } else {
        editorRef.current.innerHTML += emoji
      }
      handleInput()
    }
    setShowEmojiPicker(false)
  }, [handleInput])

  // البحث في الإيموجي
  const getFilteredEmojis = useCallback((): string[] => {
    if (!emojiSearch.trim()) {
      return (EMOJI_CATEGORIES as Record<string, string[]>)[activeEmojiCategory] || []
    }

    const searchTerm = emojiSearch.toLowerCase()
    const matchingEmojis: string[] = []

    // البحث في خريطة الكلمات المفتاحية
    Object.entries(EMOJI_SEARCH_MAP).forEach(([keyword, emojis]) => {
      if (keyword.includes(searchTerm)) {
        matchingEmojis.push(...emojis)
      }
    })

    // إزالة المكررات
    return [...new Set(matchingEmojis)]
  }, [emojiSearch, activeEmojiCategory])

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

  return (
    <div className={cn("border rounded-lg overflow-hidden relative", className)}>
      {/* شريط الأدوات */}
      <div className="border-b bg-gray-50 dark:bg-gray-800 p-2 flex flex-wrap gap-1 items-center">
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
          onClick={insertImageFromUrl}
          title="إدراج صورة من رابط"
          className="h-8 w-8 p-0"
        >
          <Image className="h-4 w-4" />
        </Button>

        {enableImageUpload && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleImageUpload}
            disabled={isUploading}
            title="رفع صورة من الجهاز"
            className="h-8 w-8 p-0"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
          </Button>
        )}

        {enableEmoji && (
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="إضافة إيموجي"
              className="h-8 w-8 p-0"
            >
              <Smile className="h-4 w-4" />
            </Button>

            {showEmojiPicker && (
              <div className="absolute top-10 right-0 z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-lg w-80 max-h-96">
                {/* شريط البحث */}
                <div className="p-3 border-b">
                  <Input
                    type="text"
                    placeholder="ابحث عن إيموجي..."
                    value={emojiSearch}
                    onChange={(e) => setEmojiSearch(e.target.value)}
                    className="w-full text-sm"
                  />
                </div>

                {/* فئات الإيموجي */}
                {!emojiSearch && (
                  <div className="flex overflow-x-auto border-b">
                    {Object.keys(EMOJI_CATEGORIES).map((category) => (
                      <Button
                        key={category}
                        type="button"
                        variant={activeEmojiCategory === category ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveEmojiCategory(category)}
                        className="shrink-0 text-xs px-3 py-2"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                )}

                {/* عرض الإيموجي */}
                <div className="p-3 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-8 gap-2">
                    {getFilteredEmojis().map((emoji: string, index: number) => (
                      <button
                        key={`${emoji}-${index}`}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition-colors"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  
                  {getFilteredEmojis().length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      لم يتم العثور على إيموجي
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* منطقة التحرير */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
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

      {/* Input مخفي لرفع الملفات */}
      {enableImageUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      {/* إغلاق emoji picker عند الضغط خارجه */}
      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowEmojiPicker(false)}
        />
      )}

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
          direction: ltr;
          text-align: left;
        }
        
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
          margin: 10px 0;
        }

        [contenteditable] {
          outline: none;
        }

        [contenteditable]:focus {
          box-shadow: none;
        }
      `}</style>
    </div>
  )
}
