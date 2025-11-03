'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { GET_LATEST_NEWS, GET_FEATURED_NEWS, GET_NEWS_BY_CATEGORY, SEARCH_NEWS } from '@/graphql/news';
import { BOOKMARK_CONTENT, REMOVE_BOOKMARK } from '@/graphql/content';
import { NewsCard } from '@/components/news/NewsCard';
import { CategoryFilter } from '@/components/news/CategoryFilter';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import Image from 'next/image';
import Link from 'next/link';

const NEWS_CATEGORIES = [
  { value: 'all', label: 'All News', slug: null },
  { value: 'breaking-news', label: 'Breaking News', slug: 'breaking-news' },
  { value: 'discoveries', label: 'Discoveries', slug: 'discoveries' },
  { value: 'mission-updates', label: 'Mission Updates', slug: 'mission-updates' },
  { value: 'research-papers', label: 'Research & Papers', slug: 'research-papers' },
  { value: 'astronomical-events', label: 'Astronomical Events', slug: 'astronomical-events' },
  { value: 'telescopes-observatories', label: 'Telescopes', slug: 'telescopes-observatories' },
];

export default function NewsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch featured news
  const { data: featuredData } = useQuery(GET_FEATURED_NEWS);

  // Fetch news based on filters
  const categorySlug = NEWS_CATEGORIES.find((c) => c.value === selectedCategory)?.slug;
  const { data, loading, error, fetchMore } = useQuery(
    debouncedSearch
      ? SEARCH_NEWS
      : categorySlug
      ? GET_NEWS_BY_CATEGORY
      : GET_LATEST_NEWS,
    {
      variables: debouncedSearch
        ? { query: debouncedSearch, limit: 20, offset: 0 }
        : categorySlug
        ? { categorySlug, limit: 20, offset: 0 }
        : { limit: 20, offset: 0 },
    }
  );

  const [bookmarkContent] = useMutation(BOOKMARK_CONTENT);
  const [removeBookmark] = useMutation(REMOVE_BOOKMARK);

  const featured = featuredData?.featuredNews;
  const newsKey = debouncedSearch ? 'searchNews' : categorySlug ? 'newsByCategory' : 'latestNews';
  const newsFeed = data?.[newsKey];
  const news = newsFeed?.items || [];

  const handleBookmark = async (itemId: string, isBookmarked: boolean) => {
    try {
      if (isBookmarked) {
        await removeBookmark({ variables: { contentItemId: itemId } });
      } else {
        await bookmarkContent({ variables: { contentItemId: itemId } });
      }
      // Refetch to update bookmark status
      window.location.reload();
    } catch (error) {
      console.error('Bookmark error:', error);
    }
  };

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !newsFeed?.hasMore) return;

    setIsLoadingMore(true);
    try {
      await fetchMore({
        variables: {
          offset: news.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          const prevData = prev[newsKey];
          const newData = fetchMoreResult[newsKey];

          return {
            [newsKey]: {
              ...newData,
              items: [...prevData.items, ...newData.items],
            },
          };
        },
      });
    } catch (error) {
      console.error('Error loading more news:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchMore, news.length, newsKey, newsFeed?.hasMore, isLoadingMore]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && newsFeed?.hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMore, newsFeed?.hasMore, isLoadingMore]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmos-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 relative">
      <Navigation />

      {/* Background Effect */}
      <div className="absolute top-0 left-0 z-0 w-full h-[200px] [mask-image:linear-gradient(to_top,transparent_25%,black_95%)]">
        <FlickeringGrid
          className="absolute top-0 left-0 size-full"
          squareSize={4}
          gridGap={6}
          color="#6366f1"
          maxOpacity={0.2}
          flickerChance={0.05}
        />
      </div>

      {/* Header Section */}
      <div className="p-6 border-b border-gray-800 flex flex-col gap-6 min-h-[250px] justify-center relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col gap-2">
            <h1 className="font-medium text-4xl md:text-5xl tracking-tighter text-white">
              Space News
            </h1>
            <p className="text-gray-400 text-sm md:text-base lg:text-lg">
              Latest breaking news, discoveries, and updates from the world of space and astronomy
            </p>
          </div>
        </div>

        {/* Search and Category Filter */}
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="w-full bg-gray-800 text-white px-4 py-3 pl-12 rounded-lg border border-gray-700 focus:border-cosmos-500 focus:outline-none"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
        </div>

        {/* Category Filter */}
        {!searchQuery && (
          <div className="max-w-7xl mx-auto w-full">
            <CategoryFilter
              categories={NEWS_CATEGORIES}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        )}
      </div>

      {/* Featured Story */}
      {featured && !searchQuery && selectedCategory === 'all' && (
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-0 py-8">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-cosmos-900/50 to-nebula-900/50 border border-gray-800 group hover:border-cosmos-500/50 transition">
              {featured.mediaUrls?.thumbnail ? (
                <div className="relative h-80 sm:h-96">
                  <Image
                    src={featured.mediaUrls.thumbnail}
                    alt={featured.title}
                    fill
                    className="object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
                </div>
              ) : (
                <div className="relative h-80 sm:h-96 bg-gradient-to-br from-cosmos-900/30 to-nebula-900/30 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="w-20 h-20 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Space News</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-cosmos-600 text-white text-xs font-semibold rounded-full">
                    FEATURED
                  </span>
                  {featured.category && (
                    <span className="px-3 py-1 bg-gray-800/80 text-gray-300 text-xs font-semibold rounded-full">
                      {featured.category.iconEmoji} {featured.category.name}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3">
                  {featured.title}
                </h2>
                <p className="text-gray-300 mb-4 line-clamp-2 text-sm sm:text-base">
                  {featured.description}
                </p>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/news/${featured.id}`}
                    className="px-6 py-2 bg-cosmos-600 hover:bg-cosmos-500 text-white font-semibold rounded-lg transition"
                  >
                    Read Full Story
                  </Link>
                  <button
                    onClick={() => handleBookmark(featured.id, featured.isBookmarked)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition"
                  >
                    {featured.isBookmarked ? '🔖' : '📑'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* News Grid */}
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-0">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative overflow-hidden border-x border-gray-800 ${
            news.length < 4 ? "border-b" : "border-b-0"
          }`}
        >
          {news.map((item: any, index: number) => {
            const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <NewsCard
                key={item.id}
                id={item.id}
                title={item.title}
                description={item.description}
                date={formattedDate}
                thumbnail={item.mediaUrls?.thumbnail}
                category={item.category}
                sourceUrl={item.sourceUrl}
                viewCount={item.viewCount}
                isBookmarked={item.isBookmarked}
                onBookmark={handleBookmark}
                showRightBorder={news.length < 3}
              />
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {news.length === 0 && !loading && (
        <div className="max-w-7xl mx-auto w-full px-6 text-center py-12">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-xl font-bold text-white mb-2">No news found</h3>
          <p className="text-gray-400">
            {searchQuery
              ? 'Try a different search term'
              : 'Check back later for the latest space news'}
          </p>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {newsFeed?.hasMore && (
        <div className="max-w-7xl mx-auto w-full px-6">
          <div ref={loadMoreRef} className="flex justify-center items-center py-8">
            {isLoadingMore && (
              <div className="flex items-center gap-3 text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cosmos-500"></div>
                <span>Loading more news...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* End of results indicator */}
      {!newsFeed?.hasMore && news.length > 0 && (
        <div className="max-w-7xl mx-auto w-full px-6">
          <div className="text-center py-8 text-gray-500">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">You've reached the end</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
