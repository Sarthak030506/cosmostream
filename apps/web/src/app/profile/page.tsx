'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';

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

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: '',
  });

  const { data, loading, error, refetch } = useQuery(GET_ME);
  const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE, {
    onCompleted: () => {
      setIsEditing(false);
      refetch();
      // Update localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.name = formData.name;
      localStorage.setItem('user', JSON.stringify(user));
    },
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (data?.me) {
      setFormData({
        name: data.me.name || '',
        bio: data.me.profile?.bio || '',
        avatar: data.me.profile?.avatar || '',
      });
    }
  }, [data, router]);

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
    if (data?.me) {
      setFormData({
        name: data.me.name || '',
        bio: data.me.profile?.bio || '',
        avatar: data.me.profile?.avatar || '',
      });
    }
    setIsEditing(false);
  };

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

  if (error || !data?.me) {
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

  const user = data.me;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account information and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 mb-6">
          {/* Avatar Section */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cosmos-500 to-nebula-500 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
              <p className="text-gray-400 mb-2">{user.email}</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-cosmos-500/20 text-cosmos-300 text-sm rounded-full capitalize">
                  {user.role.toLowerCase()}
                </span>
                <span className="px-3 py-1 bg-gray-800 text-gray-400 text-sm rounded-full">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>

          {/* Edit Form */}
          {isEditing ? (
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
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Bio</h3>
                <p className="text-white">
                  {user.profile?.bio || (
                    <span className="text-gray-500 italic">No bio added yet. Click "Edit Profile" to add one.</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-cosmos-400 mb-1">0</div>
            <div className="text-gray-400 text-sm">Videos Watched</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-nebula-400 mb-1">0</div>
            <div className="text-gray-400 text-sm">Hours Watched</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-purple-400 mb-1">0</div>
            <div className="text-gray-400 text-sm">Bookmarks</div>
          </div>
        </div>

        {/* Actions */}
        {user.role === 'VIEWER' && (
          <div className="bg-gradient-to-r from-cosmos-500/10 to-nebula-500/10 border border-cosmos-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Become a Creator</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Share your knowledge about space and astronomy with the world. Upload videos, create courses, and build your audience.
                </p>
                <button className="bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-200">
                  Apply Now
                </button>
              </div>
              <div className="text-5xl">🚀</div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/settings')}
            className="bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800 rounded-xl p-4 text-left transition flex items-center gap-3"
          >
            <svg className="w-6 h-6 text-cosmos-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <div className="font-semibold text-white">Settings</div>
              <div className="text-sm text-gray-400">Account preferences</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/browse')}
            className="bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800 rounded-xl p-4 text-left transition flex items-center gap-3"
          >
            <svg className="w-6 h-6 text-nebula-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <div>
              <div className="font-semibold text-white">Browse Videos</div>
              <div className="text-sm text-gray-400">Explore content</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
