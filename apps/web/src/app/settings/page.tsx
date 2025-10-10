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
    }
  }
`;

const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      success
    }
  }
`;

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, loading } = useQuery(GET_ME);

  const [changePassword, { loading: changingPassword }] = useMutation(CHANGE_PASSWORD_MUTATION, {
    onCompleted: () => {
      setSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      setError(error.message);
      setSuccess('');
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    await changePassword({
      variables: {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      },
    });
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement delete account mutation
      alert('Account deletion will be implemented soon');
    }
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

  const user = data?.me;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-2">
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                  activeTab === 'account'
                    ? 'bg-cosmos-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 mt-1 ${
                  activeTab === 'privacy'
                    ? 'bg-cosmos-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Privacy
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 mt-1 ${
                  activeTab === 'notifications'
                    ? 'bg-cosmos-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Notifications
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'account' && (
              <div className="space-y-6">
                {/* Account Info */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                      <div className="text-white">{user?.email}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                      <span className="px-3 py-1 bg-cosmos-500/20 text-cosmos-300 text-sm rounded-full capitalize">
                        {user?.role.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm">
                        {success}
                      </div>
                    )}

                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? 'Changing Password...' : 'Change Password'}
                    </button>
                  </form>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h2>
                  <p className="text-gray-400 text-sm mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Privacy Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div>
                      <div className="font-medium text-white">Profile Visibility</div>
                      <div className="text-sm text-gray-400">Make your profile visible to everyone</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-700 bg-gray-800 text-cosmos-500 focus:ring-cosmos-500" />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div>
                      <div className="font-medium text-white">Show Watch History</div>
                      <div className="text-sm text-gray-400">Display your watch history on your profile</div>
                    </div>
                    <input type="checkbox" className="rounded border-gray-700 bg-gray-800 text-cosmos-500 focus:ring-cosmos-500" />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-medium text-white">Allow Messages</div>
                      <div className="text-sm text-gray-400">Let other users send you private messages</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-700 bg-gray-800 text-cosmos-500 focus:ring-cosmos-500" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div>
                      <div className="font-medium text-white">Email Notifications</div>
                      <div className="text-sm text-gray-400">Receive email updates about new content</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-700 bg-gray-800 text-cosmos-500 focus:ring-cosmos-500" />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div>
                      <div className="font-medium text-white">New Video Alerts</div>
                      <div className="text-sm text-gray-400">Get notified when creators you follow upload</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-700 bg-gray-800 text-cosmos-500 focus:ring-cosmos-500" />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div>
                      <div className="font-medium text-white">Forum Mentions</div>
                      <div className="text-sm text-gray-400">Be notified when someone mentions you in forums</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-700 bg-gray-800 text-cosmos-500 focus:ring-cosmos-500" />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-medium text-white">Weekly Digest</div>
                      <div className="text-sm text-gray-400">Receive a weekly summary of platform activity</div>
                    </div>
                    <input type="checkbox" className="rounded border-gray-700 bg-gray-800 text-cosmos-500 focus:ring-cosmos-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
