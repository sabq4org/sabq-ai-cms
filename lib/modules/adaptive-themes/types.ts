/**
 * نظام السمات التكيفية - تعريفات الأنواع
 * Adaptive Themes System Type Definitions
 */

// Theme Core Types
export interface Theme {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  version: string;
  author: string;
  preview_url?: string;
  thumbnail_url?: string;
  is_default: boolean;
  is_active: boolean;
  is_premium: boolean;
  price?: number;
  category: ThemeCategory;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  config: ThemeConfiguration;
  assets: ThemeAssets;
  customizations: ThemeCustomizations;
  responsive_breakpoints: ResponsiveBreakpoints;
  accessibility_features: AccessibilityFeatures;
  performance_settings: ThemePerformanceSettings;
}

export type ThemeCategory = 
  | 'news' 
  | 'magazine' 
  | 'blog' 
  | 'corporate' 
  | 'minimal' 
  | 'creative' 
  | 'dark' 
  | 'light'
  | 'rtl_optimized'
  | 'accessibility_focused';

// Theme Configuration
export interface ThemeConfiguration {
  colors: ColorPalette;
  typography: TypographySettings;
  layout: LayoutSettings;
  animations: AnimationSettings;
  spacing: SpacingSettings;
  borders: BorderSettings;
  shadows: ShadowSettings;
  effects: VisualEffects;
  components: ComponentStyles;
  variables: ThemeVariables;
}

export interface ColorPalette {
  primary: ColorSet;
  secondary: ColorSet;
  accent: ColorSet;
  neutral: ColorSet;
  semantic: SemanticColors;
  gradients: GradientSet[];
  dark_mode_overrides?: Partial<ColorPalette>;
}

export interface ColorSet {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // base color
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  success: ColorSet;
  warning: ColorSet;
  error: ColorSet;
  info: ColorSet;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
    link: string;
    link_hover: string;
  };
  border: {
    light: string;
    medium: string;
    heavy: string;
    focus: string;
  };
}

export interface GradientSet {
  name: string;
  type: 'linear' | 'radial' | 'conic';
  colors: string[];
  direction?: string;
  css: string;
}

// Typography
export interface TypographySettings {
  font_families: FontFamilySet;
  font_sizes: FontSizeScale;
  font_weights: FontWeightScale;
  line_heights: LineHeightScale;
  letter_spacings: LetterSpacingScale;
  text_transforms: TextTransformSettings;
  arabic_fonts: ArabicFontSettings;
}

export interface FontFamilySet {
  primary: FontFamily;
  secondary: FontFamily;
  monospace: FontFamily;
  arabic_primary: FontFamily;
  arabic_secondary: FontFamily;
}

export interface FontFamily {
  name: string;
  fallbacks: string[];
  google_font?: boolean;
  font_weight_range?: [number, number];
  font_display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  preload?: boolean;
}

export interface FontSizeScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
  '7xl': string;
  '8xl': string;
  '9xl': string;
}

export interface FontWeightScale {
  thin: number;
  extralight: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

export interface LineHeightScale {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

export interface LetterSpacingScale {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

export interface TextTransformSettings {
  uppercase_headings: boolean;
  capitalize_buttons: boolean;
  preserve_arabic_text: boolean;
}

export interface ArabicFontSettings {
  font_feature_settings: string;
  text_rendering: 'auto' | 'optimizeSpeed' | 'optimizeLegibility' | 'geometricPrecision';
  font_kerning: 'auto' | 'normal' | 'none';
  font_variant_ligatures: string;
}

// Layout
export interface LayoutSettings {
  containers: ContainerSettings;
  grid: GridSettings;
  flexbox: FlexboxSettings;
  positioning: PositioningSettings;
  responsive: ResponsiveSettings;
}

export interface ContainerSettings {
  max_widths: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  padding: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  centered: boolean;
}

export interface GridSettings {
  columns: number;
  gap: string;
  auto_fit_min: string;
  auto_fill_min: string;
}

export interface FlexboxSettings {
  default_gap: string;
  align_items: 'start' | 'center' | 'end' | 'stretch';
  justify_content: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export interface PositioningSettings {
  z_index_scale: {
    dropdown: number;
    sticky: number;
    fixed: number;
    modal_backdrop: number;
    modal: number;
    popover: number;
    tooltip: number;
    toast: number;
  };
}

export interface ResponsiveSettings {
  mobile_first: boolean;
  breakpoint_strategy: 'content_based' | 'device_based' | 'hybrid';
  fluid_typography: boolean;
  container_queries: boolean;
}

// Animations
export interface AnimationSettings {
  enabled: boolean;
  duration_scale: DurationScale;
  easing_functions: EasingFunctions;
  presets: AnimationPresets;
  reduced_motion_fallbacks: boolean;
  performance_mode: 'smooth' | 'performance' | 'auto';
}

export interface DurationScale {
  'faster': string;
  'fast': string;
  'normal': string;
  'slow': string;
  'slower': string;
}

export interface EasingFunctions {
  ease_in: string;
  ease_out: string;
  ease_in_out: string;
  ease_in_back: string;
  ease_out_back: string;
  ease_in_out_back: string;
  bounce: string;
  elastic: string;
}

export interface AnimationPresets {
  fade_in: AnimationKeyframes;
  slide_in: AnimationKeyframes;
  scale_in: AnimationKeyframes;
  rotate_in: AnimationKeyframes;
  bounce_in: AnimationKeyframes;
  pulse: AnimationKeyframes;
  shake: AnimationKeyframes;
  glow: AnimationKeyframes;
}

export interface AnimationKeyframes {
  name: string;
  keyframes: string;
  duration: string;
  easing: string;
  fill_mode: 'none' | 'forwards' | 'backwards' | 'both';
}

// Spacing and Borders
export interface SpacingSettings {
  scale: SpacingScale;
  auto_margins: boolean;
  negative_margins: boolean;
}

export interface SpacingScale {
  '0': string;
  'px': string;
  '0.5': string;
  '1': string;
  '1.5': string;
  '2': string;
  '2.5': string;
  '3': string;
  '3.5': string;
  '4': string;
  '5': string;
  '6': string;
  '7': string;
  '8': string;
  '9': string;
  '10': string;
  '11': string;
  '12': string;
  '14': string;
  '16': string;
  '20': string;
  '24': string;
  '28': string;
  '32': string;
  '36': string;
  '40': string;
  '44': string;
  '48': string;
  '52': string;
  '56': string;
  '60': string;
  '64': string;
  '72': string;
  '80': string;
  '96': string;
}

export interface BorderSettings {
  widths: BorderWidthScale;
  styles: BorderStyleSet;
  radius: BorderRadiusScale;
}

export interface BorderWidthScale {
  '0': string;
  'px': string;
  '1': string;
  '2': string;
  '4': string;
  '8': string;
}

export interface BorderStyleSet {
  solid: string;
  dashed: string;
  dotted: string;
  double: string;
  groove: string;
  ridge: string;
  inset: string;
  outset: string;
}

export interface BorderRadiusScale {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

// Shadows and Effects
export interface ShadowSettings {
  box_shadows: BoxShadowScale;
  text_shadows: TextShadowScale;
  drop_shadows: DropShadowScale;
}

export interface BoxShadowScale {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface TextShadowScale {
  none: string;
  sm: string;
  md: string;
  lg: string;
}

export interface DropShadowScale {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface VisualEffects {
  backdrop_blur: boolean;
  backdrop_filters: BackdropFilterSet;
  filters: FilterSet;
  blend_modes: BlendModeSet;
  opacity_scale: OpacityScale;
}

export interface BackdropFilterSet {
  blur: string[];
  brightness: string[];
  contrast: string[];
  grayscale: string[];
  hue_rotate: string[];
  invert: string[];
  saturate: string[];
  sepia: string[];
}

export interface FilterSet {
  blur: string[];
  brightness: string[];
  contrast: string[];
  drop_shadow: string[];
  grayscale: string[];
  hue_rotate: string[];
  invert: string[];
  saturate: string[];
  sepia: string[];
}

export interface BlendModeSet {
  normal: string;
  multiply: string;
  screen: string;
  overlay: string;
  darken: string;
  lighten: string;
  color_dodge: string;
  color_burn: string;
  hard_light: string;
  soft_light: string;
  difference: string;
  exclusion: string;
}

export interface OpacityScale {
  '0': string;
  '5': string;
  '10': string;
  '20': string;
  '25': string;
  '30': string;
  '40': string;
  '50': string;
  '60': string;
  '70': string;
  '75': string;
  '80': string;
  '90': string;
  '95': string;
  '100': string;
}

// Component Styles
export interface ComponentStyles {
  buttons: ButtonStyles;
  forms: FormStyles;
  cards: CardStyles;
  navigation: NavigationStyles;
  typography: ComponentTypographyStyles;
  media: MediaStyles;
  overlays: OverlayStyles;
}

export interface ButtonStyles {
  base: ComponentStyle;
  variants: {
    primary: ComponentStyle;
    secondary: ComponentStyle;
    outline: ComponentStyle;
    ghost: ComponentStyle;
    link: ComponentStyle;
    destructive: ComponentStyle;
  };
  sizes: {
    sm: ComponentStyle;
    md: ComponentStyle;
    lg: ComponentStyle;
    xl: ComponentStyle;
  };
  states: {
    hover: ComponentStyle;
    focus: ComponentStyle;
    active: ComponentStyle;
    disabled: ComponentStyle;
    loading: ComponentStyle;
  };
}

export interface FormStyles {
  input: ComponentStyle;
  textarea: ComponentStyle;
  select: ComponentStyle;
  checkbox: ComponentStyle;
  radio: ComponentStyle;
  switch: ComponentStyle;
  label: ComponentStyle;
  error: ComponentStyle;
  help_text: ComponentStyle;
}

export interface CardStyles {
  base: ComponentStyle;
  variants: {
    elevated: ComponentStyle;
    outlined: ComponentStyle;
    filled: ComponentStyle;
    ghost: ComponentStyle;
  };
  header: ComponentStyle;
  body: ComponentStyle;
  footer: ComponentStyle;
  image: ComponentStyle;
}

export interface NavigationStyles {
  navbar: ComponentStyle;
  sidebar: ComponentStyle;
  breadcrumb: ComponentStyle;
  tabs: ComponentStyle;
  pagination: ComponentStyle;
  menu: ComponentStyle;
  dropdown: ComponentStyle;
}

export interface ComponentTypographyStyles {
  headings: {
    h1: ComponentStyle;
    h2: ComponentStyle;
    h3: ComponentStyle;
    h4: ComponentStyle;
    h5: ComponentStyle;
    h6: ComponentStyle;
  };
  body: ComponentStyle;
  caption: ComponentStyle;
  code: ComponentStyle;
  link: ComponentStyle;
  blockquote: ComponentStyle;
}

export interface MediaStyles {
  image: ComponentStyle;
  video: ComponentStyle;
  audio: ComponentStyle;
  avatar: ComponentStyle;
  icon: ComponentStyle;
  logo: ComponentStyle;
}

export interface OverlayStyles {
  modal: ComponentStyle;
  drawer: ComponentStyle;
  popover: ComponentStyle;
  tooltip: ComponentStyle;
  alert: ComponentStyle;
  toast: ComponentStyle;
  loading: ComponentStyle;
}

export interface ComponentStyle {
  base_classes: string[];
  css_properties: Record<string, string>;
  pseudo_classes?: Record<string, Record<string, string>>;
  responsive_variants?: Record<string, Record<string, string>>;
  dark_mode_overrides?: Record<string, string>;
}

// Theme Variables
export interface ThemeVariables {
  css_custom_properties: Record<string, string>;
  scss_variables: Record<string, string>;
  js_tokens: Record<string, any>;
  design_tokens: DesignTokens;
}

export interface DesignTokens {
  space: Record<string, string>;
  color: Record<string, string>;
  typography: Record<string, string>;
  shadow: Record<string, string>;
  border: Record<string, string>;
  motion: Record<string, string>;
  size: Record<string, string>;
  layout: Record<string, string>;
}

// Theme Assets
export interface ThemeAssets {
  css_files: ThemeAssetFile[];
  js_files: ThemeAssetFile[];
  font_files: ThemeAssetFile[];
  image_files: ThemeAssetFile[];
  icon_files: ThemeAssetFile[];
  custom_files: ThemeAssetFile[];
}

export interface ThemeAssetFile {
  name: string;
  path: string;
  type: 'css' | 'js' | 'font' | 'image' | 'icon' | 'other';
  size: number;
  version: string;
  checksum: string;
  is_critical: boolean;
  load_priority: 'high' | 'medium' | 'low';
  conditions?: AssetLoadConditions;
}

export interface AssetLoadConditions {
  media_query?: string;
  route_pattern?: string;
  user_preference?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  connection_type?: 'slow' | 'fast';
}

// Theme Customizations
export interface ThemeCustomizations {
  user_overrides: UserThemeOverrides;
  component_overrides: ComponentOverrides;
  layout_customizations: LayoutCustomizations;
  content_customizations: ContentCustomizations;
  brand_customizations: BrandCustomizations;
}

export interface UserThemeOverrides {
  colors: Partial<ColorPalette>;
  typography: Partial<TypographySettings>;
  spacing: Partial<SpacingSettings>;
  custom_css: string;
  component_variants: Record<string, string>;
}

export interface ComponentOverrides {
  hidden_components: string[];
  component_replacements: Record<string, ComponentReplacement>;
  custom_components: CustomComponent[];
}

export interface ComponentReplacement {
  original_component: string;
  replacement_component: string;
  replacement_props?: Record<string, any>;
}

export interface CustomComponent {
  name: string;
  template: string;
  styles: string;
  script?: string;
  props_schema: Record<string, any>;
}

export interface LayoutCustomizations {
  header_layout: HeaderLayout;
  footer_layout: FooterLayout;
  sidebar_layout: SidebarLayout;
  content_layout: ContentLayout;
  widget_areas: WidgetArea[];
}

export interface HeaderLayout {
  type: 'minimal' | 'standard' | 'mega' | 'centered' | 'custom';
  height: string;
  sticky: boolean;
  transparent: boolean;
  components: LayoutComponent[];
}

export interface FooterLayout {
  type: 'minimal' | 'standard' | 'mega' | 'custom';
  columns: number;
  components: LayoutComponent[];
}

export interface SidebarLayout {
  enabled: boolean;
  position: 'left' | 'right';
  width: string;
  collapsible: boolean;
  components: LayoutComponent[];
}

export interface ContentLayout {
  type: 'single' | 'sidebar' | 'dual_sidebar' | 'grid' | 'masonry';
  max_width: string;
  components: LayoutComponent[];
}

export interface LayoutComponent {
  id: string;
  type: string;
  position: number;
  props: Record<string, any>;
  conditions?: ComponentConditions;
}

export interface ComponentConditions {
  show_on_routes?: string[];
  hide_on_routes?: string[];
  user_roles?: string[];
  device_types?: string[];
  time_conditions?: TimeCondition[];
}

export interface TimeCondition {
  start_time: string;
  end_time: string;
  days_of_week?: number[];
  timezone?: string;
}

export interface WidgetArea {
  id: string;
  name: string;
  description: string;
  max_widgets: number;
  allowed_widget_types: string[];
  default_widgets: LayoutComponent[];
}

export interface ContentCustomizations {
  article_layout: ArticleLayout;
  listing_layout: ListingLayout;
  archive_layout: ArchiveLayout;
  search_layout: SearchLayout;
}

export interface ArticleLayout {
  header_components: LayoutComponent[];
  content_components: LayoutComponent[];
  footer_components: LayoutComponent[];
  sidebar_components: LayoutComponent[];
  related_articles: RelatedArticlesConfig;
  comments: CommentsConfig;
  social_sharing: SocialSharingConfig;
}

export interface ListingLayout {
  style: 'grid' | 'list' | 'masonry' | 'carousel';
  items_per_page: number;
  pagination_style: 'numbered' | 'load_more' | 'infinite';
  featured_layout: FeaturedLayout;
  filters: FilterConfig[];
  sorting: SortingConfig;
}

export interface ArchiveLayout {
  header_style: 'minimal' | 'banner' | 'hero';
  description_position: 'before' | 'after' | 'sidebar';
  breadcrumb_style: 'simple' | 'styled' | 'hidden';
  layout_inheritance: boolean;
}

export interface SearchLayout {
  instant_search: boolean;
  search_suggestions: boolean;
  filters_sidebar: boolean;
  results_layout: 'list' | 'grid' | 'compact';
  no_results_message: string;
  search_analytics: boolean;
}

export interface RelatedArticlesConfig {
  enabled: boolean;
  count: number;
  algorithm: 'tags' | 'categories' | 'ai' | 'manual';
  layout: 'grid' | 'list' | 'carousel';
  position: 'after_content' | 'sidebar' | 'before_comments';
}

export interface CommentsConfig {
  enabled: boolean;
  system: 'built_in' | 'disqus' | 'facebook' | 'custom';
  moderation: boolean;
  guest_comments: boolean;
  nested_comments: boolean;
  max_depth: number;
}

export interface SocialSharingConfig {
  enabled: boolean;
  platforms: string[];
  position: 'top' | 'bottom' | 'floating' | 'multiple';
  style: 'buttons' | 'icons' | 'native';
  count_display: boolean;
}

export interface FeaturedLayout {
  enabled: boolean;
  count: number;
  style: 'hero' | 'slider' | 'grid' | 'list';
  auto_rotate: boolean;
  rotation_interval: number;
}

export interface FilterConfig {
  type: 'category' | 'tag' | 'date' | 'author' | 'custom';
  label: string;
  multiple_selection: boolean;
  default_expanded: boolean;
  position: number;
}

export interface SortingConfig {
  enabled: boolean;
  default_sort: 'date' | 'title' | 'popularity' | 'custom';
  available_sorts: string[];
  user_selectable: boolean;
}

export interface BrandCustomizations {
  logo: LogoConfig;
  favicon: FaviconConfig;
  brand_colors: BrandColors;
  social_profiles: SocialProfile[];
  contact_info: ContactInfo;
  seo_defaults: SEODefaults;
}

export interface LogoConfig {
  primary_logo: string;
  secondary_logo?: string;
  favicon_logo: string;
  dark_mode_logo?: string;
  max_width: string;
  max_height: string;
  alt_text: string;
}

export interface FaviconConfig {
  ico_file: string;
  png_files: FaviconSize[];
  svg_file?: string;
  apple_touch_icon: string;
  manifest_file?: string;
}

export interface FaviconSize {
  size: string;
  file: string;
  purpose?: 'any' | 'maskable';
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  brand_gradient?: string;
}

export interface SocialProfile {
  platform: string;
  url: string;
  username?: string;
  display_name?: string;
  icon?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  business_hours?: string;
  timezone?: string;
}

export interface SEODefaults {
  site_title: string;
  site_description: string;
  default_image: string;
  twitter_handle?: string;
  facebook_app_id?: string;
  google_analytics_id?: string;
  google_tag_manager_id?: string;
}

// Responsive and Accessibility
export interface ResponsiveBreakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  custom_breakpoints?: Record<string, string>;
}

export interface AccessibilityFeatures {
  high_contrast_mode: boolean;
  keyboard_navigation: boolean;
  screen_reader_optimizations: boolean;
  focus_management: boolean;
  aria_labels: boolean;
  color_blind_support: boolean;
  text_scaling: boolean;
  reduced_motion: boolean;
  skip_links: boolean;
  landmark_navigation: boolean;
}

// Performance
export interface ThemePerformanceSettings {
  css_optimization: CSSOptimization;
  js_optimization: JSOptimization;
  image_optimization: ImageOptimization;
  font_optimization: FontOptimization;
  caching_strategy: CachingStrategy;
  lazy_loading: LazyLoadingConfig;
  critical_css: CriticalCSSConfig;
}

export interface CSSOptimization {
  minification: boolean;
  purge_unused: boolean;
  compression: boolean;
  inline_critical: boolean;
  defer_non_critical: boolean;
}

export interface JSOptimization {
  minification: boolean;
  tree_shaking: boolean;
  code_splitting: boolean;
  compression: boolean;
  defer_loading: boolean;
}

export interface ImageOptimization {
  responsive_images: boolean;
  webp_support: boolean;
  lazy_loading: boolean;
  compression_quality: number;
  blur_placeholder: boolean;
}

export interface FontOptimization {
  font_display: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  preload_fonts: boolean;
  subset_fonts: boolean;
  fallback_fonts: boolean;
}

export interface CachingStrategy {
  css_cache_duration: string;
  js_cache_duration: string;
  image_cache_duration: string;
  font_cache_duration: string;
  cache_busting: boolean;
}

export interface LazyLoadingConfig {
  images: boolean;
  videos: boolean;
  iframes: boolean;
  components: boolean;
  threshold: string;
  root_margin: string;
}

export interface CriticalCSSConfig {
  enabled: boolean;
  above_fold_css: boolean;
  inline_threshold: string;
  extract_method: 'automatic' | 'manual' | 'ai';
}

// Theme Management Types
export interface ThemeService {
  // Theme CRUD operations
  get_all_themes(): Promise<Theme[]>;
  get_theme_by_id(id: string): Promise<Theme | null>;
  create_theme(theme: Omit<Theme, 'id' | 'created_at' | 'updated_at'>): Promise<Theme>;
  update_theme(id: string, updates: Partial<Theme>): Promise<Theme>;
  delete_theme(id: string): Promise<boolean>;
  
  // Theme activation and management
  activate_theme(id: string): Promise<boolean>;
  deactivate_theme(id: string): Promise<boolean>;
  get_active_theme(): Promise<Theme | null>;
  preview_theme(id: string, options?: PreviewOptions): Promise<ThemePreview>;
  
  // Theme customization
  customize_theme(theme_id: string, customizations: Partial<ThemeCustomizations>): Promise<Theme>;
  reset_customizations(theme_id: string): Promise<Theme>;
  export_customizations(theme_id: string): Promise<string>;
  import_customizations(theme_id: string, customizations: string): Promise<Theme>;
  
  // Theme compilation and generation
  compile_theme_css(theme: Theme): Promise<string>;
  generate_theme_variables(theme: Theme): Promise<ThemeVariables>;
  build_theme_bundle(theme: Theme, options?: BuildOptions): Promise<ThemeBundle>;
  
  // Theme validation and testing
  validate_theme(theme: Theme): Promise<ThemeValidationResult>;
  test_theme_performance(theme: Theme): Promise<ThemePerformanceReport>;
  check_accessibility(theme: Theme): Promise<AccessibilityReport>;
  
  // Theme marketplace and installation
  install_theme_from_url(url: string): Promise<Theme>;
  install_theme_from_zip(zip_data: ArrayBuffer): Promise<Theme>;
  update_theme_from_marketplace(theme_id: string): Promise<Theme>;
  
  // Theme backup and restore
  backup_theme(theme_id: string): Promise<ThemeBackup>;
  restore_theme(backup: ThemeBackup): Promise<Theme>;
  
  // Advanced features
  generate_adaptive_variants(base_theme: Theme, conditions: AdaptiveConditions[]): Promise<Theme[]>;
  optimize_theme_for_device(theme: Theme, device_type: DeviceType): Promise<Theme>;
  create_theme_from_brand_guidelines(guidelines: BrandGuidelines): Promise<Theme>;
}

// Additional Types for Theme Service
export interface PreviewOptions {
  device: DeviceType;
  viewport_size?: { width: number; height: number };
  user_preferences?: UserPreferences;
  demo_content?: boolean;
}

export interface ThemePreview {
  preview_url: string;
  screenshot_url: string;
  mobile_screenshot_url: string;
  tablet_screenshot_url: string;
  accessibility_score: number;
  performance_score: number;
  responsive_score: number;
}

export interface BuildOptions {
  minify: boolean;
  include_source_maps: boolean;
  target_browsers: string[];
  include_unused_styles: boolean;
  optimize_images: boolean;
}

export interface ThemeBundle {
  css_files: string[];
  js_files: string[];
  asset_files: ThemeAssetFile[];
  manifest: ThemeBundleManifest;
  size_report: BundleSizeReport;
}

export interface ThemeBundleManifest {
  theme_id: string;
  version: string;
  build_time: Date;
  build_options: BuildOptions;
  dependencies: ThemeDependency[];
  entry_points: EntryPoint[];
}

export interface ThemeDependency {
  name: string;
  version: string;
  type: 'css' | 'js' | 'font' | 'icon';
  cdn_url?: string;
  local_path?: string;
}

export interface EntryPoint {
  name: string;
  file: string;
  critical: boolean;
  async: boolean;
}

export interface BundleSizeReport {
  total_size: number;
  gzipped_size: number;
  css_size: number;
  js_size: number;
  asset_size: number;
  size_breakdown: Record<string, number>;
}

export interface ThemeValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  accessibility_issues: AccessibilityIssue[];
  performance_issues: PerformanceIssue[];
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  file?: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  file?: string;
  line?: number;
  suggestion?: string;
}

export interface ValidationSuggestion {
  type: 'optimization' | 'accessibility' | 'performance' | 'best_practice';
  message: string;
  priority: 'high' | 'medium' | 'low';
  auto_fixable: boolean;
}

export interface AccessibilityIssue {
  type: 'color_contrast' | 'keyboard_navigation' | 'screen_reader' | 'focus_management';
  severity: 'error' | 'warning';
  element?: string;
  description: string;
  fix_suggestion: string;
  wcag_guideline?: string;
}

export interface PerformanceIssue {
  type: 'large_bundle' | 'unused_css' | 'slow_loading' | 'render_blocking';
  impact: 'high' | 'medium' | 'low';
  description: string;
  metric_affected: string;
  improvement_suggestion: string;
}

export interface ThemePerformanceReport {
  overall_score: number;
  load_time: number;
  bundle_size: number;
  critical_css_size: number;
  unused_css_percentage: number;
  image_optimization_score: number;
  font_loading_score: number;
  javascript_score: number;
  recommendations: PerformanceRecommendation[];
}

export interface PerformanceRecommendation {
  category: 'css' | 'javascript' | 'images' | 'fonts' | 'general';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  potential_savings: string;
}

export interface AccessibilityReport {
  overall_score: number;
  color_contrast_score: number;
  keyboard_navigation_score: number;
  screen_reader_score: number;
  focus_management_score: number;
  semantic_markup_score: number;
  issues_found: AccessibilityIssue[];
  recommendations: AccessibilityRecommendation[];
}

export interface AccessibilityRecommendation {
  wcag_level: 'A' | 'AA' | 'AAA';
  guideline: string;
  description: string;
  implementation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ThemeBackup {
  id: string;
  theme_id: string;
  theme_data: Theme;
  backup_date: Date;
  description?: string;
  file_size: number;
  checksum: string;
}

export interface AdaptiveConditions {
  device_type?: DeviceType;
  screen_size?: ScreenSize;
  user_preferences?: UserPreferences;
  time_of_day?: TimeRange;
  user_behavior?: UserBehaviorPattern;
  content_type?: string;
  geographic_location?: GeographicLocation;
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'tv' | 'watch' | 'auto';

export interface ScreenSize {
  width: number;
  height: number;
  pixel_density: number;
  orientation: 'portrait' | 'landscape';
}

export interface UserPreferences {
  dark_mode: boolean;
  reduced_motion: boolean;
  high_contrast: boolean;
  large_text: boolean;
  color_blind_support: boolean;
  language: string;
  rtl_layout: boolean;
}

export interface TimeRange {
  start_hour: number;
  end_hour: number;
  timezone: string;
}

export interface UserBehaviorPattern {
  reading_speed: 'slow' | 'normal' | 'fast';
  interaction_style: 'touch' | 'mouse' | 'keyboard' | 'voice';
  attention_span: 'short' | 'medium' | 'long';
  content_preference: 'visual' | 'text' | 'mixed';
}

export interface GeographicLocation {
  country: string;
  region?: string;
  timezone: string;
  language_preference: string;
}

export interface BrandGuidelines {
  brand_name: string;
  logo_files: string[];
  primary_colors: string[];
  secondary_colors: string[];
  typography: BrandTypography;
  imagery_style: ImageryStyle;
  tone_of_voice: ToneOfVoice;
  layout_preferences: LayoutPreferences;
}

export interface BrandTypography {
  primary_font: string;
  secondary_font?: string;
  font_weights: number[];
  font_sizes: string[];
  line_heights: number[];
}

export interface ImageryStyle {
  style: 'photography' | 'illustration' | 'mixed' | 'minimal' | 'artistic';
  color_treatment: 'full_color' | 'duotone' | 'grayscale' | 'high_contrast';
  composition: 'centered' | 'rule_of_thirds' | 'dynamic' | 'minimal';
}

export interface ToneOfVoice {
  formality: 'formal' | 'casual' | 'friendly' | 'professional';
  energy: 'calm' | 'energetic' | 'dynamic' | 'passionate';
  personality: 'trustworthy' | 'innovative' | 'playful' | 'sophisticated';
}

export interface LayoutPreferences {
  complexity: 'minimal' | 'moderate' | 'rich' | 'detailed';
  whitespace: 'tight' | 'balanced' | 'generous' | 'spacious';
  hierarchy: 'subtle' | 'clear' | 'strong' | 'dramatic';
  symmetry: 'symmetric' | 'asymmetric' | 'balanced' | 'dynamic';
}

// Default Theme Configuration
export const DEFAULT_THEME_CONFIG: Partial<ThemeConfiguration> = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49'
    },
    secondary: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712'
    },
    accent: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a'
    },
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b'
    },
    semantic: {
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        950: '#052e16'
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03'
      },
      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        950: '#450a0a'
      },
      info: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554'
      },
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        overlay: 'rgba(0, 0, 0, 0.5)'
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#64748b',
        inverse: '#ffffff',
        link: '#2563eb',
        link_hover: '#1d4ed8'
      },
      border: {
        light: '#e2e8f0',
        medium: '#cbd5e1',
        heavy: '#94a3b8',
        focus: '#3b82f6'
      }
    },
    gradients: []
  }
};

export const DEFAULT_RESPONSIVE_BREAKPOINTS: ResponsiveBreakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};
