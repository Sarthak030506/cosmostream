'use client';

import { useState } from 'react';
import { ContentCard } from '@/components/content/ContentCard';

interface BookmarkItem {
  id: string;
  title: string;
  description?: string;
  contentType: string;
  difficultyLevel: string;
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
  upvotes: number;
  viewCount: number;
  bookmarkCount: number;
  createdAt: string;
  bookmarkedAt?: string;
  bookmarkNote?: string;
}

interface BookmarksGridProps {
  bookmarks: BookmarkItem[];
  loading?: boolean;
}

export function BookmarksGrid({ bookmarks, loading }: BookmarksGridProps) {
  const [filter, setFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('RECENT');

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmos-500"></div>
      </div>
    );
  }

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
        <div className="text-6xl mb-4">🔖</div>
        <h3 className="text-xl font-bold text-white mb-2">No Bookmarks Yet</h3>
        <p className="text-gray-400 mb-6">
          Save content for later by clicking the bookmark button on any article!
        </p>
      </div>
    );
  }

  // Filter bookmarks
  let filteredBookmarks = [...bookmarks];
  if (filter !== 'ALL') {
    filteredBookmarks = filteredBookmarks.filter(
      (bookmark) => bookmark.contentType === filter
    );
  }

  // Sort bookmarks
  switch (sortBy) {
    case 'RECENT':
      filteredBookmarks.sort(
        (a, b) =>
          new Date(b.bookmarkedAt || b.createdAt).getTime() -
          new Date(a.bookmarkedAt || a.createdAt).getTime()
      );
      break;
    case 'OLDEST':
      filteredBookmarks.sort(
        (a, b) =>
          new Date(a.bookmarkedAt || a.createdAt).getTime() -
          new Date(b.bookmarkedAt || b.createdAt).getTime()
      );
      break;
    case 'POPULAR':
      filteredBookmarks.sort((a, b) => b.viewCount - a.viewCount);
      break;
    case 'UPVOTES':
      filteredBookmarks.sort((a, b) => b.upvotes - a.upvotes);
      break;
  }

  const contentTypes = ['ALL', 'ARTICLE', 'TUTORIAL', 'GUIDE', 'VIDEO', 'NEWS'];

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-400 mb-2">Filter by Type</label>
          <div className="flex flex-wrap gap-2">
            {contentTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  filter === type
                    ? 'bg-cosmos-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-700 focus:border-cosmos-500 focus:outline-none"
          >
            <option value="RECENT">Recently Bookmarked</option>
            <option value="OLDEST">Oldest First</option>
            <option value="POPULAR">Most Popular</option>
            <option value="UPVOTES">Most Upvoted</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-400 mb-4">
        {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''}
        {filter !== 'ALL' && ` in ${filter}`}
      </p>

      {/* Grid */}
      {filteredBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredBookmarks.map((bookmark) => (
            <div key={bookmark.id}>
              <ContentCard
                content={{
                  ...bookmark,
                  ageGroup: 'ALL',
                  tags: [],
                  mediaUrls: null,
                  engagementScore: 0,
                  shareCount: 0,
                  downvotes: 0,
                  userVote: null,
                  isBookmarked: true,
                  updatedAt: bookmark.createdAt,
                }}
              />
              {bookmark.bookmarkNote && (
                <div className="mt-2 p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400">
                    <span className="font-medium text-gray-300">Note: </span>
                    {bookmark.bookmarkNote}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">No Results</h3>
          <p className="text-gray-400">No bookmarks found with the selected filters.</p>
        </div>
      )}
    </div>
  );
}
