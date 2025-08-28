// تصدير المحرر المتقدم ومكوناته
export { AdvancedEditor } from './AdvancedEditor';
export { MainToolbar } from './toolbar/MainToolbar';
export { ToolbarButton, ToolbarButtonGroup, ToolbarSeparator, ToolbarDropdown } from './toolbar/ToolbarButton';
export { ColorPicker } from './toolbar/ColorPicker';
export { FontSelector } from './toolbar/FontSelector';
export { EmojiPicker } from './toolbar/EmojiPicker';
export { SocialMediaEmbed } from './toolbar/SocialMediaEmbed';

// تصدير الأنواع والواجهات
export type {
  AdvancedEditorProps,
  EditorConfig,
  ToolbarConfig,
  ToolbarButton as ToolbarButtonType,
  ColorPalette,
  FontConfig,
  MediaConfig,
  SocialMediaConfig,
  EditorState,
  EditorCallbacks,
  QuoteStyle,
  CodeLanguage,
  TableConfig,
  EmojiCategory,
  LinkConfig,
  EditorEvent,
  EditorEventData,
  EditorExtension,
  CollaborationState,
  CollaborationUser,
  AutoSaveConfig,
  UndoRedoConfig,
  SearchConfig,
  SearchResult
} from './types';

// إعدادات افتراضية للمحرر
export const defaultEditorConfig: EditorConfig = {
  placeholder: 'ابدأ الكتابة...',
  editable: true,
  autofocus: false,
  enableCollaboration: false,
  enableAutoSave: true,
  autoSaveInterval: 2000,
  enableWordCount: true,
  enableCharacterCount: true,
  enableReadingTime: true,
  rtl: true,
  theme: 'auto'
};

export const defaultToolbarConfig: ToolbarConfig = {
  showBasicFormatting: true,
  showAdvancedFormatting: true,
  showTextAlignment: true,
  showLists: true,
  showQuotes: true,
  showCodeBlocks: true,
  showTables: true,
  showMedia: true,
  showLinks: true,
  showEmojis: true,
  showColors: true,
  showFonts: true,
  showSocialMedia: true,
  showYouTube: true
};

export const defaultColorPalette: ColorPalette = {
  textColors: [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF', '#6600FF',
    '#FF3366', '#FF9933', '#FFFF33', '#33FF33', '#3366FF', '#9933FF',
    '#990000', '#CC3300', '#FF6600', '#009900', '#003399', '#330099'
  ],
  backgroundColors: [
    'transparent', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD',
    '#FFE6E6', '#FFEDE6', '#FFF9E6', '#E6FFE6', '#E6F3FF', '#F0E6FF',
    '#FFD6E6', '#FFE6D6', '#FFFFD6', '#D6FFD6', '#D6E6FF', '#E6D6FF'
  ]
};

export const defaultFontConfig: FontConfig = {
  families: [
    'Arial, sans-serif',
    'Times New Roman, serif',
    'Helvetica, sans-serif',
    'Georgia, serif',
    'Verdana, sans-serif',
    'Tahoma, sans-serif',
    'Cairo, sans-serif',
    'Amiri, serif',
    'Noto Sans Arabic, sans-serif',
    'Tajawal, sans-serif'
  ],
  sizes: [10, 12, 14, 16, 18, 20, 24, 28, 32, 36],
  weights: [100, 300, 400, 500, 600, 700, 800, 900]
};

// دوال مساعدة
export const createAdvancedEditor = (props: Partial<AdvancedEditorProps> = {}) => {
  return {
    config: { ...defaultEditorConfig, ...props.config },
    toolbarConfig: { ...defaultToolbarConfig, ...props.toolbarConfig },
    colorPalette: { ...defaultColorPalette, ...props.colorPalette },
    fontConfig: { ...defaultFontConfig, ...props.fontConfig },
    ...props
  };
};

// ثوابت مفيدة
export const EDITOR_SHORTCUTS = {
  SAVE: 'Ctrl+S',
  BOLD: 'Ctrl+B',
  ITALIC: 'Ctrl+I',
  UNDERLINE: 'Ctrl+U',
  UNDO: 'Ctrl+Z',
  REDO: 'Ctrl+Y',
  LINK: 'Ctrl+K',
  CODE: 'Ctrl+`'
};

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

export const SUPPORTED_VIDEO_PLATFORMS = [
  'youtube',
  'vimeo',
  'dailymotion'
];

export const SUPPORTED_SOCIAL_PLATFORMS = [
  'twitter',
  'instagram',
  'facebook',
  'tiktok',
  'linkedin'
];

export const CODE_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', aliases: ['js'] },
  { id: 'typescript', name: 'TypeScript', aliases: ['ts'] },
  { id: 'python', name: 'Python', aliases: ['py'] },
  { id: 'java', name: 'Java' },
  { id: 'css', name: 'CSS' },
  { id: 'html', name: 'HTML' },
  { id: 'json', name: 'JSON' },
  { id: 'sql', name: 'SQL' },
  { id: 'php', name: 'PHP' },
  { id: 'ruby', name: 'Ruby', aliases: ['rb'] },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust', aliases: ['rs'] },
  { id: 'swift', name: 'Swift' },
  { id: 'kotlin', name: 'Kotlin', aliases: ['kt'] },
  { id: 'dart', name: 'Dart' },
  { id: 'bash', name: 'Bash', aliases: ['sh'] },
  { id: 'powershell', name: 'PowerShell', aliases: ['ps1'] },
  { id: 'yaml', name: 'YAML', aliases: ['yml'] },
  { id: 'xml', name: 'XML' },
  { id: 'markdown', name: 'Markdown', aliases: ['md'] }
];

