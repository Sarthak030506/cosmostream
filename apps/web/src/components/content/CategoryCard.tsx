'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { FOLLOW_CATEGORY, UNFOLLOW_CATEGORY } from '@/graphql/content';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description?: string;
    slug: string;
    iconEmoji?: string;
    contentCount: number;
    followerCount: number;
    isFollowing?: boolean;
    difficultyLevel: string;
    ageGroup: string;
  };
  onUpdate?: () => void;
}

export function CategoryCard({ category, onUpdate }: CategoryCardProps) {
  const [isFollowing, setIsFollowing] = useState(category.isFollowing || false);
  const [followerCount, setFollowerCount] = useState(category.followerCount);

  const [followCategory] = useMutation(FOLLOW_CATEGORY);
  const [unfollowCategory] = useMutation(UNFOLLOW_CATEGORY);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isFollowing) {
        await unfollowCategory({ variables: { categoryId: category.id } });
        setIsFollowing(false);
        setFollowerCount(followerCount - 1);
      } else {
        await followCategory({ variables: { categoryId: category.id } });
        setIsFollowing(true);
        setFollowerCount(followerCount + 1);
      }
      onUpdate?.();
    } catch (error) {
      console.error('Error following category:', error);
    }
  };

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group block bg-gradient-to-br from-gray-900/80 to-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cosmos-500 transition-all duration-300 hover:shadow-lg hover:shadow-cosmos-500/20"
    >
      {/* Icon & Follow Button */}
      <div className="flex items-start justify-between mb-4">
        <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
          {category.iconEmoji || '📚'}
        </div>
        <button
          onClick={handleFollow}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
            isFollowing
              ? 'bg-cosmos-600 text-white hover:bg-cosmos-500'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {isFollowing ? '✓ Following' : '+ Follow'}
        </button>
      </div>

      {/* Name */}
      <h3 className="font-bold text-white text-xl mb-2 group-hover:text-cosmos-400 transition">
        {category.name}
      </h3>

      {/* Description */}
      {category.description && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{category.description}</p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>{category.contentCount} items</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span>{followerCount} followers</span>
        </div>
      </div>
    </Link>
  );
}
