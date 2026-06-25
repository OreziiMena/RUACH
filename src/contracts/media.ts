export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

export interface GeneratePresignedUrlPramaters {
  fileType: typeof ALLOWED_TYPES[number];
  fileSize: number;
  folder: string;
}

export interface GeneratePresignedUrlResponse {
  presignedUrl: string;
  key: string;
  url: string;
}

export interface DeleteFromR2Parameters {
  key: string;
}