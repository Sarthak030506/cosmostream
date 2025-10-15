'use client';

import { CategoryCard } from '@/components/content/CategoryCard';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconEmoji?: string;
  difficultyLevel: string;
  ageGroup: string;
  contentCount: number;
  followerCount: number;
  isFollowing: boolean;
}

interface FollowedCategoriesGridProps {
  categories: Category[];
  loading?: boolean;
}

export function FollowedCategoriesGrid({ categories, loading }: FollowedCategoriesGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmos-500"></div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-xl font-bold text-white mb-2">No Followed Categories</h3>
        <p className="text-gray-400 mb-6">
          Follow categories to get personalized content recommendations!
        </p>
        <Link
          href="/categories"
          className="inline-block bg-cosmos-600 hover:bg-cosmos-500 text-white px-6 py-3 rounded-lg transition"
        >
          Browse Categories
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-6">
        Following {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
