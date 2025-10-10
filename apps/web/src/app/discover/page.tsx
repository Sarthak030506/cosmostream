'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Navigation } from '@/components/layout/Navigation';
import { ContentCard } from '@/components/content/ContentCard';
import { GET_CATEGORIES, DISCOVER_CONTENT, GET_RECOMMENDED_CONTENT } from '@/graphql/content';

const DIFFICULTY_LEVELS = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
const CONTENT_TYPES = ['ALL', 'ARTICLE', 'TUTORIAL', 'GUIDE', 'VIDEO', 'NEWS'];
const SORT_OPTIONS = [
  { value: 'TRENDING', label: 'Trending' },
  { value: 'RECENT', label: 'Recent' },
  { value: 'POPULAR', label: 'Popular' },
  { value: 'ENGAGEMENT', label: 'Most Engaging' },
];

export default function DiscoverPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortBy, setSortBy] = useState('TRENDING');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch categories for filter
  const { data: categoriesData } = useQuery(GET_CATEGORIES, {
    variables: { parentId: null, limit: 20 },
  });

  // Fetch recommended content
  const { data: recommendedData } = useQuery(GET_RECOMMENDED_CONTENT, {
    variables: { limit: 3 },
  });

  // Fetch content with filters
  const { data, loading, error, fetchMore } = useQuery(DISCOVER_CONTENT, {
    variables: {
      filters: {
        categoryId: selectedCategory,
        difficultyLevel: selectedDifficulty === 'ALL' ? null : selectedDifficulty,
        contentType: selectedType === 'ALL' ? null : selectedType,
      },
      sortBy,
      limit: 12,
      offset: 0,
    },
  });

  const categories = categoriesData?.categories || [];
  const recommendedContent = recommendedData?.recommendedForMe || [];
  const contentFeed = data?.discoverContent;
  const content = contentFeed?.items || [];

  const handleLoadMore = () => {
    if (contentFeed?.hasMore) {
      fetchMore({
        variables: {
          offset: content.length,
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Discover Content</h1>
          <p className="text-gray-400">
            Explore astronomy knowledge tailored to your level
          </p>
        </div>

        {/* Recommended Section */}
        {recommendedContent.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedContent.map((item: any) => (
                <ContentCard key={item.id} content={item} />
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search astronomy content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
            />
            <svg
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmos-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.iconEmoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty
              </label>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTY_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      selectedDifficulty === level
                        ? 'bg-cosmos-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {level === 'ALL' ? 'All' : level.charAt(0) + level.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      selectedType === type
                        ? 'bg-nebula-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {type === 'ALL' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmos-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-gray-400">Active filters:</span>
            {selectedCategory && (
              <span className="px-2 py-1 bg-cosmos-500/20 text-cosmos-300 rounded-full">
                Category
              </span>
            )}
            {selectedDifficulty !== 'ALL' && (
              <span className="px-2 py-1 bg-cosmos-500/20 text-cosmos-300 rounded-full">
                {selectedDifficulty}
              </span>
            )}
            {selectedType !== 'ALL' && (
              <span className="px-2 py-1 bg-nebula-500/20 text-nebula-300 rounded-full">
                {selectedType}
              </span>
            )}
            {(selectedCategory || selectedDifficulty !== 'ALL' || selectedType !== 'ALL') && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedDifficulty('ALL');
                  setSelectedType('ALL');
                }}
                className="text-gray-400 hover:text-white transition"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-400">
          {loading ? (
            <p>Loading content...</p>
          ) : (
            <p>
              Showing {content.length} of {contentFeed?.totalCount || 0} results
            </p>
          )}
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800 aspect-video rounded-xl mb-3"></div>
                <div className="bg-gray-800 h-4 rounded mb-2"></div>
                <div className="bg-gray-800 h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Content</h3>
            <p className="text-gray-400">{error.message}</p>
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No Content Found</h3>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.map((item: any) => (
                <ContentCard key={item.id} content={item} />
              ))}
            </div>

            {/* Load More */}
            {contentFeed?.hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-cosmos-600 hover:bg-cosmos-500 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More Content'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
