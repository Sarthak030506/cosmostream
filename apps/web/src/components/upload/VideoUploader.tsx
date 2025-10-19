'use client';

import { useState, useRef, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { REQUEST_UPLOAD_URL, COMPLETE_VIDEO_UPLOAD } from '@/graphql/video';

interface VideoUploaderProps {
  onUploadComplete?: (videoId: string) => void;
  onUploadError?: (error: string) => void;
  initialMetadata?: {
    title: string;
    description?: string;
    tags?: string[];
    category?: string;
    difficulty?: string;
  };
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  'video/webm',
  'video/x-matroska', // .mkv
];

export function VideoUploader({ onUploadComplete, onUploadError, initialMetadata }: VideoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  const [requestUploadUrl] = useMutation(REQUEST_UPLOAD_URL);
  const [completeVideoUpload] = useMutation(COMPLETE_VIDEO_UPLOAD);

  // File validation
  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 10GB limit (${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB)`;
    }

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return `Invalid file type. Allowed: MP4, MOV, AVI, WebM, MKV`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      if (onUploadError) onUploadError(error);
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    setUploadProgress(0);
  }, [onUploadError]);

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Upload to S3 with progress tracking (or mock for development)
  const uploadToS3 = async (file: File, uploadUrl: string): Promise<void> => {
    // Check if this is a mock URL (development mode without AWS)
    const isMockUrl = uploadUrl.includes('/api/mock-upload/');

    if (isMockUrl) {
      // Simulate upload progress for development
      return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(Math.min(progress, 100));

          if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => resolve(), 500);
          }
        }, 200);
      });
    }

    // Real S3 upload
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  // Start upload process
  const handleUpload = async () => {
    if (!selectedFile || !initialMetadata) {
      setUploadError('Missing file or metadata');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Step 1: Request presigned upload URL from API
      const { data } = await requestUploadUrl({
        variables: {
          title: initialMetadata.title,
          description: initialMetadata.description,
          tags: initialMetadata.tags,
          category: initialMetadata.category,
          difficulty: initialMetadata.difficulty,
        },
      });

      const { uploadUrl, videoId: newVideoId } = data.requestUploadUrl;
      setVideoId(newVideoId);

      // Step 2: Upload file to S3
      await uploadToS3(selectedFile, uploadUrl);

      // Step 3: Notify API that upload is complete
      await completeVideoUpload({
        variables: {
          videoId: newVideoId,
          fileSize: selectedFile.size,
        },
      });

      // Success
      setUploadProgress(100);
      if (onUploadComplete) {
        onUploadComplete(newVideoId);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Upload failed. Please try again.';
      setUploadError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Clear selected file
  const handleClear = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadError(null);
    setVideoId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      {!selectedFile && (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-cosmos-400 bg-cosmos-500/10'
              : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cosmos-500 to-nebula-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            <div>
              <p className="text-lg font-semibold text-white mb-1">
                {isDragging ? 'Drop video file here' : 'Click to browse or drag & drop'}
              </p>
              <p className="text-sm text-gray-400">
                MP4, MOV, AVI, WebM, MKV up to 10GB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected File Display */}
      {selectedFile && !isUploading && uploadProgress === 0 && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cosmos-500 to-nebula-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <div>
                <p className="font-semibold text-white">{selectedFile.name}</p>
                <p className="text-sm text-gray-400 mt-1">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>

            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={handleUpload}
            className="w-full mt-6 bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Start Upload
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-white">{selectedFile?.name}</p>
              <p className="text-sm text-gray-400 mt-1">Uploading to server...</p>
            </div>
            <span className="text-lg font-bold text-cosmos-400">{uploadProgress}%</span>
          </div>

          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cosmos-500 to-nebula-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>

          {/* Animated dots */}
          <div className="flex items-center gap-2 mt-4 text-gray-400 text-sm">
            <div className="flex gap-1">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>•</span>
              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>•</span>
              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>•</span>
            </div>
            <span>Please don't close this window</span>
          </div>
        </div>
      )}

      {/* Upload Complete */}
      {uploadProgress === 100 && !isUploading && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div className="flex-1">
              <p className="font-semibold text-green-400 mb-1">Upload Complete!</p>
              <p className="text-sm text-gray-300">
                Your video has been uploaded successfully and is now being processed. You'll be notified when it's ready.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <div className="flex-1">
              <p className="font-semibold text-red-400 mb-1">Upload Failed</p>
              <p className="text-sm text-gray-300">{uploadError}</p>
              <button
                onClick={handleClear}
                className="mt-3 text-sm text-red-400 hover:text-red-300 underline transition"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
