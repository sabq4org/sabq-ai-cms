import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

interface SmartLink {
  entityId: string;
  matchedText: string;
  startPos: number;
  endPos: number;
  confidence: number;
  entity: {
    id: string;
    name: string;
    name_ar: string;
    entity_type: {
      name: string;
      name_ar: string;
      icon: string;
      color: string;
    };
    description: string;
    importance_score: number;
    slug: string;
    official_website: string;
  };
  suggestedLink: {
    type: 'entity' | 'tooltip' | 'modal' | 'external';
    url?: string;
    tooltip_content?: string;
  };
}

export interface SmartLinksOptions {
  onAnalyzeText?: (text: string) => Promise<SmartLink[]>;
  onLinkClick?: (link: SmartLink) => void;
  enableTooltips?: boolean;
  autoAnalyze?: boolean;
  debounceDelay?: number;
  className?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    smartLinks: {
      analyzeText: () => ReturnType;
      addSmartLink: (link: SmartLink) => ReturnType;
      removeSmartLink: (entityId: string) => ReturnType;
      toggleSmartLinks: () => ReturnType;
    };
  }
}

export const SmartLinksExtension = Extension.create<SmartLinksOptions>({
  name: 'smartLinks',

  addOptions() {
    return {
      onAnalyzeText: undefined,
      onLinkClick: undefined,
      enableTooltips: true,
      autoAnalyze: true,
      debounceDelay: 1000,
      className: 'smart-link',
    };
  },

  addStorage() {
    return {
      smartLinks: [] as SmartLink[],
      isAnalyzing: false,
      isEnabled: true,
    };
  },

  addCommands() {
    return {
      analyzeText: () => ({ editor, tr }) => {
        if (!this.options.onAnalyzeText || this.storage.isAnalyzing) {
          return false;
        }

        this.storage.isAnalyzing = true;
        const text = editor.getText();
        
        this.options.onAnalyzeText(text)
          .then((links: SmartLink[]) => {
            this.storage.smartLinks = links;
            this.storage.isAnalyzing = false;
            
            // تحديث الزخارف
            const plugin = smartLinksPlugin.getState(editor.state);
            if (plugin) {
              editor.view.dispatch(
                editor.view.state.tr.setMeta(smartLinksPluginKey, { 
                  type: 'updateLinks',
                  links 
                })
              );
            }
          })
          .catch((error) => {
            console.error('خطأ في تحليل النص:', error);
            this.storage.isAnalyzing = false;
          });

        return true;
      },

      addSmartLink: (link: SmartLink) => ({ editor, tr }) => {
        const existingIndex = this.storage.smartLinks.findIndex(
          (l: SmartLink) => l.entityId === link.entityId
        );

        if (existingIndex !== -1) {
          this.storage.smartLinks[existingIndex] = link;
        } else {
          this.storage.smartLinks.push(link);
        }

        return true;
      },

      removeSmartLink: (entityId: string) => ({ editor, tr }) => {
        this.storage.smartLinks = this.storage.smartLinks.filter(
          (link: SmartLink) => link.entityId !== entityId
        );
        return true;
      },

      toggleSmartLinks: () => ({ editor, tr }) => {
        this.storage.isEnabled = !this.storage.isEnabled;
        return true;
      },
    };
  },

  addProseMirrorPlugins() {
    return [smartLinksPlugin];
  },
});

// مفتاح البرنامج المساعد
export const smartLinksPluginKey = new PluginKey('smartLinks');

// البرنامج المساعد الرئيسي
const smartLinksPlugin = new Plugin({
  key: smartLinksPluginKey,
  
  state: {
    init(_, state) {
      return {
        decorations: DecorationSet.empty,
        links: [] as SmartLink[],
      };
    },
    
    apply(tr, value, oldState, newState) {
      const meta = tr.getMeta(smartLinksPluginKey);
      
      if (meta?.type === 'updateLinks') {
        const { links } = meta;
        return {
          ...value,
          links,
          decorations: createDecorations(newState.doc, links),
        };
      }
      
      // تحديث المواضع عند تغيير الوثيقة
      if (tr.docChanged && value.links.length > 0) {
        return {
          ...value,
          decorations: createDecorations(newState.doc, value.links),
        };
      }
      
      return value;
    },
  },
  
  props: {
    decorations(state) {
      const pluginState = this.getState(state);
      return pluginState?.decorations || DecorationSet.empty;
    },
    
    handleClick(view, pos, event) {
      const pluginState = this.getState(view.state);
      if (!pluginState?.links.length) return false;
      
      // البحث عن الرابط المنقر عليه
      const clickedLink = pluginState.links.find(link => {
        return pos >= link.startPos && pos <= link.endPos;
      });
      
      if (clickedLink) {
        // إشعار بالنقر على الرابط الذكي
        const customEvent = new CustomEvent('smartLinkClick', {
          detail: { link: clickedLink }
        });
        document.dispatchEvent(customEvent);
        return true;
      }
      
      return false;
    },
  },
});

// دالة إنشاء الزخارف
function createDecorations(doc: any, links: SmartLink[]): DecorationSet {
  const decorations: Decoration[] = [];
  
  links.forEach(link => {
    if (link.startPos < doc.content.size && link.endPos <= doc.content.size) {
      const decoration = Decoration.inline(
        link.startPos,
        link.endPos,
        {
          class: `smart-link smart-link-${link.entity.entity_type.name}`,
          'data-entity-id': link.entityId,
          'data-tooltip': link.suggestedLink.tooltip_content,
          'data-confidence': link.confidence.toString(),
          'data-importance': link.entity.importance_score.toString(),
          style: `
            position: relative;
            background: linear-gradient(90deg, 
              ${link.entity.entity_type.color}20 0%, 
              ${link.entity.entity_type.color}10 100%);
            border-bottom: 2px solid ${link.entity.entity_type.color};
            border-radius: 3px;
            padding: 1px 3px;
            cursor: pointer;
            transition: all 0.2s ease;
          `,
          title: `${link.entity.entity_type.icon} ${link.entity.name_ar} - ${link.entity.description}`,
        },
        {
          // خصائص إضافية للزخرفة
          inclusive: false,
          smartLink: link,
        }
      );
      
      decorations.push(decoration);
    }
  });
  
  return DecorationSet.create(doc, decorations);
} 