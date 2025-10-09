'use client';

import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';

const GET_VIDEOS = gql`
  query GetVideos($limit: Int, $offset: Int) {
    videos(limit: $limit, offset: $offset) {
      id
      title
      description
      thumbnailUrl
      duration
      views
      status
      tags
      category
      difficulty
      createdAt
      creator {
        id
        name
      }
    }
  }
`;

const categories = [
  'All',
  'Astronomy',
  'Astrophysics',
  'Cosmology',
  'Space Exploration',
  'Planetary Science',
  'Solar System',
  'Galaxies',
  'Black Holes',
];

const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function BrowsePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading, error, fetchMore } = useQuery(GET_VIDEOS, {
    variables: { limit: 12, offset: 0 },
  });

  const videos = data?.videos || [];

  // Filter videos based on selected filters
  const filteredVideos = videos.filter((video: any) => {
    const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || video.difficulty === selectedDifficulty;
    const matchesSearch =
      searchQuery === '' ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Browse Videos</h1>
          <p className="text-gray-400">Explore our collection of space and astronomy content</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search videos..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
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

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedDifficulty === difficulty
                      ? 'bg-nebula-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-400">
          {loading ? (
            <p>Loading videos...</p>
          ) : (
            <p>
              Showing {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}
            </p>
          )}
        </div>

        {/* Video Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Videos</h3>
            <p className="text-gray-400">{error.message}</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No Videos Found</h3>
            <p className="text-gray-400">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video: any) => (
              <Link
                key={video.id}
                href={`/video/${video.id}`}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-cosmos-500 transition-all duration-300 hover:shadow-lg hover:shadow-cosmos-500/20"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-800 overflow-hidden">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-5xl">🎬</div>
                    </div>
                  )}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                    </div>
                  )}
                  {video.status === 'processing' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded font-semibold">
                        Processing
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-cosmos-400 transition">
                    {video.title}
                  </h3>

                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <span>{video.creator.name}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{video.views.toLocaleString()} views</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Tags */}
                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {video.tags.slice(0, 2).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Category & Difficulty Badges */}
                  <div className="flex gap-2 mt-3">
                    {video.category && (
                      <span className="px-2 py-1 bg-cosmos-500/20 text-cosmos-300 text-xs rounded">
                        {video.category}
                      </span>
                    )}
                    {video.difficulty && (
                      <span className="px-2 py-1 bg-nebula-500/20 text-nebula-300 text-xs rounded">
                        {video.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && filteredVideos.length > 0 && filteredVideos.length >= 12 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => {
                fetchMore({
                  variables: {
                    offset: videos.length,
                  },
                });
              }}
              className="bg-cosmos-600 hover:bg-cosmos-500 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Load More Videos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
