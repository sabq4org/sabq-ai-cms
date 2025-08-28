import { Node, mergeAttributes } from '@tiptap/core';

export interface BlockquoteOptions {
  HTMLAttributes: Record<string, any>;
  styles: {
    [key: string]: {
      name: string;
      className: string;
      icon?: string;
    };
  };
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customBlockquote: {
      /**
       * Set a blockquote with custom style
       */
      setBlockquote: (style?: string) => ReturnType;
      /**
       * Toggle a blockquote with custom style
       */
      toggleBlockquote: (style?: string) => ReturnType;
      /**
       * Unset a blockquote
       */
      unsetBlockquote: () => ReturnType;
    };
  }
}

export const CustomBlockquote = Node.create<BlockquoteOptions>({
  name: 'customBlockquote',

  addOptions() {
    return {
      HTMLAttributes: {},
      styles: {
        default: {
          name: 'اقتباس عادي',
          className: 'blockquote-default',
        },
        highlighted: {
          name: 'اقتباس مميز',
          className: 'blockquote-highlighted',
        },
        bordered: {
          name: 'اقتباس بإطار',
          className: 'blockquote-bordered',
        },
        colored: {
          name: 'اقتباس ملون',
          className: 'blockquote-colored',
        },
        pullquote: {
          name: 'اقتباس بارز',
          className: 'blockquote-pullquote',
        },
        testimonial: {
          name: 'شهادة',
          className: 'blockquote-testimonial',
        },
      },
    };
  },

  content: 'block+',

  group: 'block',

  defining: true,

  addAttributes() {
    return {
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
      author: {
        default: null,
        parseHTML: element => element.getAttribute('data-author'),
        renderHTML: attributes => {
          if (!attributes.author) {
            return {};
          }

          return {
            'data-author': attributes.author,
          };
        },
      },
      source: {
        default: null,
        parseHTML: element => element.getAttribute('data-source'),
        renderHTML: attributes => {
          if (!attributes.source) {
            return {};
          }

          return {
            'data-source': attributes.source,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'blockquote',
        getAttrs: element => {
          const style = (element as HTMLElement).getAttribute('data-style') || 'default';
          const author = (element as HTMLElement).getAttribute('data-author');
          const source = (element as HTMLElement).getAttribute('data-source');

          return { style, author, source };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const style = node.attrs.style || 'default';
    const styleConfig = this.options.styles[style] || this.options.styles.default;
    
    return [
      'blockquote',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `custom-blockquote ${styleConfig.className}`,
        'data-style': style,
      }),
      [
        'div',
        { class: 'blockquote-content' },
        0,
      ],
      ...(node.attrs.author || node.attrs.source ? [
        [
          'footer',
          { class: 'blockquote-footer' },
          ...(node.attrs.author ? [
            ['cite', { class: 'blockquote-author' }, node.attrs.author]
          ] : []),
          ...(node.attrs.source ? [
            ['span', { class: 'blockquote-source' }, ` — ${node.attrs.source}`]
          ] : []),
        ]
      ] : []),
    ];
  },

  addCommands() {
    return {
      setBlockquote:
        (style = 'default') =>
        ({ commands }) => {
          return commands.wrapIn(this.name, { style });
        },
      toggleBlockquote:
        (style = 'default') =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, { style });
        },
      unsetBlockquote:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-b': () => this.editor.commands.toggleBlockquote(),
    };
  },
});

// أنماط CSS للاقتباسات المخصصة
export const blockquoteStyles = `
  .custom-blockquote {
    margin: 1.5rem 0;
    position: relative;
  }

  .blockquote-content {
    font-style: italic;
    font-size: 1.1em;
    line-height: 1.6;
  }

  .blockquote-footer {
    margin-top: 0.5rem;
    font-size: 0.9em;
    color: #6b7280;
  }

  .blockquote-author {
    font-weight: 600;
    font-style: normal;
  }

  .blockquote-source {
    color: #9ca3af;
  }

  /* اقتباس عادي */
  .blockquote-default {
    border-right: 4px solid #e5e7eb;
    padding-right: 1rem;
    color: #6b7280;
  }

  /* اقتباس مميز */
  .blockquote-highlighted {
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    border-radius: 0.5rem;
    padding: 1.5rem;
    border-right: 4px solid #3b82f6;
    position: relative;
  }

  .blockquote-highlighted::before {
    content: '"';
    position: absolute;
    top: -0.5rem;
    right: 1rem;
    font-size: 4rem;
    color: #3b82f6;
    opacity: 0.3;
    font-family: serif;
  }

  /* اقتباس بإطار */
  .blockquote-bordered {
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    background: #f9fafb;
    position: relative;
  }

  .blockquote-bordered::before,
  .blockquote-bordered::after {
    content: '"';
    position: absolute;
    font-size: 2rem;
    color: #9ca3af;
    font-family: serif;
  }

  .blockquote-bordered::before {
    top: 0.5rem;
    right: 0.5rem;
  }

  .blockquote-bordered::after {
    bottom: 0.5rem;
    left: 0.5rem;
    transform: rotate(180deg);
  }

  /* اقتباس ملون */
  .blockquote-colored {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    border-radius: 0.5rem;
    padding: 1.5rem;
    border-right: 4px solid #2563eb;
    color: #1e40af;
  }

  .blockquote-colored .blockquote-footer {
    color: #3730a3;
  }

  /* اقتباس بارز */
  .blockquote-pullquote {
    text-align: center;
    font-size: 1.25em;
    font-weight: 600;
    padding: 2rem;
    margin: 2rem 0;
    border-top: 2px solid #e5e7eb;
    border-bottom: 2px solid #e5e7eb;
    position: relative;
  }

  .blockquote-pullquote::before,
  .blockquote-pullquote::after {
    content: '';
    position: absolute;
    width: 50px;
    height: 2px;
    background: #3b82f6;
    left: 50%;
    transform: translateX(-50%);
  }

  .blockquote-pullquote::before {
    top: -1px;
  }

  .blockquote-pullquote::after {
    bottom: -1px;
  }

  /* شهادة */
  .blockquote-testimonial {
    background: #f8fafc;
    border-radius: 1rem;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .blockquote-testimonial::before {
    content: '★★★★★';
    display: block;
    color: #fbbf24;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  .blockquote-testimonial .blockquote-footer {
    margin-top: 1rem;
    font-weight: 600;
    color: #374151;
  }

  /* الوضع المظلم */
  .dark .blockquote-default {
    border-right-color: #4b5563;
    color: #9ca3af;
  }

  .dark .blockquote-highlighted {
    background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
    border-right-color: #60a5fa;
  }

  .dark .blockquote-highlighted::before {
    color: #60a5fa;
  }

  .dark .blockquote-bordered {
    border-color: #4b5563;
    background: #374151;
  }

  .dark .blockquote-colored {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    border-right-color: #60a5fa;
    color: #dbeafe;
  }

  .dark .blockquote-pullquote {
    border-color: #4b5563;
    color: #f3f4f6;
  }

  .dark .blockquote-pullquote::before,
  .dark .blockquote-pullquote::after {
    background: #60a5fa;
  }

  .dark .blockquote-testimonial {
    background: #374151;
    color: #f3f4f6;
  }
`;

