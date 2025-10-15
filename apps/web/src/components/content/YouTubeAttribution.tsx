'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

interface YouTubeAttributionProps {
  channelName: string;
  channelId: string;
  publishedAt: string;
  videoId: string;
  className?: string;
  compact?: boolean;
}

export function YouTubeAttribution({
  channelName,
  channelId,
  publishedAt,
  videoId,
  className = '',
  compact = false,
}: YouTubeAttributionProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span>YT</span>
        </div>
        <a
          href={`https://www.youtube.com/channel/${channelId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 truncate"
        >
          {channelName}
        </a>
        <span className="text-gray-400">•</span>
        <span className="text-gray-500 dark:text-gray-500">{formatDate(publishedAt)}</span>
      </div>
    );
  }

  return (
    <div className={`youtube-attribution ${className}`}>
      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* YouTube Logo */}
        <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>

        {/* Attribution Content */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Content from YouTube
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Creator:</span>
            <a
              href={`https://www.youtube.com/channel/${channelId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 font-medium truncate"
            >
              {channelName}
            </a>
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Uploaded {formatDate(publishedAt)}
          </div>
        </div>

        {/* External link */}
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="Watch on YouTube"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>

      {/* Compliance notice */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-600">
        This content is embedded from YouTube. All rights reserved by the original creator.
      </div>
    </div>
  );
}

export default YouTubeAttribution;
