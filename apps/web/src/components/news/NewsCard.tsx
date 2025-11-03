"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NewsCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  thumbnail?: string;
  category?: {
    name: string;
    iconEmoji?: string;
  };
  sourceUrl?: string;
  viewCount?: number;
  isBookmarked?: boolean;
  onBookmark?: (id: string, isBookmarked: boolean) => void;
  showRightBorder?: boolean;
}

export function NewsCard({
  id,
  title,
  description,
  date,
  thumbnail,
  category,
  sourceUrl,
  viewCount,
  isBookmarked = false,
  onBookmark,
  showRightBorder = true,
}: NewsCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/news/${id}`}
      className={cn(
        "group block relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-0 after:h-px after:w-screen after:bg-border after:content-['']",
        showRightBorder && "md:border-r border-border border-b-0"
      )}
    >
      <div className="flex flex-col h-full bg-gray-950/50 backdrop-blur-sm hover:bg-gray-900/50 transition-colors">
        {/* Thumbnail */}
        {thumbnail && !imageError ? (
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          </div>
        ) : thumbnail ? (
          <div className="relative w-full h-48 bg-gradient-to-br from-cosmos-900/20 to-nebula-900/20 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <svg
                className="w-12 h-12 mx-auto mb-2 opacity-40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-xs opacity-60">Image unavailable</p>
            </div>
          </div>
        ) : null}

        <div className="p-6 flex flex-col gap-2 flex-1">
          {/* Category Badge */}
          {category && (
            <div className="mb-1">
              <span className="px-3 py-1 bg-gray-800/80 text-gray-300 text-xs font-semibold rounded-full">
                {category.iconEmoji && `${category.iconEmoji} `}
                {category.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-semibold text-white group-hover:text-cosmos-400 transition line-clamp-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-sm line-clamp-3 flex-1">
            {description}
          </p>

          {/* Date and Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <time className="block font-medium">{date}</time>
            {viewCount !== undefined && (
              <span>{viewCount.toLocaleString()} views</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 px-4 py-2 bg-cosmos-600 hover:bg-cosmos-500 text-white text-sm font-semibold rounded-lg transition text-center">
              Read Full Article
            </div>
            {onBookmark && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBookmark(id, isBookmarked);
                }}
                className="p-2 hover:bg-gray-800/80 rounded-lg transition"
                title={isBookmarked ? "Remove bookmark" : "Bookmark"}
              >
                {isBookmarked ? "🔖" : "📑"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
