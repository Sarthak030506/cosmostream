export enum VideoStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  status: VideoStatus;
  thumbnailUrl?: string;
  manifestUrl?: string;
  duration?: number;
  tags: string[];
  category?: string;
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoMetadata {
  width: number;
  height: number;
  bitrate: number;
  codec: string;
  fps: number;
}

export interface VideoRendition {
  quality: string;
  url: string;
  width: number;
  height: number;
  bitrate: number;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  videoId: string;
}
