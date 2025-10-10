'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';

const GET_VIDEO = gql`
  query GetVideo($id: ID!) {
    video(id: $id) {
      id
      title
      description
      manifestUrl
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
        profile {
          avatar
        }
      }
    }
  }
`;

const INCREMENT_VIEW = gql`
  mutation IncrementView($videoId: ID!) {
    incrementVideoView(videoId: $videoId) {
      success
    }
  }
`;

export default function VideoPage() {
  const params = useParams();
  const videoId = params.id as string;

  const { data, loading, error } = useQuery(GET_VIDEO, {
    variables: { id: videoId },
  });

  const [incrementView] = useMutation(INCREMENT_VIEW, {
    variables: { videoId },
  });

  // Increment view count when video loads
  const handleVideoPlay = () => {
    incrementView();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmos-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading video...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.video) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-6xl mb-4">🌌</div>
            <h2 className="text-2xl font-bold text-white mb-2">Video Not Found</h2>
            <p className="text-gray-400 mb-6">This video doesn't exist or has been removed.</p>
            <Link
              href="/browse"
              className="inline-block bg-cosmos-600 hover:bg-cosmos-500 text-white px-6 py-3 rounded-lg transition"
            >
              Browse Videos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const video = data.video;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Column */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-black rounded-xl overflow-hidden shadow-2xl mb-6">
              {video.status === 'ready' && video.manifestUrl ? (
                <div className="aspect-video relative">
                  <video
                    className="w-full h-full"
                    controls
                    poster={video.thumbnailUrl || '/placeholder-video.jpg'}
                    onPlay={handleVideoPlay}
                  >
                    <source src={video.manifestUrl} type="application/x-mpegURL" />
                    <p className="text-white p-4">
                      Your browser doesn't support HLS video playback.
                    </p>
                  </video>
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎬</div>
                    <p className="text-gray-400">
                      {video.status === 'processing' ? 'Video is processing...' : 'Video unavailable'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {video.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{video.views.toLocaleString()} views</span>
                    <span>•</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </button>
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Creator Info */}
              <div className="flex items-center gap-4 py-4 border-t border-gray-800">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cosmos-500 to-nebula-500 flex items-center justify-center text-white font-bold">
                  {video.creator.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <Link href={`/profile/${video.creator.id}`} className="font-semibold text-white hover:text-cosmos-400 transition">
                    {video.creator.name}
                  </Link>
                  <p className="text-sm text-gray-400">Creator</p>
                </div>
                <button className="bg-cosmos-600 hover:bg-cosmos-500 text-white px-6 py-2 rounded-lg font-semibold transition">
                  Follow
                </button>
              </div>

              {/* Description */}
              {video.description && (
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-gray-300 whitespace-pre-line">{video.description}</p>
                </div>
              )}

              {/* Tags & Category */}
              <div className="pt-4 border-t border-gray-800 mt-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {video.category && (
                    <span className="px-3 py-1 bg-cosmos-500/20 text-cosmos-300 text-sm rounded-full">
                      {video.category}
                    </span>
                  )}
                  {video.difficulty && (
                    <span className="px-3 py-1 bg-nebula-500/20 text-nebula-300 text-sm rounded-full">
                      {video.difficulty}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {video.tags?.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/browse?tag=${tag}`}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-full transition"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Comments Section (Placeholder) */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mt-6">
              <h3 className="text-xl font-bold text-white mb-4">Comments</h3>
              <div className="text-center text-gray-500 py-8">
                <p>Comments feature coming soon!</p>
              </div>
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Related Videos</h3>
              <div className="space-y-4">
                <div className="text-center text-gray-500 py-8">
                  <p>More videos coming soon!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
