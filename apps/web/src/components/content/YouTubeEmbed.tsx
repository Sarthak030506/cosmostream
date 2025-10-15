'use client';

import React, { useState } from 'react';
import { ExternalLink, ThumbsUp, Bookmark, Share2, Eye } from 'lucide-react';

interface YouTubeMetadata {
  youtube_id: string;
  thumbnail: string;
  embed_url: string;
  watch_url: string;
  channel_id: string;
  channel_name: string;
  published_at: string;
  duration_seconds: number;
}

interface YouTubeEmbedProps {
  mediaUrls: YouTubeMetadata;
  title: string;
  description?: string;
  viewCount?: number;
  upvotes?: number;
  isBookmarked?: boolean;
  onUpvote?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  className?: string;
}

export function YouTubeEmbed({
  mediaUrls,
  title,
  description,
  viewCount = 0,
  upvotes = 0,
  isBookmarked = false,
  onUpvote,
  onBookmark,
  onShare,
  className = '',
}: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className={`youtube-embed-container ${className}`}>
      {/* Video Player */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        {!isPlaying ? (
          // Thumbnail with play button
          <div
            className="absolute inset-0 cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            <img
              src={mediaUrls.thumbnail}
              alt={title}
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
              <div className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors">
                <svg
                  className="w-10 h-10 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            {/* Duration badge */}
            {mediaUrls.duration_seconds > 0 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                {formatDuration(mediaUrls.duration_seconds)}
              </div>
            )}
            {/* Source badge */}
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </div>
          </div>
        ) : (
          // Embedded YouTube iframe
          <iframe
            className="absolute inset-0 w-full h-full rounded-lg"
            src={`${mediaUrls.embed_url}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      {/* Attribution Bar */}
      <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span>Original upload by:</span>
          <a
            href={`https://www.youtube.com/channel/${mediaUrls.channel_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 font-medium"
          >
            {mediaUrls.channel_name}
          </a>
          <span className="text-gray-400">•</span>
          <span>{formatDate(mediaUrls.published_at)}</span>
        </div>
        <a
          href={mediaUrls.watch_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Watch on YouTube</span>
        </a>
      </div>

      {/* CosmoStream Interaction Buttons */}
      <div className="mt-4 flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* View count */}
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <Eye className="w-4 h-4" />
          <span>{viewCount.toLocaleString()} views</span>
        </div>

        {/* Upvote button */}
        {onUpvote && (
          <button
            onClick={onUpvote}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{upvotes}</span>
          </button>
        )}

        {/* Bookmark button */}
        {onBookmark && (
          <button
            onClick={onBookmark}
            className={`flex items-center gap-1 text-sm transition-colors ${
              isBookmarked
                ? 'text-yellow-600 dark:text-yellow-500'
                : 'text-gray-600 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>
        )}

        {/* Share button */}
        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        )}
      </div>

      {/* Description (if provided) */}
      {description && (
        <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
          {description}
        </div>
      )}

      {/* Copyright notice */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
        This video is embedded from YouTube and remains the property of its original creator.
        All rights reserved by the content owner.
      </div>
    </div>
  );
}

export default YouTubeEmbed;
