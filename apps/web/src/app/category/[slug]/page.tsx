'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Breadcrumb } from '@/components/content/Breadcrumb';
import { CategoryStats } from '@/components/content/CategoryStats';
import { DifficultyChart } from '@/components/content/DifficultyChart';
import { ContentCard } from '@/components/content/ContentCard';
import { CategoryCard } from '@/components/content/CategoryCard';
import {
  GET_CATEGORY,
  DISCOVER_CONTENT,
  FOLLOW_CATEGORY,
  UNFOLLOW_CATEGORY,
} from '@/graphql/content';

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [isFollowing, setIsFollowing] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('ENGAGEMENT');

  const { data: categoryData, loading: categoryLoading } = useQuery(GET_CATEGORY, {
    variables: { slug },
  });

  const { data: contentData, loading: contentLoading } = useQuery(DISCOVER_CONTENT, {
    variables: {
      filters: {
        categorySlug: slug,
        difficultyLevel: difficultyFilter !== 'ALL' ? difficultyFilter : null,
      },
      sortBy,
      limit: 20,
    },
  });

  const [followCategory] = useMutation(FOLLOW_CATEGORY);
  const [unfollowCategory] = useMutation(UNFOLLOW_CATEGORY);

  const category = categoryData?.category;

  // Initialize following state
  useEffect(() => {
    if (category) {
      setIsFollowing(category.isFollowing || false);
    }
  }, [category]);

  const handleFollow = async () => {
    if (!category) return;

    try {
      if (isFollowing) {
        await unfollowCategory({ variables: { categoryId: category.id } });
        setIsFollowing(false);
      } else {
        await followCategory({ variables: { categoryId: category.id } });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error following/unfollowing category:', error);
    }
  };

  // Calculate difficulty distribution from category content
  const getDifficultyDistribution = () => {
    if (!contentData?.discoverContent?.items) return [];

    const distribution: Record<string, number> = {
      BEGINNER: 0,
      INTERMEDIATE: 0,
      ADVANCED: 0,
      EXPERT: 0,
    };

    contentData.discoverContent.items.forEach((item: any) => {
      if (distribution[item.difficultyLevel] !== undefined) {
        distribution[item.difficultyLevel]++;
      }
    });

    return Object.entries(distribution)
      .filter(([_, count]) => count > 0)
      .map(([difficulty, count]) => ({ difficulty, count }));
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmos-500"></div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h1 className="text-3xl font-bold text-white mb-4">Category Not Found</h1>
          <p className="text-gray-400 mb-6">The category you're looking for doesn't exist.</p>
          <Link
            href="/categories"
            className="bg-cosmos-600 hover:bg-cosmos-500 text-white px-6 py-3 rounded-lg transition inline-block"
          >
            Browse Categories
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Discover', href: '/discover' },
    { label: 'Categories', href: '/categories' },
  ];

  if (category.parentCategory) {
    breadcrumbItems.push({
      label: category.parentCategory.name,
      href: `/category/${category.parentCategory.slug}`,
      emoji: '📁',
    });
  }

  breadcrumbItems.push({
    label: category.name,
    href: `/category/${slug}`,
    emoji: category.iconEmoji,
  });

  const difficultyDistribution = getDifficultyDistribution();

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      {/* Hero Section */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900/50 to-gray-950">
        <div className="container mx-auto px-4 py-12">
          <Breadcrumb items={breadcrumbItems} />

          {/* Category Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div className="flex items-start gap-4">
              {/* Icon */}
              {category.iconEmoji && (
                <div className="text-6xl flex-shrink-0">{category.iconEmoji}</div>
              )}

              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-xl text-gray-400 max-w-3xl">{category.description}</p>
                )}
              </div>
            </div>

            {/* Follow Button - Prominent */}
            <button
              onClick={handleFollow}
              className={`flex-shrink-0 px-8 py-3 rounded-lg font-bold text-lg transition ${
                isFollowing
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-cosmos-600 text-white hover:bg-cosmos-500'
              }`}
            >
              {isFollowing ? '✓ Following' : '+ Follow Category'}
            </button>
          </div>

          {/* Category Stats */}
          <CategoryStats
            followerCount={category.followerCount}
            contentCount={category.contentCount}
            isFollowing={isFollowing}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Content List Column */}
          <div className="lg:col-span-8">
            {/* Subcategories */}
            {category.subCategories && category.subCategories.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Subcategories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.subCategories.map((subCategory: any) => (
                    <CategoryCard
                      key={subCategory.id}
                      category={{
                        id: subCategory.id,
                        name: subCategory.name,
                        slug: subCategory.slug,
                        iconEmoji: subCategory.iconEmoji,
                        contentCount: subCategory.contentCount,
                        description: '',
                        difficultyLevel: 'ALL',
                        ageGroup: 'ALL',
                        followerCount: 0,
                        isFollowing: false,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white">
                Content ({contentData?.discoverContent?.totalCount || 0})
              </h2>

              <div className="flex flex-wrap gap-3">
                {/* Difficulty Filter */}
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-700 focus:border-cosmos-500 focus:outline-none"
                >
                  <option value="ALL">All Levels</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-700 focus:border-cosmos-500 focus:outline-none"
                >
                  <option value="ENGAGEMENT">Most Engaging</option>
                  <option value="RECENT">Most Recent</option>
                  <option value="POPULAR">Most Popular</option>
                  <option value="TRENDING">Trending</option>
                </select>
              </div>
            </div>

            {/* Content Grid */}
            {contentLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmos-500"></div>
              </div>
            ) : contentData?.discoverContent?.items.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {contentData.discoverContent.items.map((item: any) => (
                  <ContentCard key={item.id} content={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-white mb-2">No Content Yet</h3>
                <p className="text-gray-400">
                  No content available in this category with the selected filters.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Difficulty Distribution Chart */}
            {difficultyDistribution.length > 0 && (
              <DifficultyChart data={difficultyDistribution} />
            )}

            {/* Category Info */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wide">
                Category Details
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Difficulty Level</p>
                  <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                    {category.difficultyLevel}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Age Group</p>
                  <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                    {category.ageGroup}
                  </span>
                </div>

                {category.tags && category.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Related Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {category.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {category.isFeatured && (
                  <div className="pt-3 border-t border-gray-800">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Featured Category
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Parent Category Link */}
            {category.parentCategory && (
              <Link
                href={`/category/${category.parentCategory.slug}`}
                className="block bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition"
              >
                <p className="text-sm text-gray-500 mb-2">Parent Category</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📁</span>
                  <span className="text-white font-medium hover:text-cosmos-400 transition">
                    {category.parentCategory.name}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-500 ml-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
