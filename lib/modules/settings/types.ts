/**
 * نظام الإعدادات المتقدم - أنواع البيانات
 * Advanced Settings System - Type Definitions
 */

export interface SystemSettings {
  id: string;
  section: string;
  key: string;
  value: any;
  data_type: string;
  description?: string;
  category: string;
  environment: string;
  is_public: boolean;
  is_encrypted: boolean;
  validation_rules?: ValidationRules;
  depends_on?: string[];
  priority: number;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface UserSettings {
  id: string;
  user_id: string;
  category: string;
  key: string;
  value: any;
  data_type: string;
  is_default: boolean;
  sync_across_devices: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ValidationRules {
  required?: boolean;
  min_length?: number;
  max_length?: number;
  pattern?: string;
  enum_values?: string[];
  numeric_range?: {
    min: number;
    max: number;
  };
  custom_validator?: string;
}

export interface SettingsCategory {
  id: string;
  name: string;
  name_ar: string;
  description?: string;
  icon?: string;
  order: number;
  permissions?: string[];
}

export interface SettingsUpdatePayload {
  key: string;
  value: any;
  category?: string;
  description?: string;
  validation_rules?: ValidationRules;
}

export interface SettingsFilterOptions {
  category?: string;
  section?: string;
  environment?: string;
  is_public?: boolean;
  tags?: string[];
  search?: string;
}

export interface SettingsExportOptions {
  categories?: string[];
  include_sensitive?: boolean;
  format?: 'json' | 'yaml' | 'env';
  minify?: boolean;
}

export interface SettingsBulkUpdate {
  settings: SettingsUpdatePayload[];
  merge_strategy?: 'overwrite' | 'merge' | 'preserve';
  backup_before_update?: boolean;
}

export interface SettingsBackup {
  id: string;
  name: string;
  description?: string;
  settings_count: number;
  categories: string[];
  created_by: string;
  created_at: Date;
  file_path: string;
  file_size: number;
}

export interface SettingsAuditLog {
  id: string;
  user_id: string;
  action: 'create' | 'update' | 'delete' | 'bulk_update' | 'restore';
  setting_key: string;
  old_value?: any;
  new_value?: any;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface SettingsCache {
  key: string;
  value: any;
  expires_at: Date;
  hit_count: number;
  last_accessed: Date;
}

export interface SettingsEnvironment {
  name: string;
  display_name: string;
  is_active: boolean;
  priority: number;
  inherits_from?: string;
}

// System Configuration Categories
export const SETTINGS_CATEGORIES = {
  GENERAL: 'general',
  APPEARANCE: 'appearance', 
  SECURITY: 'security',
  NOTIFICATIONS: 'notifications',
  AI_MODELS: 'ai_models',
  PERFORMANCE: 'performance',
  INTEGRATIONS: 'integrations',
  CONTENT: 'content',
  ANALYTICS: 'analytics',
  BACKUP: 'backup'
} as const;

export type SettingsCategoryType = typeof SETTINGS_CATEGORIES[keyof typeof SETTINGS_CATEGORIES];

// Data Types
export const SETTINGS_DATA_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  JSON: 'json',
  ARRAY: 'array',
  DATE: 'date',
  COLOR: 'color',
  URL: 'url',
  EMAIL: 'email',
  PASSWORD: 'password'
} as const;

export type SettingsDataType = typeof SETTINGS_DATA_TYPES[keyof typeof SETTINGS_DATA_TYPES];

// Environment Types
export const SETTINGS_ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TESTING: 'testing'
} as const;

export type SettingsEnvironmentType = typeof SETTINGS_ENVIRONMENTS[keyof typeof SETTINGS_ENVIRONMENTS];

// Priority Levels
export const SETTINGS_PRIORITY = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
  MINIMAL: 5
} as const;

export type SettingsPriorityType = typeof SETTINGS_PRIORITY[keyof typeof SETTINGS_PRIORITY];
