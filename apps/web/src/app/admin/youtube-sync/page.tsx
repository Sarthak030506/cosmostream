'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';

const GET_ME = gql`
  query GetMe {
    me {
      id
      role
    }
  }
`;

const GET_YOUTUBE_STATS = gql`
  query GetYouTubeStats {
    youtubeSyncStatus {
      categoryName
      videoCount
      lastSyncAt
      syncEnabled
    }
    youtubeQuotaUsage {
      used
      limit
      remaining
      date
    }
  }
`;

const GET_CATEGORIES_WITH_MAPPINGS = gql`
  query GetCategoriesWithMappings {
    categories(limit: 200) {
      id
      name
      slug
      contentCount
    }
  }
`;

const SYNC_YOUTUBE_CATEGORY = gql`
  mutation SyncYouTubeCategory($categoryId: ID!, $limit: Int) {
    syncYouTubeCategory(categoryId: $categoryId, limit: $limit) {
      jobId
      categoryId
      categoryName
      videosFetched
      videosImported
      videosSkipped
      videosFailed
      quotaCost
      durationSeconds
    }
  }
`;

const GET_RECENT_SYNC_JOBS = gql`
  query GetRecentSyncJobs($limit: Int) {
    youtubeSyncJobs(limit: $limit) {
      id
      jobId
      jobType
      categoryId
      categoryName
      status
      result
      createdAt
      startedAt
      completedAt
    }
  }
`;

export default function YouTubeSyncAdminPage() {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [syncLimit, setSyncLimit] = useState(50);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{total: number, completed: number, imported: number}>({
    total: 0,
    completed: 0,
    imported: 0,
  });
  const [showProgress, setShowProgress] = useState(false);

  // Auth check
  const { data: meData, loading: meLoading } = useQuery(GET_ME);

  useEffect(() => {
    if (!meLoading && (!meData?.me || (meData.me.role?.toLowerCase() !== 'admin'))) {
      router.push('/');
    }
  }, [meData, meLoading, router]);

  // Data queries
  const { data: statsData, loading: statsLoading, error: statsError, refetch: refetchStats } = useQuery(GET_YOUTUBE_STATS, {
    errorPolicy: 'all', // Continue even if quota check fails
  });
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES_WITH_MAPPINGS);
  const { data: jobsData, refetch: refetchJobs } = useQuery(GET_RECENT_SYNC_JOBS, {
    variables: { limit: 10 },
    errorPolicy: 'all',
  });

  const [syncCategory] = useMutation(SYNC_YOUTUBE_CATEGORY);

  // Select/deselect all
  const toggleSelectAll = () => {
    if (selectedCategories.size === categoriesData?.categories.length) {
      setSelectedCategories(new Set());
    } else {
      const allIds = new Set<string>(categoriesData?.categories.map((c: any) => c.id as string) || []);
      setSelectedCategories(allIds);
    }
  };

  // Toggle individual category
  const toggleCategory = (categoryId: string) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId);
    } else {
      newSet.add(categoryId);
    }
    setSelectedCategories(newSet);
  };

  // Sync selected categories
  const syncSelected = async () => {
    if (selectedCategories.size === 0) {
      alert('Please select at least one category');
      return;
    }

    const confirmed = confirm(
      `Sync ${selectedCategories.size} categories with ${syncLimit} videos each?\n\n` +
      `This will import up to ${selectedCategories.size * syncLimit} videos.\n` +
      `YouTube API quota cost: ~${selectedCategories.size * 100} units`
    );

    if (!confirmed) return;

    setIsSyncing(true);
    setShowProgress(true);
    setSyncProgress({ total: selectedCategories.size, completed: 0, imported: 0 });

    const categoryIds = Array.from(selectedCategories);
    let completed = 0;
    let totalImported = 0;

    for (const categoryId of categoryIds) {
      try {
        const result = await syncCategory({
          variables: { categoryId, limit: syncLimit },
        });

        totalImported += result.data?.syncYouTubeCategory?.videosImported || 0;
        completed++;
        setSyncProgress({ total: categoryIds.length, completed, imported: totalImported });

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to sync category ${categoryId}:`, error);
        completed++;
        setSyncProgress({ total: categoryIds.length, completed, imported: totalImported });
      }
    }

    setIsSyncing(false);
    alert(`Sync complete!\n\nCategories processed: ${completed}\nVideos imported: ${totalImported}`);

    // Refresh data
    refetchStats();
    refetchJobs();
    setSelectedCategories(new Set());
  };

  // Sync single category
  const syncSingle = async (categoryId: string, categoryName: string) => {
    const confirmed = confirm(`Sync "${categoryName}" with up to ${syncLimit} videos?`);
    if (!confirmed) return;

    setIsSyncing(true);
    try {
      const result = await syncCategory({
        variables: { categoryId, limit: syncLimit },
      });

      const imported = result.data?.syncYouTubeCategory?.videosImported || 0;
      alert(`Sync complete!\n\nVideos imported: ${imported}`);

      refetchStats();
      refetchJobs();
    } catch (error: any) {
      alert(`Sync failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (meLoading || !meData?.me) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmos-500"></div>
      </div>
    );
  }

  const stats = statsData?.youtubeSyncStatus;
  const quota = statsData?.youtubeQuotaUsage;
  const categories = categoriesData?.categories || [];
  const jobs = jobsData?.youtubeSyncJobs || [];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">YouTube Video Sync</h1>
          <p className="text-gray-400">
            Import thousands of high-quality astronomy videos from YouTube
          </p>
        </div>

        {/* Quota Exceeded Warning */}
        {statsError && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-400 mb-2">
                  YouTube API Quota Exceeded
                </h3>
                <p className="text-gray-300 mb-3">
                  You've reached today's YouTube API quota limit. The quota resets at midnight Pacific Time.
                </p>
                <div className="text-sm text-gray-400">
                  <strong>What you can do:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Wait until tomorrow to sync more videos</li>
                    <li>Create a new YouTube API key at Google Cloud Console</li>
                    <li>View the {stats?.videoCount || 0} videos already imported</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cosmos-900/30 to-cosmos-900/10 border border-cosmos-500/30 rounded-xl p-6">
            <div className="text-4xl mb-2">📹</div>
            <div className="text-3xl font-bold text-white mb-1">
              {statsLoading ? '...' : stats?.videoCount || 0}
            </div>
            <div className="text-cosmos-300">Total Videos Imported</div>
          </div>

          <div className="bg-gradient-to-br from-nebula-900/30 to-nebula-900/10 border border-nebula-500/30 rounded-xl p-6">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-bold text-white mb-1">
              {categoriesLoading ? '...' : categories.length}
            </div>
            <div className="text-nebula-300">Categories with Mappings</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 border border-purple-500/30 rounded-xl p-6">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-3xl font-bold text-white mb-1">
              {statsError ? (
                <span className="text-red-400 text-lg">Quota Exceeded</span>
              ) : quota ? (
                `${quota.remaining}/${quota.limit}`
              ) : (
                '...'
              )}
            </div>
            <div className="text-purple-300">
              {statsError ? 'Resets at Midnight PT' : 'YouTube API Quota'}
            </div>
          </div>
        </div>

        {/* Sync Progress */}
        {showProgress && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Sync Progress</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Categories: {syncProgress.completed} / {syncProgress.total}</span>
                <span>Videos Imported: {syncProgress.imported}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-4">
                <div
                  className="bg-cosmos-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(syncProgress.completed / syncProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
            {isSyncing && (
              <div className="flex items-center gap-2 text-cosmos-400">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-cosmos-500"></div>
                <span className="text-sm">Syncing... Please wait</span>
              </div>
            )}
          </div>
        )}

        {/* Bulk Sync Controls */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Bulk Sync Controls</h3>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Videos per Category</label>
              <input
                type="number"
                value={syncLimit}
                onChange={(e) => setSyncLimit(parseInt(e.target.value) || 50)}
                min={5}
                max={200}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 w-32"
              />
            </div>

            <div className="flex-1"></div>

            <button
              onClick={toggleSelectAll}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
              disabled={isSyncing}
            >
              {selectedCategories.size === categories.length ? 'Deselect All' : 'Select All'}
            </button>

            <button
              onClick={syncSelected}
              disabled={isSyncing || selectedCategories.size === 0 || !!statsError}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                isSyncing || selectedCategories.size === 0 || statsError
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-cosmos-600 hover:bg-cosmos-500 text-white'
              }`}
              title={statsError ? 'Quota exceeded - try again tomorrow' : ''}
            >
              {isSyncing ? 'Syncing...' : statsError ? 'Quota Exceeded' : `Sync ${selectedCategories.size} Selected`}
            </button>
          </div>

          {selectedCategories.size > 0 && (
            <div className="text-sm text-gray-400">
              Estimated import: up to {selectedCategories.size * syncLimit} videos •
              API quota cost: ~{selectedCategories.size * 100} units
            </div>
          )}
        </div>

        {/* Categories List */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            Categories ({categories.length})
          </h3>

          {categoriesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cosmos-500 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {categories.map((category: any) => (
                <div
                  key={category.id}
                  className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    disabled={isSyncing}
                    className="w-4 h-4"
                  />

                  <div className="flex-1">
                    <div className="text-white font-medium">{category.name}</div>
                    <div className="text-xs text-gray-500">
                      {category.contentCount} existing items • {category.slug}
                    </div>
                  </div>

                  <button
                    onClick={() => syncSingle(category.id, category.name)}
                    disabled={isSyncing || !!statsError}
                    className="px-3 py-1 text-sm bg-cosmos-600/20 hover:bg-cosmos-600/30 text-cosmos-400 rounded transition disabled:opacity-50"
                    title={statsError ? 'Quota exceeded' : ''}
                  >
                    {statsError ? 'Quota Exceeded' : 'Sync Now'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sync Jobs */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Sync Jobs</h3>

          <div className="space-y-2">
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No sync jobs yet</div>
            ) : (
              jobs.map((job: any) => (
                <div
                  key={job.id}
                  className="p-4 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-white font-medium">{job.categoryName}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(job.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        job.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : job.status === 'failed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  {job.result && (
                    <div className="text-sm text-gray-400 grid grid-cols-4 gap-2">
                      <div>
                        <span className="text-gray-500">Fetched:</span> {job.result.videosFetched}
                      </div>
                      <div>
                        <span className="text-gray-500">Imported:</span> {job.result.videosImported}
                      </div>
                      <div>
                        <span className="text-gray-500">Skipped:</span> {job.result.videosSkipped}
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span> {job.result.durationSeconds}s
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
