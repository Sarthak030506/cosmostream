'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { useState } from 'react';

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
      likes
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

const TRACK_VIDEO_VIEW = gql`
  mutation TrackVideoView($input: VideoViewInput!) {
    trackVideoView(input: $input)
  }
`;

export default function VideoPage() {
  const params = useParams();
  const videoId = params.id as string;

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const { data, loading, error } = useQuery(GET_VIDEO, {
    variables: { id: videoId },
    fetchPolicy: 'network-only', // Always fetch fresh data from server
    onCompleted: (data) => {
      if (data?.video) {
        setLikeCount(data.video.likes || 0);
      }
    },
  });

  const [trackView] = useMutation(TRACK_VIDEO_VIEW);

  // Debug: Log video data when it changes
  if (data?.video) {
    console.log('📹 Video data received:', {
      id: data.video.id,
      title: data.video.title,
      status: data.video.status,
      hasManifestUrl: !!data.video.manifestUrl,
      manifestUrl: data.video.manifestUrl,
    });
  }

  // Track view count when video plays
  const handleVideoPlay = () => {
    // Generate a simple session ID
    const sessionId = typeof window !== 'undefined'
      ? (sessionStorage.getItem('sessionId') || (() => {
          const id = Math.random().toString(36).substring(2, 15);
          sessionStorage.setItem('sessionId', id);
          return id;
        })())
      : 'unknown';

    trackView({
      variables: {
        input: {
          videoId,
          sessionId,
          deviceType: 'desktop',
          browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        }
      }
    }).catch(err => {
      console.warn('Failed to track video view:', err);
    });
  };

  // Handle like button
  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    // TODO: Call GraphQL mutation when backend is ready
  };

  // Handle bookmark button
  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    // TODO: Call GraphQL mutation when backend is ready
  };

  // Handle share
  const handleShare = (platform?: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = data?.video?.title || 'Check out this video';
    const text = `${title} on CosmoStream`;

    if (platform === 'whatsapp') {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
      window.open(whatsappUrl, '_blank');
      setShowShareMenu(false);
    } else if (platform === 'twitter') {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank');
      setShowShareMenu(false);
    } else if (platform === 'facebook') {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      window.open(facebookUrl, '_blank');
      setShowShareMenu(false);
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
        setShowShareMenu(false);
      });
    } else {
      // Toggle share menu
      setShowShareMenu(!showShareMenu);
    }
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
              {video.status === 'READY' && video.manifestUrl ? (
                <div className="aspect-video relative">
                  <video
                    className="w-full h-full"
                    controls
                    poster={video.thumbnailUrl || '/placeholder-video.jpg'}
                    onPlay={handleVideoPlay}
                    preload="metadata"
                  >
                    <source src={video.manifestUrl} type="video/mp4" />
                    <p className="text-white p-4">
                      Your browser doesn't support video playback.
                    </p>
                  </video>
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-900">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🎬</div>
                    <p className="text-gray-400 mb-2">
                      {video.status === 'PROCESSING' ? 'Video is processing...' : 'Video unavailable'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {video.status} | Has URL: {video.manifestUrl ? 'Yes' : 'No'}
                    </p>
                    {video.manifestUrl && (
                      <p className="text-xs text-gray-600 mt-2 break-all max-w-md">
                        {video.manifestUrl}
                      </p>
                    )}
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
                    <span>{likeCount.toLocaleString()} likes</span>
                    <span>•</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {/* Like Button */}
                  <button
                    onClick={handleLike}
                    className={`p-2 rounded-lg transition-all ${
                      liked
                        ? 'bg-cosmos-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                    title="Like"
                  >
                    <svg className="w-6 h-6" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </button>

                  {/* Bookmark Button */}
                  <button
                    onClick={handleBookmark}
                    className={`p-2 rounded-lg transition-all ${
                      bookmarked
                        ? 'bg-nebula-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                    title="Save"
                  >
                    <svg className="w-6 h-6" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>

                  {/* Share Button with Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => handleShare()}
                      className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
                      title="Share"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>

                    {/* Share Menu Dropdown */}
                    {showShareMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-700 transition flex items-center gap-3"
                        >
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-700 transition flex items-center gap-3"
                        >
                          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                          Twitter
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-700 transition flex items-center gap-3"
                        >
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </button>
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-700 transition flex items-center gap-3 border-t border-gray-700"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Link
                        </button>
                      </div>
                    )}
                  </div>
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
