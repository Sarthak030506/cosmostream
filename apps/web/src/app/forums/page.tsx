'use client';

import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';

const GET_THREADS = gql`
  query GetThreads($category: String, $limit: Int, $offset: Int) {
    threads(category: $category, limit: $limit, offset: $offset) {
      id
      title
      category
      tags
      postCount
      createdAt
      updatedAt
      creator {
        id
        name
      }
    }
  }
`;

const categories = [
  'All',
  'General Discussion',
  'Equipment & Gear',
  'Astrophotography',
  'Space News',
  'Help & Support',
  'Off-Topic',
];

export default function ForumsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const { data, loading, error } = useQuery(GET_THREADS, {
    variables: {
      category: selectedCategory === 'All' ? null : selectedCategory,
      limit: 50,
      offset: 0,
    },
  });

  const threads = data?.threads || [];

  // Filter and sort threads
  const filteredThreads = threads
    .filter((thread: any) =>
      searchQuery === '' ||
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a: any, b: any) => {
      if (sortBy === 'recent') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortBy === 'popular') {
        return b.postCount - a.postCount;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Community Forums</h1>
            <p className="text-gray-400">Discuss astronomy, share knowledge, and connect with fellow space enthusiasts</p>
          </div>
          <Link
            href="/forums/new"
            className="bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Thread
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search threads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition pl-12"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategory === category
                    ? 'bg-cosmos-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Threads List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 animate-pulse">
                <div className="bg-gray-800 h-6 rounded w-3/4 mb-3"></div>
                <div className="bg-gray-800 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Threads</h3>
            <p className="text-gray-400">{error.message}</p>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-white mb-2">No Threads Found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Be the first to start a discussion!'}
            </p>
            <Link
              href="/forums/new"
              className="inline-block bg-cosmos-600 hover:bg-cosmos-500 text-white px-6 py-3 rounded-lg transition"
            >
              Create New Thread
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredThreads.map((thread: any) => (
              <Link
                key={thread.id}
                href={`/forums/${thread.id}`}
                className="block bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-cosmos-500 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cosmos-500/10"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cosmos-500 to-nebula-500 flex items-center justify-center text-white text-xl flex-shrink-0">
                    💬
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-2 hover:text-cosmos-400 transition">
                      {thread.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {thread.creator.name}
                      </span>

                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        {thread.postCount} replies
                      </span>

                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(thread.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Tags and Category */}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-cosmos-500/20 text-cosmos-300 text-xs rounded-full">
                        {thread.category}
                      </span>
                      {thread.tags.map((tag: string) => (
                        <span key={tag} className="px-3 py-1 bg-gray-800 text-gray-400 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-cosmos-400 mb-1">{threads.length}</div>
            <div className="text-gray-400 text-sm">Total Threads</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-nebula-400 mb-1">
              {threads.reduce((sum: number, t: any) => sum + t.postCount, 0)}
            </div>
            <div className="text-gray-400 text-sm">Total Posts</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {new Set(threads.map((t: any) => t.creator.id)).size}
            </div>
            <div className="text-gray-400 text-sm">Active Members</div>
          </div>
        </div>
      </div>
    </div>
  );
}
