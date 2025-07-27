export interface Category {
  id: string;
  name: string;
  name_ar?: string; // Keep optional for backward compatibility
  name_en?: string; // This field exists in the DB
  description?: string;
  slug: string;
  color?: string;
  color_hex?: string; // Keep for backward compatibility
  icon?: string;
  parent_id?: string;
  position?: number;
  order_index?: number;
  display_order?: number; // This field exists in the DB
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  children?: Category[];
  articles_count?: number;
  article_count?: number;
  meta_title?: string;
  meta_description?: string;
  og_image_url?: string;
  canonical_url?: string;
  noindex?: boolean;
  og_type?: string;
  can_delete?: boolean;
  cover_image?: string;
}

export interface CategoryFormData {
  name_ar: string;
  name_en: string;
  description: string;
  slug: string;
  color_hex: string;
  icon: string;
  parent_id: string | undefined;
  position: number;
  is_active: boolean;
  meta_title: string;
  meta_description: string;
  og_image_url: string;
  canonical_url: string;
  noindex: boolean;
  og_type: string;
  cover_image: string;
} 