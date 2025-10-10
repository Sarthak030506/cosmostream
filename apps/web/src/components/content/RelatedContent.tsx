'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { DISCOVER_CONTENT } from '@/graphql/content';
import { DifficultyBadge } from './DifficultyBadge';

interface RelatedContentProps {
  categoryId: string;
  currentContentId: string;
  difficultyLevel: string;
}

export function RelatedContent({
  categoryId,
  currentContentId,
  difficultyLevel,
}: RelatedContentProps) {
  const { data, loading } = useQuery(DISCOVER_CONTENT, {
    variables: {
      filters: {
        categoryId,
        difficultyLevel: difficultyLevel !== 'ALL' ? difficultyLevel : null,
      },
      sortBy: 'ENGAGEMENT',
      limit: 5,
    },
  });

  const relatedItems = (data?.discoverContent?.items || []).filter(
    (item: any) => item.id !== currentContentId
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-800 h-20 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (relatedItems.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🔍</div>
        <p className="text-gray-500 text-sm">No related content found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white mb-4">Related Content</h3>

      {relatedItems.map((item: any) => (
        <Link
          key={item.id}
          href={`/content/${item.id}`}
          className="block bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-cosmos-500 transition-all duration-200 group"
        >
          {/* Category */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">{item.category.iconEmoji}</span>
            <span className="text-xs text-gray-500">{item.category.name}</span>
          </div>

          {/* Title */}
          <h4 className="font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-cosmos-400 transition">
            {item.title}
          </h4>

          {/* Meta */}
          <div className="flex items-center justify-between">
            <DifficultyBadge level={item.difficultyLevel} size="sm" />
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                {item.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
                {item.upvotes}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
