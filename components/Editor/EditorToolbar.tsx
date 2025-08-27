"use client";

import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { Editor } from "@tiptap/react";
import { useRef, useState } from "react";
import { uploadImageWithFallback } from "@/lib/safe-upload";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  FileText,
  Hash,
  Heading2,
  Image as ImageIcon,
  Italic,
  Lightbulb,
  Link,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Images,
  Loader2,
  Redo,
  Sparkles,
  Table,
  Underline as UnderlineIcon,
  Undo,
  Upload,
  Wand2,
  Youtube,
} from "lucide-react";

import ImageUploadDialog from "./ImageUploadDialog";

interface EditorToolbarProps {
  editor: Editor;
  enableAI?: boolean;
  onAIAction?: (action: string) => void;
}

export default function EditorToolbar({
  editor,
  enableAI = true,
  onAIAction,
}: EditorToolbarProps) {
  const { darkMode } = useDarkModeContext();
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showImageUploadDialog, setShowImageUploadDialog] = useState(false);
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const albumInputRef = useRef<HTMLInputElement | null>(null);
  const [albumUploading, setAlbumUploading] = useState(false);

  const buttonClass = `p-2 rounded transition-colors ${
    darkMode
      ? "hover:bg-gray-700 text-gray-300"
      : "hover:bg-gray-100 text-gray-700"
  }`;

  const activeButtonClass = darkMode ? "bg-gray-700" : "bg-gray-200";

  const dividerClass = `w-px h-6 mx-1 ${
    darkMode ? "bg-gray-700" : "bg-gray-300"
  }`;

  // دالة لإضافة صورة من URL
  const addImageFromUrl = () => {
    const url = window.prompt("أدخل رابط الصورة:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setShowImageDialog(false);
  };

  // دالة لإضافة صورة مرفوعة
  const addImageFromUpload = (url: string, alt?: string, title?: string) => {
    console.log("🖼️ إدراج صورة مرفوعة في المحرر:", { url, alt, title });

    const imageAttrs: { src: string; alt?: string; title?: string } = {
      src: url,
    };
    if (alt) imageAttrs.alt = alt;
    if (title) imageAttrs.title = title;

    editor.chain().focus().setImage(imageAttrs).run();
    setShowImageUploadDialog(false);
  };

  // دالة لإضافة فيديو يوتيوب
  const addYoutube = () => {
    const url = window.prompt("أدخل رابط فيديو YouTube:");
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
    setShowYoutubeDialog(false);
  };

  // رفع ألبوم صور متعدد وإدراجه داخل المحرر
  const onAlbumFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setAlbumUploading(true);
      for (const file of Array.from(files)) {
        // استخدام رافع آمن مع fallback لتجنب مشاكل Content-Type
        const result: any = await uploadImageWithFallback(file, 'gallery');
        const url = result?.cloudinaryUrl || result?.url || result?.asset?.cloudinaryUrl;
        if (url) editor.chain().focus().setImage({ src: url }).run();
      }
    } finally {
      setAlbumUploading(false);
      if (albumInputRef.current) albumInputRef.current.value = "";
    }
  };

  // دالة لإضافة رابط
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("أدخل الرابط:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setShowLinkDialog(false);
  };

  // قائمة إجراءات الذكاء الاصطناعي
  const aiActions = [
    { id: "generate_paragraph", label: "✍️ توليد فقرة", icon: Wand2 },
    { id: "rewrite", label: "🧠 إعادة صياغة", icon: FileText },
    { id: "summarize", label: "📋 تلخيص", icon: FileText },
    { id: "suggest_tags", label: "🏷️ اقتراح وسوم", icon: Hash },
    { id: "generate_title", label: "🎯 توليد عنوان", icon: Lightbulb },
  ];

  return (
    <div
      className={`border-b ${
        darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
      } p-2`}
    >
      {/* الصف الأول - أدوات التنسيق الأساسية */}
      <div className="flex items-center gap-1 flex-wrap mb-2">
        {/* التراجع والإعادة */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={`${buttonClass} ${
            !editor.can().undo() ? "opacity-50" : ""
          }`}
          title="تراجع"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={`${buttonClass} ${
            !editor.can().redo() ? "opacity-50" : ""
          }`}
          title="إعادة"
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className={dividerClass} />

        {/* تنسيق النص */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${buttonClass} ${
            editor.isActive("bold") ? activeButtonClass : ""
          }`}
          title="غامق"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${buttonClass} ${
            editor.isActive("italic") ? activeButtonClass : ""
          }`}
          title="مائل"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${buttonClass} ${
            editor.isActive("underline") ? activeButtonClass : ""
          }`}
          title="تحته خط"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`${buttonClass} ${
            editor.isActive("code") ? activeButtonClass : ""
          }`}
          title="كود"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className={dividerClass} />

        {/* العناوين والفقرات */}
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`${buttonClass} ${
            editor.isActive("heading", { level: 2 }) ? activeButtonClass : ""
          }`}
          title="عنوان"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${buttonClass} ${
            editor.isActive("blockquote") ? activeButtonClass : ""
          }`}
          title="اقتباس"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className={dividerClass} />

        {/* القوائم */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${buttonClass} ${
            editor.isActive("bulletList") ? activeButtonClass : ""
          }`}
          title="قائمة نقطية"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${buttonClass} ${
            editor.isActive("orderedList") ? activeButtonClass : ""
          }`}
          title="قائمة مرقمة"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className={dividerClass} />

        {/* المحاذاة */}
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`${buttonClass} ${
            editor.isActive({ textAlign: "right" }) ? activeButtonClass : ""
          }`}
          title="محاذاة لليمين"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`${buttonClass} ${
            editor.isActive({ textAlign: "center" }) ? activeButtonClass : ""
          }`}
          title="محاذاة للوسط"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`${buttonClass} ${
            editor.isActive({ textAlign: "left" }) ? activeButtonClass : ""
          }`}
          title="محاذاة لليسار"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`${buttonClass} ${
            editor.isActive({ textAlign: "justify" }) ? activeButtonClass : ""
          }`}
          title="محاذاة الجانبين"
        >
          <AlignJustify className="w-4 h-4" />
        </button>
      </div>

      {/* الصف الثاني - الوسائط والذكاء الاصطناعي */}
      <div className="flex items-center gap-1 flex-wrap">
        {/* الوسائط */}
        {/* أزرار الوسائط */}
        <button
          onClick={setLink}
          className={`${buttonClass} ${
            editor.isActive("link") ? activeButtonClass : ""
          }`}
          title="إضافة رابط"
        >
          <Link className="w-4 h-4" />
        </button>

        {/* قائمة منسدلة للصور */}
        <div className="relative">
          <button
            onClick={() => setShowImageDialog(!showImageDialog)}
            className={`${buttonClass} ${
              showImageDialog ? activeButtonClass : ""
            }`}
            title="إضافة صورة"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {showImageDialog && (
            <div
              className={`absolute top-full mt-1 z-50 min-w-[200px] rounded-lg shadow-lg border ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setShowImageUploadDialog(true);
                    setShowImageDialog(false);
                  }}
                  className={`w-full text-right px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  رفع صورة من الجهاز
                </button>
                <button
                  onClick={() => {
                    addImageFromUrl();
                    setShowImageDialog(false);
                  }}
                  className={`w-full text-right px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  إدراج من رابط
                </button>
              </div>
            </div>
          )}
        </div>
        {/* زر ألبوم الصور (رفع متعدد) */}
        <input
          ref={albumInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onAlbumFilesSelected}
          className="hidden"
        />
        <button
          onClick={() => albumInputRef.current?.click()}
          className={`${buttonClass} ${albumUploading ? 'opacity-60' : ''}`}
          title="ألبوم الصور (رفع مجموعة صور)"
          disabled={albumUploading}
        >
          <Images className="w-4 h-4" />
        </button>
        <button
          onClick={addYoutube}
          className={buttonClass}
          title="إضافة فيديو YouTube"
        >
          <Youtube className="w-4 h-4" />
        </button>
        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          className={buttonClass}
          title="إضافة جدول"
        >
          <Table className="w-4 h-4" />
        </button>

        {enableAI && (
          <>
            <div className={dividerClass} />

            {/* زر الذكاء الاصطناعي */}
            <div className="relative">
              <button
                onClick={() => setShowAIMenu(!showAIMenu)}
                className={`${buttonClass} flex items-center gap-1 px-3 ${
                  darkMode
                    ? "bg-purple-900 hover:bg-purple-800"
                    : "bg-purple-100 hover:bg-purple-200"
                } text-purple-600 dark:text-purple-300`}
                title="أدوات الذكاء الاصطناعي"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">AI</span>
              </button>

              {/* قائمة الذكاء الاصطناعي */}
              {showAIMenu && (
                <div
                  className={`absolute top-full mt-2 right-0 z-50 rounded-lg shadow-lg ${
                    darkMode
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-white border border-gray-200"
                  } min-w-[200px]`}
                >
                  {aiActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => {
                          onAIAction?.(action.id);
                          setShowAIMenu(false);
                        }}
                        className={`w-full text-right px-4 py-2 flex items-center gap-2 transition-colors ${
                          darkMode
                            ? "hover:bg-gray-700 text-gray-300"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* حوار رفع الصور */}
      <ImageUploadDialog
        isOpen={showImageUploadDialog}
        onClose={() => setShowImageUploadDialog(false)}
        onImageSelected={addImageFromUpload}
      />
    </div>
  );
}
