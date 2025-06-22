export type TemplateType = 'header' | 'footer' | 'sidebar' | 'banner';

export interface Template {
  id: number;
  name: string;
  description?: string;
  type: TemplateType;
  content: any;
  settings?: any;
  is_active: boolean;
  is_default: boolean;
  starts_at?: string;
  ends_at?: string;
  country_code?: string;
  category_id?: number;
  created_at: string;
  updated_at: string;
} 