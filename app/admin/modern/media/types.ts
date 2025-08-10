export interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  path: string;
  parentId: string | null;
  createdAt: string;
  _count: {
    assets: number;
    subfolders: number;
  };
  children?: MediaFolder[];
}

export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  cloudinaryUrl: string;
  thumbnailUrl?: string;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";
  folderId: string | null;
  folder?: MediaFolder;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
}
