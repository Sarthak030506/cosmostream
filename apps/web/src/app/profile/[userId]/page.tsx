'use client';

import { useQuery, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      name
      role
      createdAt
      profile {
        avatar
        bio
        location
        website
      }
      creatorProfile {
        verified
        credentials
        subscriberCount
        totalViews
      }
    }
  }
`;

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.userId as string;

  const { data, loading, error } = useQuery(GET_USER, {
    variables: { id: userId },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmos-500"></div>
        </div>
      </div>
    );
  }

  if (error || !data?.user) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
            <p className="text-gray-400 mb-6">This user doesn't exist.</p>
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

  const user = data.user;
  const isCreator = user.role === 'CREATOR' || user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cosmos-500 to-nebula-500 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                  <div className="flex gap-2 mb-3">
                    <span className="px-3 py-1 bg-cosmos-500/20 text-cosmos-300 text-sm rounded-full capitalize">
                      {user.role.toLowerCase()}
                    </span>
                    {user.creatorProfile?.verified && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified Creator
                      </span>
                    )}
                  </div>
                </div>
                <button className="bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-200">
                  Follow
                </button>
              </div>

              {user.profile?.bio && (
                <p className="text-gray-300 mb-4">{user.profile.bio}</p>
              )}

              {user.creatorProfile?.credentials && (
                <p className="text-gray-400 text-sm mb-4">
                  <span className="font-semibold">Credentials:</span> {user.creatorProfile.credentials}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-400">
                {user.profile?.location && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {user.profile.location}
                  </span>
                )}
                {user.profile?.website && (
                  <a
                    href={user.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-cosmos-400 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Website
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Creator Stats */}
          {isCreator && user.creatorProfile && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-800">
              <div className="text-center">
                <div className="text-2xl font-bold text-cosmos-400 mb-1">
                  {user.creatorProfile.subscriberCount}
                </div>
                <div className="text-gray-400 text-sm">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-nebula-400 mb-1">
                  {user.creatorProfile.totalViews.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">0</div>
                <div className="text-gray-400 text-sm">Videos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400 mb-1">0</div>
                <div className="text-gray-400 text-sm">Courses</div>
              </div>
            </div>
          )}
        </div>

        {/* Content Tabs */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex gap-4 border-b border-gray-800 mb-6">
            <button className="pb-3 px-4 border-b-2 border-cosmos-500 text-cosmos-400 font-semibold">
              About
            </button>
            {isCreator && (
              <>
                <button className="pb-3 px-4 text-gray-400 hover:text-white transition">
                  Videos
                </button>
                <button className="pb-3 px-4 text-gray-400 hover:text-white transition">
                  Courses
                </button>
              </>
            )}
            <button className="pb-3 px-4 text-gray-400 hover:text-white transition">
              Activity
            </button>
          </div>

          {/* About Content */}
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Profile Information</h3>
            <p className="text-gray-400">
              {user.profile?.bio ? (
                <span className="block max-w-2xl mx-auto">{user.profile.bio}</span>
              ) : (
                <span>This user hasn't added a bio yet.</span>
              )}
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="text-center py-8 text-gray-500">
            No recent activity to display
          </div>
        </div>
      </div>
    </div>
  );
}
