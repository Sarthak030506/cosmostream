'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Navigation } from '@/components/layout/Navigation';
import { CategoryCard } from '@/components/content/CategoryCard';
import { GET_CATEGORIES, GET_CATEGORY_STATS, GET_MY_FOLLOWED_CATEGORIES } from '@/graphql/content';

export default function CategoriesPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [showFollowed, setShowFollowed] = useState(false);

  // Fetch all main categories
  const { data, loading, error, refetch } = useQuery(GET_CATEGORIES, {
    variables: {
      parentId: null,
      difficultyLevel: selectedDifficulty,
      limit: 50,
    },
  });

  // Fetch followed categories
  const { data: followedData } = useQuery(GET_MY_FOLLOWED_CATEGORIES);

  // Fetch category stats
  const { data: statsData } = useQuery(GET_CATEGORY_STATS);

  const categories = showFollowed
    ? followedData?.myFollowedCategories || []
    : data?.categories || [];
  const stats = statsData?.categoryStats;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Browse Categories</h1>
          <p className="text-gray-400">
            Explore {stats?.totalCategories || 0} astronomy topics organized by expertise level
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-cosmos-900/30 to-cosmos-900/10 border border-cosmos-500/30 rounded-xl p-6">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalCategories}
              </div>
              <div className="text-cosmos-300">Total Categories</div>
            </div>

            <div className="bg-gradient-to-br from-nebula-900/30 to-nebula-900/10 border border-nebula-500/30 rounded-xl p-6">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.mostPopular?.length || 0}
              </div>
              <div className="text-nebula-300">Popular Topics</div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 border border-purple-500/30 rounded-xl p-6">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-3xl font-bold text-white mb-1">
                {followedData?.myFollowedCategories?.length || 0}
              </div>
              <div className="text-purple-300">Your Followed</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFollowed(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  !showFollowed
                    ? 'bg-cosmos-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => setShowFollowed(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  showFollowed
                    ? 'bg-cosmos-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Following ({followedData?.myFollowedCategories?.length || 0})
              </button>
            </div>

            <div className="flex-grow"></div>

            {/* Difficulty Filter */}
            {!showFollowed && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Filter by level:</span>
                {['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map((level) => (
                  <button
                    key={level}
                    onClick={() =>
                      setSelectedDifficulty(selectedDifficulty === level ? null : level)
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedDifficulty === level
                        ? 'bg-nebula-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {level.charAt(0) + level.slice(1).toLowerCase()}
                  </button>
                ))}
                {selectedDifficulty && (
                  <button
                    onClick={() => setSelectedDifficulty(null)}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800 h-48 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Categories</h3>
            <p className="text-gray-400">{error.message}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {showFollowed ? 'No Followed Categories' : 'No Categories Found'}
            </h3>
            <p className="text-gray-400">
              {showFollowed
                ? 'Start following categories to see them here'
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category: any) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onUpdate={() => refetch()}
                />
              ))}
            </div>

            {/* Difficulty Distribution */}
            {!showFollowed && stats?.byDifficulty && (
              <div className="mt-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Categories by Difficulty
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.byDifficulty.map((item: any) => (
                    <div key={item.difficulty} className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">{item.count}</div>
                      <div className="text-sm text-gray-400">
                        {item.difficulty.charAt(0) +
                          item.difficulty.slice(1).toLowerCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
