'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Table,
  Plus,
  Minus,
  Trash2,
  Merge,
  Split,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { ToolbarButton, ToolbarButtonGroup, ToolbarSeparator, ToolbarDropdown } from './ToolbarButton';
import { cn } from '@/lib/utils';

interface TableControlsProps {
  editor: Editor;
  className?: string;
}

export function TableControls({ editor, className }: TableControlsProps) {
  const [selectedStyle, setSelectedStyle] = useState('default');

  const tableStyles = [
    { id: 'default', name: 'جدول عادي', className: 'table-default' },
    { id: 'striped', name: 'جدول مخطط', className: 'table-striped' },
    { id: 'bordered', name: 'جدول بإطار', className: 'table-bordered' },
    { id: 'hover', name: 'جدول تفاعلي', className: 'table-hover' },
    { id: 'compact', name: 'جدول مضغوط', className: 'table-compact' },
    { id: 'modern', name: 'جدول حديث', className: 'table-modern' },
  ];

  const cellColors = [
    '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
    '#fef3c7', '#fed7aa', '#fecaca', '#f3e8ff',
    '#dbeafe', '#bbf7d0', '#fde68a', '#f9a8d4'
  ];

  const isInTable = editor.isActive('table') || editor.isActive('advancedTable');

  if (!isInTable) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <ToolbarDropdown
          trigger={
            <ToolbarButton
              icon={<Table className="h-4 w-4" />}
              tooltip="إدراج جدول"
            />
          }
        >
          <TableInsertGrid editor={editor} />
        </ToolbarDropdown>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1 p-2 bg-blue-50 dark:bg-blue-900 rounded-lg', className)}>
      {/* إدارة الصفوف */}
      <ToolbarButtonGroup>
        <ToolbarButton
          icon={<Plus className="h-4 w-4" />}
          tooltip="إضافة صف قبل"
          onClick={() => editor.chain().focus().addRowBefore().run()}
        />
        <ToolbarButton
          icon={<Plus className="h-4 w-4 rotate-90" />}
          tooltip="إضافة صف بعد"
          onClick={() => editor.chain().focus().addRowAfter().run()}
        />
        <ToolbarButton
          icon={<Minus className="h-4 w-4" />}
          tooltip="حذف صف"
          onClick={() => editor.chain().focus().deleteRow().run()}
        />
      </ToolbarButtonGroup>

      <ToolbarSeparator />

      {/* إدارة الأعمدة */}
      <ToolbarButtonGroup>
        <ToolbarButton
          icon={<Plus className="h-4 w-4" />}
          tooltip="إضافة عمود قبل"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
        />
        <ToolbarButton
          icon={<Plus className="h-4 w-4 rotate-90" />}
          tooltip="إضافة عمود بعد"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        />
        <ToolbarButton
          icon={<Minus className="h-4 w-4 rotate-90" />}
          tooltip="حذف عمود"
          onClick={() => editor.chain().focus().deleteColumn().run()}
        />
      </ToolbarButtonGroup>

      <ToolbarSeparator />

      {/* دمج وتقسيم الخلايا */}
      <ToolbarButtonGroup>
        <ToolbarButton
          icon={<Merge className="h-4 w-4" />}
          tooltip="دمج الخلايا"
          onClick={() => editor.chain().focus().mergeCells().run()}
        />
        <ToolbarButton
          icon={<Split className="h-4 w-4" />}
          tooltip="تقسيم الخلية"
          onClick={() => editor.chain().focus().splitCell().run()}
        />
      </ToolbarButtonGroup>

      <ToolbarSeparator />

      {/* محاذاة النص */}
      <ToolbarButtonGroup>
        <ToolbarButton
          icon={<AlignRight className="h-4 w-4" />}
          tooltip="محاذاة يمين"
          onClick={() => editor.chain().focus().setCellAttribute('textAlign', 'right').run()}
        />
        <ToolbarButton
          icon={<AlignCenter className="h-4 w-4" />}
          tooltip="محاذاة وسط"
          onClick={() => editor.chain().focus().setCellAttribute('textAlign', 'center').run()}
        />
        <ToolbarButton
          icon={<AlignLeft className="h-4 w-4" />}
          tooltip="محاذاة يسار"
          onClick={() => editor.chain().focus().setCellAttribute('textAlign', 'left').run()}
        />
      </ToolbarButtonGroup>

      <ToolbarSeparator />

      {/* ألوان الخلايا */}
      <ToolbarDropdown
        trigger={
          <ToolbarButton
            icon={<Palette className="h-4 w-4" />}
            tooltip="لون الخلية"
          />
        }
      >
        <CellColorPicker editor={editor} colors={cellColors} />
      </ToolbarDropdown>

      {/* أنماط الجدول */}
      <ToolbarDropdown
        trigger={
          <ToolbarButton
            icon={<Settings className="h-4 w-4" />}
            tooltip="نمط الجدول"
          />
        }
      >
        <TableStylePicker 
          editor={editor} 
          styles={tableStyles}
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
        />
      </ToolbarDropdown>

      <ToolbarSeparator />

      {/* المزيد من الخيارات */}
      <ToolbarDropdown
        trigger={
          <ToolbarButton
            icon={<MoreHorizontal className="h-4 w-4" />}
            tooltip="المزيد"
          />
        }
      >
        <TableMoreOptions editor={editor} />
      </ToolbarDropdown>

      {/* حذف الجدول */}
      <ToolbarButton
        icon={<Trash2 className="h-4 w-4" />}
        tooltip="حذف الجدول"
        onClick={() => editor.chain().focus().deleteTable().run()}
        variant="ghost"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      />
    </div>
  );
}

// مكون شبكة إدراج الجدول
function TableInsertGrid({ editor }: { editor: Editor }) {
  const [hoveredCell, setHoveredCell] = useState({ row: 0, col: 0 });
  const maxRows = 8;
  const maxCols = 8;

  const insertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({
      rows: rows + 1,
      cols: cols + 1,
      withHeaderRow: true
    }).run();
  };

  return (
    <div className="p-3">
      <div className="text-sm font-medium mb-2">اختر حجم الجدول</div>
      <div className="grid grid-cols-8 gap-1 mb-3">
        {Array.from({ length: maxRows * maxCols }, (_, index) => {
          const row = Math.floor(index / maxCols);
          const col = index % maxCols;
          const isHovered = row <= hoveredCell.row && col <= hoveredCell.col;
          
          return (
            <div
              key={index}
              className={cn(
                'w-4 h-4 border border-gray-300 cursor-pointer transition-colors',
                isHovered ? 'bg-blue-500' : 'bg-white hover:bg-blue-100'
              )}
              onMouseEnter={() => setHoveredCell({ row, col })}
              onClick={() => insertTable(row, col)}
            />
          );
        })}
      </div>
      <div className="text-xs text-gray-600 text-center">
        {hoveredCell.row + 1} × {hoveredCell.col + 1}
      </div>
      
      {/* خيارات سريعة */}
      <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
        <button
          className="w-full text-right p-2 hover:bg-gray-100 rounded text-sm"
          onClick={() => insertTable(2, 3)}
        >
          جدول صغير (3×3)
        </button>
        <button
          className="w-full text-right p-2 hover:bg-gray-100 rounded text-sm"
          onClick={() => insertTable(4, 5)}
        >
          جدول متوسط (5×5)
        </button>
        <button
          className="w-full text-right p-2 hover:bg-gray-100 rounded text-sm"
          onClick={() => insertTable(7, 7)}
        >
          جدول كبير (8×8)
        </button>
      </div>
    </div>
  );
}

// مكون منتقي ألوان الخلايا
function CellColorPicker({ editor, colors }: { editor: Editor; colors: string[] }) {
  const applyCellColor = (color: string) => {
    editor.chain().focus().setCellAttribute('backgroundColor', color).run();
  };

  return (
    <div className="p-3">
      <div className="text-sm font-medium mb-2">لون خلفية الخلية</div>
      <div className="grid grid-cols-6 gap-1 mb-3">
        {colors.map((color) => (
          <button
            key={color}
            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            onClick={() => applyCellColor(color)}
            title={color}
          />
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="color"
          className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
          onChange={(e) => applyCellColor(e.target.value)}
          title="لون مخصص"
        />
        <span className="text-xs text-gray-600">لون مخصص</span>
      </div>
      
      <button
        className="w-full mt-2 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        onClick={() => applyCellColor('')}
      >
        إزالة اللون
      </button>
    </div>
  );
}

// مكون منتقي أنماط الجدول
function TableStylePicker({ 
  editor, 
  styles, 
  selectedStyle, 
  onStyleChange 
}: { 
  editor: Editor; 
  styles: any[];
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}) {
  const applyTableStyle = (styleId: string) => {
    editor.chain().focus().setTableStyle(styleId).run();
    onStyleChange(styleId);
  };

  return (
    <div className="p-3">
      <div className="text-sm font-medium mb-2">نمط الجدول</div>
      <div className="space-y-1">
        {styles.map((style) => (
          <button
            key={style.id}
            className={cn(
              'w-full text-right p-2 rounded text-sm transition-colors',
              selectedStyle === style.id
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            )}
            onClick={() => applyTableStyle(style.id)}
          >
            {style.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// مكون خيارات إضافية للجدول
function TableMoreOptions({ editor }: { editor: Editor }) {
  return (
    <div className="p-3">
      <div className="text-sm font-medium mb-2">خيارات إضافية</div>
      <div className="space-y-1">
        <button
          className="w-full text-right p-2 hover:bg-gray-100 rounded text-sm"
          onClick={() => editor.chain().focus().toggleHeaderRow().run()}
        >
          تبديل صف الرأس
        </button>
        <button
          className="w-full text-right p-2 hover:bg-gray-100 rounded text-sm"
          onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
        >
          تبديل عمود الرأس
        </button>
        <button
          className="w-full text-right p-2 hover:bg-gray-100 rounded text-sm"
          onClick={() => editor.chain().focus().fixTables().run()}
        >
          إصلاح الجدول
        </button>
        <hr className="my-2" />
        <button
          className="w-full text-right p-2 hover:bg-red-50 text-red-600 rounded text-sm"
          onClick={() => editor.chain().focus().deleteTable().run()}
        >
          حذف الجدول
        </button>
      </div>
    </div>
  );
}

