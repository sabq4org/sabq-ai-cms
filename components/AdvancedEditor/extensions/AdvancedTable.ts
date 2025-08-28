import { Node, mergeAttributes } from '@tiptap/core';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';

export interface AdvancedTableOptions {
  HTMLAttributes: Record<string, any>;
  resizable: boolean;
  handleWidth: number;
  cellMinWidth: number;
  allowTableNodeSelection: boolean;
  styles: {
    [key: string]: {
      name: string;
      className: string;
    };
  };
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    advancedTable: {
      insertTable: (options?: {
        rows?: number;
        cols?: number;
        withHeaderRow?: boolean;
        style?: string;
      }) => ReturnType;
      addColumnBefore: () => ReturnType;
      addColumnAfter: () => ReturnType;
      deleteColumn: () => ReturnType;
      addRowBefore: () => ReturnType;
      addRowAfter: () => ReturnType;
      deleteRow: () => ReturnType;
      deleteTable: () => ReturnType;
      mergeCells: () => ReturnType;
      splitCell: () => ReturnType;
      toggleHeaderColumn: () => ReturnType;
      toggleHeaderRow: () => ReturnType;
      toggleHeaderCell: () => ReturnType;
      mergeOrSplit: () => ReturnType;
      setCellAttribute: (name: string, value: any) => ReturnType;
      goToNextCell: () => ReturnType;
      goToPreviousCell: () => ReturnType;
      fixTables: () => ReturnType;
      setTableStyle: (style: string) => ReturnType;
    };
  }
}

export const AdvancedTable = Table.extend<AdvancedTableOptions>({
  name: 'advancedTable',

  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {},
      resizable: true,
      handleWidth: 5,
      cellMinWidth: 25,
      allowTableNodeSelection: true,
      styles: {
        default: {
          name: 'جدول عادي',
          className: 'table-default',
        },
        striped: {
          name: 'جدول مخطط',
          className: 'table-striped',
        },
        bordered: {
          name: 'جدول بإطار',
          className: 'table-bordered',
        },
        hover: {
          name: 'جدول تفاعلي',
          className: 'table-hover',
        },
        compact: {
          name: 'جدول مضغوط',
          className: 'table-compact',
        },
        modern: {
          name: 'جدول حديث',
          className: 'table-modern',
        },
      },
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: 'default',
        parseHTML: element => element.getAttribute('data-style'),
        renderHTML: attributes => {
          if (!attributes.style) {
            return {};
          }
          return {
            'data-style': attributes.style,
          };
        },
      },
      caption: {
        default: null,
        parseHTML: element => {
          const caption = element.querySelector('caption');
          return caption ? caption.textContent : null;
        },
        renderHTML: attributes => {
          if (!attributes.caption) {
            return {};
          }
          return {
            'data-caption': attributes.caption,
          };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes, node }) {
    const style = node.attrs.style || 'default';
    const styleConfig = this.options.styles[style] || this.options.styles.default;
    
    return [
      'div',
      { class: 'table-wrapper' },
      [
        'table',
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          class: `advanced-table ${styleConfig.className}`,
          'data-style': style,
        }),
        ...(node.attrs.caption ? [
          ['caption', { class: 'table-caption' }, node.attrs.caption]
        ] : []),
        ['tbody', 0],
      ],
    ];
  },

  addCommands() {
    return {
      ...this.parent?.(),
      insertTable:
        (options = {}) =>
        ({ tr, dispatch, editor }) => {
          const { rows = 3, cols = 3, withHeaderRow = true, style = 'default' } = options;

          const offset = tr.selection.anchor + 1;

          const nodes = [];
          const createCell = (cellType = 'tableCell', cellContent = '') => {
            if (cellContent) {
              return cellType === 'tableHeader'
                ? editor.schema.nodes.tableHeader.createAndFill({}, editor.schema.text(cellContent))
                : editor.schema.nodes.tableCell.createAndFill({}, editor.schema.text(cellContent));
            }
            return cellType === 'tableHeader'
              ? editor.schema.nodes.tableHeader.createAndFill()
              : editor.schema.nodes.tableCell.createAndFill();
          };

          for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
            const cells = [];

            for (let colIndex = 0; colIndex < cols; colIndex++) {
              const cellType = withHeaderRow && rowIndex === 0 ? 'tableHeader' : 'tableCell';
              const cellContent = withHeaderRow && rowIndex === 0 ? `عمود ${colIndex + 1}` : '';
              cells.push(createCell(cellType, cellContent));
            }

            nodes.push(editor.schema.nodes.tableRow.createAndFill({}, cells));
          }

          const table = editor.schema.nodes.advancedTable.createAndFill({ style }, nodes);

          if (!table) {
            return false;
          }

          if (dispatch) {
            tr.replaceSelectionWith(table).scrollIntoView();
          }

          return true;
        },

      setTableStyle:
        (style: string) =>
        ({ tr, dispatch, editor }) => {
          const { selection } = tr;
          const table = editor.schema.nodes.advancedTable;

          let tableNode = null;
          let tablePos = null;

          tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (node.type === table) {
              tableNode = node;
              tablePos = pos;
              return false;
            }
          });

          if (!tableNode || tablePos === null) {
            return false;
          }

          if (dispatch) {
            tr.setNodeMarkup(tablePos, undefined, {
              ...tableNode.attrs,
              style,
            });
          }

          return true;
        },
    };
  },
});

// إضافة خلية جدول متقدمة
export const AdvancedTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor || null,
        renderHTML: attributes => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
      textAlign: {
        default: 'right',
        parseHTML: element => element.style.textAlign || 'right',
        renderHTML: attributes => {
          if (!attributes.textAlign) {
            return {};
          }
          return {
            style: `text-align: ${attributes.textAlign}`,
          };
        },
      },
      verticalAlign: {
        default: 'top',
        parseHTML: element => element.style.verticalAlign || 'top',
        renderHTML: attributes => {
          if (!attributes.verticalAlign) {
            return {};
          }
          return {
            style: `vertical-align: ${attributes.verticalAlign}`,
          };
        },
      },
    };
  },
});

// إضافة رأس جدول متقدم
export const AdvancedTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor || null,
        renderHTML: attributes => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
      textAlign: {
        default: 'center',
        parseHTML: element => element.style.textAlign || 'center',
        renderHTML: attributes => {
          if (!attributes.textAlign) {
            return {};
          }
          return {
            style: `text-align: ${attributes.textAlign}`,
          };
        },
      },
    };
  },
});

// أنماط CSS للجداول المتقدمة
export const advancedTableStyles = `
  .table-wrapper {
    overflow-x: auto;
    margin: 1rem 0;
  }

  .advanced-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .advanced-table td,
  .advanced-table th {
    padding: 0.75rem;
    text-align: right;
    vertical-align: top;
    border: 1px solid #e5e7eb;
    position: relative;
  }

  .advanced-table th {
    font-weight: 600;
    background-color: #f9fafb;
    color: #374151;
  }

  .table-caption {
    caption-side: bottom;
    padding: 0.5rem;
    color: #6b7280;
    font-size: 0.875rem;
    text-align: center;
  }

  /* جدول عادي */
  .table-default {
    /* الأنماط الافتراضية */
  }

  /* جدول مخطط */
  .table-striped tbody tr:nth-child(odd) {
    background-color: #f9fafb;
  }

  /* جدول بإطار */
  .table-bordered {
    border: 2px solid #d1d5db;
  }

  .table-bordered td,
  .table-bordered th {
    border: 1px solid #d1d5db;
  }

  /* جدول تفاعلي */
  .table-hover tbody tr:hover {
    background-color: #f3f4f6;
    transition: background-color 0.15s ease-in-out;
  }

  /* جدول مضغوط */
  .table-compact td,
  .table-compact th {
    padding: 0.375rem 0.5rem;
    font-size: 0.8rem;
  }

  /* جدول حديث */
  .table-modern {
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .table-modern th {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
  }

  .table-modern td {
    border-left: none;
    border-right: none;
  }

  .table-modern tbody tr:last-child td {
    border-bottom: none;
  }

  /* أدوات تحرير الجدول */
  .table-controls {
    position: absolute;
    top: -2rem;
    right: 0;
    display: flex;
    gap: 0.25rem;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 10;
  }

  .advanced-table:hover .table-controls {
    opacity: 1;
  }

  .table-control-btn {
    padding: 0.25rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.75rem;
  }

  .table-control-btn:hover {
    background: #2563eb;
  }

  /* مؤشرات تحديد الخلايا */
  .selectedCell {
    background-color: rgba(59, 130, 246, 0.1) !important;
    position: relative;
  }

  .selectedCell::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid #3b82f6;
    pointer-events: none;
  }

  /* مقابض تغيير الحجم */
  .resize-cursor {
    cursor: col-resize;
  }

  .column-resize-handle {
    position: absolute;
    right: -2px;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: #3b82f6;
    opacity: 0;
    cursor: col-resize;
  }

  .column-resize-handle:hover,
  .column-resize-handle.dragging {
    opacity: 1;
  }

  /* الوضع المظلم */
  .dark .advanced-table {
    color: #f3f4f6;
  }

  .dark .advanced-table td,
  .dark .advanced-table th {
    border-color: #4b5563;
  }

  .dark .advanced-table th {
    background-color: #374151;
    color: #f3f4f6;
  }

  .dark .table-striped tbody tr:nth-child(odd) {
    background-color: #374151;
  }

  .dark .table-bordered {
    border-color: #6b7280;
  }

  .dark .table-hover tbody tr:hover {
    background-color: #4b5563;
  }

  .dark .table-caption {
    color: #9ca3af;
  }

  /* استجابة للأجهزة المحمولة */
  @media (max-width: 768px) {
    .table-wrapper {
      font-size: 0.8rem;
    }

    .advanced-table td,
    .advanced-table th {
      padding: 0.5rem 0.25rem;
    }

    .table-controls {
      position: static;
      margin-bottom: 0.5rem;
      opacity: 1;
    }
  }
`;

