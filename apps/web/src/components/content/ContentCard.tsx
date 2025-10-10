'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { BOOKMARK_CONTENT, REMOVE_BOOKMARK, VOTE_CONTENT, REMOVE_VOTE } from '@/graphql/content';
import { DifficultyBadge } from './DifficultyBadge';

interface ContentCardProps {
  content: {
    id: string;
    title: string;
    description?: string;
    contentType: string;
    difficultyLevel: string;
    ageGroup: string;
    tags: string[];
    upvotes: number;
    downvotes: number;
    viewCount: number;
    userVote?: number | null;
    isBookmarked?: boolean;
    createdAt: string;
    category: {
      id: string;
      name: string;
      slug: string;
      iconEmoji?: string;
    };
    author: {
      id: string;
      name: string;
    };
  };
  onUpdate?: () => void;
}

export function ContentCard({ content, onUpdate }: ContentCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(content.isBookmarked || false);
  const [userVote, setUserVote] = useState(content.userVote || null);
  const [upvotes, setUpvotes] = useState(content.upvotes);
  const [downvotes, setDownvotes] = useState(content.downvotes);

  const [bookmarkContent] = useMutation(BOOKMARK_CONTENT);
  const [removeBookmark] = useMutation(REMOVE_BOOKMARK);
  const [voteContent] = useMutation(VOTE_CONTENT);
  const [removeVote] = useMutation(REMOVE_VOTE);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isBookmarked) {
        await removeBookmark({ variables: { contentItemId: content.id } });
        setIsBookmarked(false);
      } else {
        await bookmarkContent({ variables: { contentItemId: content.id } });
        setIsBookmarked(true);
      }
      onUpdate?.();
    } catch (error) {
      console.error('Error bookmarking:', error);
    }
  };

  const handleVote = async (value: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (userVote === value) {
        // Remove vote
        await removeVote({ variables: { contentItemId: content.id } });
        if (value === 1) {
          setUpvotes(upvotes - 1);
        } else {
          setDownvotes(downvotes - 1);
        }
        setUserVote(null);
      } else {
        // Add or change vote
        await voteContent({ variables: { contentItemId: content.id, value } });

        if (userVote === 1) {
          setUpvotes(upvotes - 1);
        } else if (userVote === -1) {
          setDownvotes(downvotes - 1);
        }

        if (value === 1) {
          setUpvotes(upvotes + 1);
        } else {
          setDownvotes(downvotes + 1);
        }

        setUserVote(value);
      }
      onUpdate?.();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'article':
        return '📄';
      case 'tutorial':
        return '🎓';
      case 'guide':
        return '📖';
      case 'video':
        return '🎬';
      case 'news':
        return '📰';
      default:
        return '📝';
    }
  };

  return (
    <Link
      href={`/content/${content.id}`}
      className="group block bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-cosmos-500 transition-all duration-300 hover:shadow-lg hover:shadow-cosmos-500/20"
    >
      {/* Category Header */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-800/30 px-4 py-2 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-2xl">{content.category.iconEmoji || '📚'}</span>
            <span className="text-gray-300">{content.category.name}</span>
          </div>
          <span className="text-2xl">{getContentTypeIcon(content.contentType)}</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5">
        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-cosmos-400 transition">
          {content.title}
        </h3>

        {content.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-3">{content.description}</p>
        )}

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {content.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {content.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full">
                +{content.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Difficulty Badge */}
        <div className="mb-4">
          <DifficultyBadge level={content.difficultyLevel} size="sm" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          {/* Author & Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="text-gray-400">{content.author.name}</span>
            <span>{content.viewCount.toLocaleString()} views</span>
          </div>

          {/* Social Actions */}
          <div className="flex items-center gap-3" onClick={(e) => e.preventDefault()}>
            {/* Upvote */}
            <button
              onClick={(e) => handleVote(1, e)}
              className={`flex items-center gap-1 text-sm transition ${
                userVote === 1
                  ? 'text-green-400'
                  : 'text-gray-500 hover:text-green-400'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={userVote === 1 ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              <span>{upvotes}</span>
            </button>

            {/* Downvote */}
            <button
              onClick={(e) => handleVote(-1, e)}
              className={`flex items-center gap-1 text-sm transition ${
                userVote === -1
                  ? 'text-red-400'
                  : 'text-gray-500 hover:text-red-400'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={userVote === -1 ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              <span>{downvotes}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              className={`text-sm transition ${
                isBookmarked
                  ? 'text-yellow-400'
                  : 'text-gray-500 hover:text-yellow-400'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={isBookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
