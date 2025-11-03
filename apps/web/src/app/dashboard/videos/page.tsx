'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { GET_MY_VIDEOS, DELETE_VIDEO, UPDATE_VIDEO } from '@/graphql/video';
import Link from 'next/link';

const GET_ME = gql`
  query GetMe {
    me {
      id
      role
    }
  }
`;

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All Videos' },
  { value: 'READY', label: 'Published' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'UPLOADING', label: 'Uploading' },
  { value: 'FAILED', label: 'Failed' },
];

export default function VideoDashboardPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', tags: '' });

  const { data: userData, loading: userLoading } = useQuery(GET_ME);
  const { data, loading, error, refetch } = useQuery(GET_MY_VIDEOS, {
    variables: { status: statusFilter, limit: 50, offset: 0 },
    skip: !userData?.me,
  });

  const [deleteVideo] = useMutation(DELETE_VIDEO, {
    onCompleted: () => {
      refetch();
    },
  });

  const [updateVideo] = useMutation(UPDATE_VIDEO, {
    onCompleted: () => {
      setEditingVideo(null);
      refetch();
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleDelete = async (videoId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await deleteVideo({ variables: { id: videoId } });
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete video');
      }
    }
  };

  const handleEdit = (video: any) => {
    setEditingVideo(video.id);
    setEditForm({
      title: video.title,
      description: video.description || '',
      tags: video.tags.join(', '),
    });
  };

  const handleSaveEdit = async (videoId: string) => {
    try {
      await updateVideo({
        variables: {
          id: videoId,
          title: editForm.title,
          description: editForm.description,
          tags: editForm.tags.split(',').map((t) => t.trim()).filter((t) => t),
        },
      });
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update video');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string, progress?: number) => {
    switch (status) {
      case 'READY':
        return (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
            Published
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold flex items-center gap-2">
            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing {progress ? `${progress}%` : ''}
          </span>
        );
      case 'UPLOADING':
        return (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
            Uploading
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmos-500"></div>
        </div>
      </div>
    );
  }

  if (!userData?.me) {
    return null;
  }

  const videos = data?.myVideos?.items || [];
  const filteredVideos = videos.filter((video: any) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white mb-2">My Videos</h1>
            <p className="text-sm sm:text-base text-gray-400">Manage your uploaded videos and track their status. Start sharing your content!</p>
          </div>

          <Link
            href="/upload"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition duration-200 min-h-touch"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-sm sm:text-base">Upload Video</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-cosmos-500 min-h-touch"
              >
                {STATUS_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Search Videos</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cosmos-500 min-h-touch"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 mb-6 sm:mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Videos</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{data?.myVideos?.totalCount || 0}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cosmos-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cosmos-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Published</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-400">
                  {videos.filter((v: any) => v.status === 'READY').length}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Processing</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-400">
                  {videos.filter((v: any) => v.status === 'PROCESSING').length}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="animate-spin w-5 h-5 sm:w-6 sm:h-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Failed</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-400">
                  {videos.filter((v: any) => v.status === 'FAILED').length}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Videos List */}
        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
            <p className="text-red-400">Error loading videos. Please try again.</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-white mb-2">No Videos Found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? 'No videos match your search'
                : statusFilter !== 'ALL'
                ? `No ${statusFilter.toLowerCase()} videos`
                : 'Start by uploading your first video'}
            </p>
            {statusFilter === 'ALL' && !searchQuery && (
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 bg-cosmos-600 hover:bg-cosmos-500 text-white px-6 py-3 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Upload Your First Video
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVideos.map((video: any) => (
              <div
                key={video.id}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition"
              >
                {editingVideo === video.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
                    />
                    <input
                      type="text"
                      value={editForm.tags}
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                      placeholder="Tags (comma-separated)"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(video.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingVideo(null)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col xs:flex-row items-start gap-3 xs:gap-4 sm:gap-6">
                    {/* Thumbnail */}
                    <div className="w-full xs:w-32 sm:w-40 md:w-48 h-auto aspect-video bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-white mb-1 break-words">{video.title}</h3>
                          {video.description && (
                            <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">{video.description}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0">{getStatusBadge(video.status, video.processingProgress)}</div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 xs:gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-3">
                        <span>Uploaded: {formatDate(video.createdAt)}</span>
                        {video.fileSize && <span>Size: {formatFileSize(video.fileSize)}</span>}
                        {video.views > 0 && <span>{video.views.toLocaleString()} views</span>}
                        {video.likes > 0 && <span>{video.likes.toLocaleString()} likes</span>}
                      </div>

                      {video.errorMessage && (
                        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-sm text-red-400">Error: {video.errorMessage}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {video.status === 'READY' && (
                          <>
                            <Link
                              href={`/video/${video.id}`}
                              className="px-3 xs:px-4 py-2 min-h-touch bg-cosmos-600 hover:bg-cosmos-500 text-white text-xs xs:text-sm rounded-lg transition inline-flex items-center justify-center"
                            >
                              View
                            </Link>
                            <Link
                              href={`/dashboard/videos/${video.id}/analytics`}
                              className="px-3 xs:px-4 py-2 min-h-touch bg-blue-600 hover:bg-blue-500 text-white text-xs xs:text-sm rounded-lg transition inline-flex items-center gap-1.5 xs:gap-2"
                            >
                              <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              <span className="hidden xs:inline">Analytics</span>
                              <span className="xs:hidden">Stats</span>
                            </Link>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(video)}
                          className="px-3 xs:px-4 py-2 min-h-touch bg-gray-800 hover:bg-gray-700 text-white text-xs xs:text-sm rounded-lg transition inline-flex items-center justify-center"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(video.id, video.title)}
                          className="px-3 xs:px-4 py-2 min-h-touch bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs xs:text-sm rounded-lg transition inline-flex items-center justify-center"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
