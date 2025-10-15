'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { ActivityTimeline } from '@/components/profile/ActivityTimeline';
import { BookmarksGrid } from '@/components/profile/BookmarksGrid';
import { FollowedCategoriesGrid } from '@/components/profile/FollowedCategoriesGrid';
import {
  GET_MY_ASTRONOMY_PROFILE,
  GET_MY_BOOKMARKED_CONTENT,
  GET_MY_FOLLOWED_CATEGORIES,
} from '@/graphql/content';
import { gql } from '@apollo/client';

const GET_ME = gql`
  query GetMe {
    me {
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
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String, $bio: String, $avatar: String) {
    updateProfile(name: $name, bio: $bio, avatar: $avatar) {
      id
      name
      profile {
        bio
        avatar
      }
    }
  }
`;

type TabType = 'overview' | 'activity' | 'bookmarks' | 'categories' | 'content';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: '',
  });

  const { data: userData, loading: userLoading, error: userError, refetch } = useQuery(GET_ME);
  const { data: profileData, loading: profileLoading } = useQuery(GET_MY_ASTRONOMY_PROFILE);
  const { data: bookmarksData, loading: bookmarksLoading } = useQuery(GET_MY_BOOKMARKED_CONTENT, {
    variables: { limit: 50 },
  });
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_MY_FOLLOWED_CATEGORIES);

  const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE, {
    onCompleted: () => {
      setIsEditing(false);
      refetch();
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.name = formData.name;
      localStorage.setItem('user', JSON.stringify(user));
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (userData?.me) {
      setFormData({
        name: userData.me.name || '',
        bio: userData.me.profile?.bio || '',
        avatar: userData.me.profile?.avatar || '',
      });
    }
  }, [userData, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      variables: formData,
    });
  };

  const handleCancel = () => {
    if (userData?.me) {
      setFormData({
        name: userData.me.name || '',
        bio: userData.me.profile?.bio || '',
        avatar: userData.me.profile?.avatar || '',
      });
    }
    setIsEditing(false);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmos-500"></div>
        </div>
      </div>
    );
  }

  if (userError || !userData?.me) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400 mb-6">Please log in to view your profile.</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-cosmos-600 hover:bg-cosmos-500 text-white px-6 py-3 rounded-lg transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const user = userData.me;
  const profile = profileData?.myAstronomyProfile;

  const tabs: { id: TabType; label: string; icon: JSX.Element; count?: number }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      count: profile?.bookmarkedContentCount,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      ),
    },
    {
      id: 'categories',
      label: 'Categories',
      count: profile?.followedCategoriesCount,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      ),
    },
  ];

  // Add "My Content" tab for all users (YouTube-style)
  tabs.push({
    id: 'content',
    label: 'My Content',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  });

  // Mock activity data (in real app, this would come from GraphQL)
  const mockActivities = [
    {
      id: '1',
      type: 'BOOKMARK' as const,
      timestamp: new Date().toISOString(),
      contentTitle: 'The James Webb Space Telescope',
      contentId: '1',
    },
    {
      id: '2',
      type: 'FOLLOW' as const,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      categoryName: 'Black Holes',
      categorySlug: 'black-holes',
    },
    {
      id: '3',
      type: 'VOTE' as const,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      contentTitle: 'Understanding Dark Matter',
      contentId: '2',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header with Avatar and Info */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cosmos-500 to-nebula-500 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
              <p className="text-gray-400 mb-3">{user.email}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-cosmos-500/20 text-cosmos-300 text-sm rounded-full capitalize">
                  {user.role.toLowerCase()}
                </span>
                {profile && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full capitalize">
                    {profile.astronomyLevel.toLowerCase()} Level
                  </span>
                )}
                <span className="px-3 py-1 bg-gray-800 text-gray-400 text-sm rounded-full">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              {user.profile?.bio && (
                <p className="text-gray-300 mt-3">{user.profile.bio}</p>
              )}
            </div>

            {/* Edit Button */}
            {!isEditing && activeTab === 'overview' && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-cosmos-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {isEditing ? (
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={updating}
                        className="bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={updating}
                        className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                      <div className="text-3xl font-bold text-cosmos-400 mb-1">
                        {profile?.bookmarkedContentCount || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Bookmarks</div>
                    </div>
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                      <div className="text-3xl font-bold text-nebula-400 mb-1">
                        {profile?.followedCategoriesCount || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Followed Categories</div>
                    </div>
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                      <div className="text-3xl font-bold text-purple-400 mb-1">
                        {profile?.interests?.length || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Interests</div>
                    </div>
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                      <div className="text-3xl font-bold text-green-400 mb-1">
                        {profile ? '✓' : '—'}
                      </div>
                      <div className="text-gray-400 text-sm">Profile Complete</div>
                    </div>
                  </div>

                  {/* Astronomy Profile */}
                  {profile && (
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                      <h2 className="text-xl font-bold text-white mb-4">Astronomy Profile</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-400 mb-2">Level</h3>
                          <p className="text-white capitalize">{profile.astronomyLevel.toLowerCase()}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-400 mb-2">Interests</h3>
                          <div className="flex flex-wrap gap-2">
                            {profile.interests.map((interest: string) => (
                              <span
                                key={interest}
                                className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-sm"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  {user.role === 'VIEWER' && (
                    <div className="bg-gradient-to-r from-cosmos-500/10 to-nebula-500/10 border border-cosmos-500/30 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-2">Get Verified as Creator</h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Apply for creator verification to get a verified badge, analytics insights, and unlock premium features.
                          </p>
                          <button className="bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-200">
                            Apply for Verification
                          </button>
                        </div>
                        <div className="text-5xl">✅</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <ActivityTimeline activities={mockActivities} loading={false} />
          )}

          {/* Bookmarks Tab */}
          {activeTab === 'bookmarks' && (
            <BookmarksGrid
              bookmarks={bookmarksData?.myBookmarkedContent || []}
              loading={bookmarksLoading}
            />
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <FollowedCategoriesGrid
              categories={categoriesData?.myFollowedCategories || []}
              loading={categoriesLoading}
            />
          )}

          {/* My Content Tab (All Users) */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">My Content</h2>
                <button
                  onClick={() => router.push('/create')}
                  className="bg-cosmos-600 hover:bg-cosmos-500 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Content
                </button>
              </div>

              <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-white mb-2">No Content Yet</h3>
                <p className="text-gray-400 mb-6">
                  Share your knowledge about space and astronomy with the world!
                </p>
                <button
                  onClick={() => router.push('/create')}
                  className="bg-cosmos-600 hover:bg-cosmos-500 text-white px-6 py-3 rounded-lg transition"
                >
                  Create Your First Content
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
