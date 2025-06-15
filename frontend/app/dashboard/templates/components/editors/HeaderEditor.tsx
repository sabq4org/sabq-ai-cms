'use client'

import { useState } from 'react'
import { Plus, Trash2, Move, Upload, Link, Type, Palette, Settings } from 'lucide-react'

interface HeaderContent {
  logo?: {
    url: string
    alt: string
    width?: number
    height?: number
  }
  navigation?: {
    items: Array<{
      label: string
      url: string
      order: number
    }>
  }
  topBar?: {
    showBreakingNews?: boolean
    showDateTime?: boolean
    showWeather?: boolean
    backgroundColor?: string
    textColor?: string
  }
  socialLinks?: Array<{
    platform: string
    url: string
  }>
  theme?: {
    primaryColor?: string
    backgroundColor?: string
  }
}

interface HeaderEditorProps {
  content: HeaderContent
  onChange: (content: HeaderContent) => void
}

export function HeaderEditor({ content, onChange }: HeaderEditorProps) {
  const [activeSection, setActiveSection] = useState<'logo' | 'navigation' | 'topbar' | 'social' | 'theme'>('logo')

  const updateContent = (section: keyof HeaderContent, value: any) => {
    onChange({ ...content, [section]: value })
  }

  const addNavigationItem = () => {
    const currentItems = content.navigation?.items || []
    const newItem = {
      label: 'رابط جديد',
      url: '#',
      order: currentItems.length + 1
    }
    updateContent('navigation', { items: [...currentItems, newItem] })
  }

  const updateNavigationItem = (index: number, field: string, value: string) => {
    const items = [...(content.navigation?.items || [])]
    items[index] = { ...items[index], [field]: value }
    updateContent('navigation', { items })
  }

  const removeNavigationItem = (index: number) => {
    const items = content.navigation?.items || []
    updateContent('navigation', { items: items.filter((_, i) => i !== index) })
  }

  const addSocialLink = () => {
    const currentLinks = content.socialLinks || []
    updateContent('socialLinks', [...currentLinks, { platform: 'twitter', url: '' }])
  }

  const updateSocialLink = (index: number, field: string, value: string) => {
    const links = [...(content.socialLinks || [])]
    links[index] = { ...links[index], [field]: value }
    updateContent('socialLinks', links)
  }

  const removeSocialLink = (index: number) => {
    const links = content.socialLinks || []
    updateContent('socialLinks', links.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-xl">
        <button
          onClick={() => setActiveSection('logo')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSection === 'logo'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          الشعار
        </button>
        <button
          onClick={() => setActiveSection('navigation')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSection === 'navigation'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          القوائم
        </button>
        <button
          onClick={() => setActiveSection('topbar')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSection === 'topbar'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          الشريط العلوي
        </button>
        <button
          onClick={() => setActiveSection('social')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSection === 'social'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          روابط التواصل
        </button>
        <button
          onClick={() => setActiveSection('theme')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSection === 'theme'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          المظهر
        </button>
      </div>

      {/* Logo Section */}
      {activeSection === 'logo' && (
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            الشعار
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">رابط الشعار</label>
              <input
                type="text"
                value={content.logo?.url || ''}
                onChange={(e) => updateContent('logo', { ...content.logo, url: e.target.value })}
                className="modern-input text-sm"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">النص البديل</label>
              <input
                type="text"
                value={content.logo?.alt || ''}
                onChange={(e) => updateContent('logo', { ...content.logo, alt: e.target.value })}
                className="modern-input text-sm"
                placeholder="شعار الموقع"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">العرض (px)</label>
              <input
                type="number"
                value={content.logo?.width || 180}
                onChange={(e) => updateContent('logo', { ...content.logo, width: parseInt(e.target.value) })}
                className="modern-input text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">الارتفاع (px)</label>
              <input
                type="number"
                value={content.logo?.height || 60}
                onChange={(e) => updateContent('logo', { ...content.logo, height: parseInt(e.target.value) })}
                className="modern-input text-sm"
              />
            </div>
          </div>

          <button className="btn-secondary text-sm flex items-center gap-2">
            <Upload className="w-4 h-4" />
            رفع شعار جديد
          </button>
        </div>
      )}

      {/* Navigation Section */}
      {activeSection === 'navigation' && (
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Link className="w-4 h-4" />
              قوائم التنقل
            </h3>
            <button
              onClick={addNavigationItem}
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              إضافة رابط
            </button>
          </div>

          <div className="space-y-2">
            {(content.navigation?.items || []).map((item, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3">
                <Move className="w-4 h-4 text-gray-400 cursor-move" />
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateNavigationItem(index, 'label', e.target.value)}
                  className="flex-1 px-3 py-1 text-sm border border-gray-200 rounded"
                  placeholder="اسم الرابط"
                />
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => updateNavigationItem(index, 'url', e.target.value)}
                  className="flex-1 px-3 py-1 text-sm border border-gray-200 rounded"
                  placeholder="الرابط"
                  dir="ltr"
                />
                <button
                  onClick={() => removeNavigationItem(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Bar Section */}
      {activeSection === 'topbar' && (
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            الشريط العلوي
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={content.topBar?.showBreakingNews || false}
                onChange={(e) => updateContent('topBar', { ...content.topBar, showBreakingNews: e.target.checked })}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm text-gray-700">عرض الأخبار العاجلة</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={content.topBar?.showDateTime || false}
                onChange={(e) => updateContent('topBar', { ...content.topBar, showDateTime: e.target.checked })}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm text-gray-700">عرض التاريخ والوقت</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={content.topBar?.showWeather || false}
                onChange={(e) => updateContent('topBar', { ...content.topBar, showWeather: e.target.checked })}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm text-gray-700">عرض حالة الطقس</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">لون الخلفية</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={content.topBar?.backgroundColor || '#1e40af'}
                  onChange={(e) => updateContent('topBar', { ...content.topBar, backgroundColor: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={content.topBar?.backgroundColor || '#1e40af'}
                  onChange={(e) => updateContent('topBar', { ...content.topBar, backgroundColor: e.target.value })}
                  className="flex-1 modern-input text-sm"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">لون النص</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={content.topBar?.textColor || '#ffffff'}
                  onChange={(e) => updateContent('topBar', { ...content.topBar, textColor: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={content.topBar?.textColor || '#ffffff'}
                  onChange={(e) => updateContent('topBar', { ...content.topBar, textColor: e.target.value })}
                  className="flex-1 modern-input text-sm"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Links Section */}
      {activeSection === 'social' && (
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">روابط التواصل الاجتماعي</h3>
            <button
              onClick={addSocialLink}
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              إضافة رابط
            </button>
          </div>

          <div className="space-y-2">
            {(content.socialLinks || []).map((link, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3">
                <select
                  value={link.platform}
                  onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-200 rounded"
                >
                  <option value="twitter">Twitter / X</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="tiktok">TikTok</option>
                  <option value="snapchat">Snapchat</option>
                  <option value="telegram">Telegram</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                  className="flex-1 px-3 py-1 text-sm border border-gray-200 rounded"
                  placeholder="رابط الحساب"
                  dir="ltr"
                />
                <button
                  onClick={() => removeSocialLink(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theme Section */}
      {activeSection === 'theme' && (
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            المظهر والألوان
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">اللون الأساسي</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={content.theme?.primaryColor || '#007bff'}
                  onChange={(e) => updateContent('theme', { ...content.theme, primaryColor: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={content.theme?.primaryColor || '#007bff'}
                  onChange={(e) => updateContent('theme', { ...content.theme, primaryColor: e.target.value })}
                  className="flex-1 modern-input text-sm"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">لون الخلفية</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={content.theme?.backgroundColor || '#ffffff'}
                  onChange={(e) => updateContent('theme', { ...content.theme, backgroundColor: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={content.theme?.backgroundColor || '#ffffff'}
                  onChange={(e) => updateContent('theme', { ...content.theme, backgroundColor: e.target.value })}
                  className="flex-1 modern-input text-sm"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 