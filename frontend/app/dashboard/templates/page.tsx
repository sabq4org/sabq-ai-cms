'use client'

import { useState } from 'react'
import { Plus, Layout, Square, Sidebar, ImagePlus } from 'lucide-react'
import { TemplatesList } from './components/TemplatesList'
import { TemplateEditor } from './components/TemplateEditor'
import { Template, TemplateType } from '@/app/lib/types'

export default function TemplatesPage() {
  const [selectedType, setSelectedType] = useState<TemplateType>('header')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const templateTypes = [
    { type: 'header' as TemplateType, label: 'الهيدر', icon: Layout },
    { type: 'footer' as TemplateType, label: 'الفوتر', icon: Square },
    { type: 'sidebar' as TemplateType, label: 'الشريط الجانبي', icon: Sidebar },
    { type: 'banner' as TemplateType, label: 'البنرات', icon: ImagePlus }
  ]

  const handleCreateNew = () => {
    setSelectedTemplate(null)
    setIsCreating(true)
    setIsEditing(true)
  }

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setIsEditing(true)
    setIsCreating(false)
  }

  const handleSaveTemplate = (templateData: Partial<Template>) => {
    // حفظ القالب عبر API
    console.log('Saving template:', templateData)
    setIsEditing(false)
    setIsCreating(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setIsCreating(false)
    setSelectedTemplate(null)
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">القوالب</h1>
          <p className="text-gray-500">إدارة قوالب الموقع والعناصر الثابتة</p>
        </div>

        {!isEditing ? (
          <>
            {/* Template Type Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 space-x-reverse">
                {templateTypes.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`
                      flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                      ${selectedType === type
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Action Bar */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  قوالب {templateTypes.find(t => t.type === selectedType)?.label}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedType === 'header' && 'قوالب رأس الصفحة - الشعار والقوائم والشريط العلوي'}
                  {selectedType === 'footer' && 'قوالب ذيل الصفحة - الروابط ومعلومات التواصل'}
                  {selectedType === 'sidebar' && 'قوالب الشريط الجانبي - الأقسام والإعلانات'}
                  {selectedType === 'banner' && 'قوالب البنرات الإعلانية والترويجية'}
                </p>
              </div>
              <button
                onClick={handleCreateNew}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                قالب جديد
              </button>
            </div>

            {/* Templates List */}
            <TemplatesList
              type={selectedType}
              onEdit={handleEditTemplate}
            />
          </>
        ) : (
          /* Template Editor */
          <TemplateEditor
            template={selectedTemplate}
            type={selectedType}
            isNew={isCreating}
            onSave={handleSaveTemplate}
            onCancel={handleCancelEdit}
          />
        )}
      </div>
    </div>
  )
} 