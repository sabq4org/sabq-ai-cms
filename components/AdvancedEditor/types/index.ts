// أنواع وواجهات المحرر المتقدم

export interface EditorConfig {
  placeholder?: string;
  editable?: boolean;
  autofocus?: boolean;
  enableCollaboration?: boolean;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
  maxLength?: number;
  enableWordCount?: boolean;
  enableCharacterCount?: boolean;
  enableReadingTime?: boolean;
  rtl?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export interface ToolbarConfig {
  showBasicFormatting?: boolean;
  showAdvancedFormatting?: boolean;
  showTextAlignment?: boolean;
  showLists?: boolean;
  showQuotes?: boolean;
  showCodeBlocks?: boolean;
  showTables?: boolean;
  showMedia?: boolean;
  showLinks?: boolean;
  showEmojis?: boolean;
  showColors?: boolean;
  showFonts?: boolean;
  showSocialMedia?: boolean;
  showYouTube?: boolean;
  customButtons?: ToolbarButton[];
}

export interface ToolbarButton {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  isActive?: () => boolean;
  isDisabled?: () => boolean;
  tooltip?: string;
  group?: string;
}

export interface ColorPalette {
  textColors: string[];
  backgroundColors: string[];
  customColors?: string[];
}

export interface FontConfig {
  families: string[];
  sizes: number[];
  weights: number[];
}

export interface MediaConfig {
  maxFileSize: number;
  allowedTypes: string[];
  uploadEndpoint: string;
  cdnUrl?: string;
}

export interface SocialMediaConfig {
  twitter: {
    enabled: boolean;
    apiKey?: string;
  };
  instagram: {
    enabled: boolean;
    apiKey?: string;
  };
  facebook: {
    enabled: boolean;
    apiKey?: string;
  };
  tiktok: {
    enabled: boolean;
    apiKey?: string;
  };
  youtube: {
    enabled: boolean;
    apiKey?: string;
  };
}

export interface EditorState {
  content: string;
  wordCount: number;
  characterCount: number;
  readingTime: number;
  lastSaved?: Date;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error?: string;
}

export interface EditorCallbacks {
  onChange?: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
  onError?: (error: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSelectionChange?: (selection: any) => void;
}

export interface QuoteStyle {
  id: string;
  name: string;
  className: string;
  icon?: string;
}

export interface CodeLanguage {
  id: string;
  name: string;
  aliases: string[];
  extensions: string[];
}

export interface TableConfig {
  defaultRows: number;
  defaultColumns: number;
  maxRows: number;
  maxColumns: number;
  allowResize: boolean;
  allowMerge: boolean;
  allowSort: boolean;
}

export interface EmojiCategory {
  id: string;
  name: string;
  emojis: string[];
}

export interface LinkConfig {
  allowExternal: boolean;
  allowInternal: boolean;
  defaultTarget: '_blank' | '_self';
  showPreview: boolean;
}

export interface AdvancedEditorProps {
  initialContent?: string;
  config?: EditorConfig;
  toolbarConfig?: ToolbarConfig;
  colorPalette?: ColorPalette;
  fontConfig?: FontConfig;
  mediaConfig?: MediaConfig;
  socialMediaConfig?: SocialMediaConfig;
  callbacks?: EditorCallbacks;
  className?: string;
  style?: React.CSSProperties;
}

// أحداث المحرر
export type EditorEvent = 
  | 'content-changed'
  | 'selection-changed'
  | 'focus'
  | 'blur'
  | 'save'
  | 'error'
  | 'loading'
  | 'ready';

export interface EditorEventData {
  type: EditorEvent;
  data?: any;
  timestamp: Date;
}

// إضافات المحرر
export interface EditorExtension {
  name: string;
  version: string;
  enabled: boolean;
  config?: any;
}

// حالة التعاون
export interface CollaborationState {
  isEnabled: boolean;
  users: CollaborationUser[];
  currentUser?: CollaborationUser;
}

export interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: {
    x: number;
    y: number;
  };
  selection?: {
    from: number;
    to: number;
  };
}

// إعدادات الحفظ التلقائي
export interface AutoSaveConfig {
  enabled: boolean;
  interval: number;
  showIndicator: boolean;
  onSave: (content: string) => Promise<void>;
  onError: (error: string) => void;
}

// إعدادات التراجع والإعادة
export interface UndoRedoConfig {
  maxHistorySize: number;
  groupDelay: number;
}

// إعدادات البحث والاستبدال
export interface SearchConfig {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
}

export interface SearchResult {
  from: number;
  to: number;
  text: string;
}

