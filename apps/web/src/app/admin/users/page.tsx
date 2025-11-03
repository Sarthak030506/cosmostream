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

const GET_USERS = gql`
  query GetUsers($search: String, $limit: Int, $offset: Int) {
    users(search: $search, limit: $limit, offset: $offset) {
      items {
        id
        email
        name
        role
        createdAt
      }
      hasMore
      totalCount
    }
  }
`;

const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: Role!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      email
      name
      role
      createdAt
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId)
  }
`;

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('VIEWER');

  const limit = 20;
  const offset = page * limit;

  const { data: userData, loading: userLoading } = useQuery(GET_ME);
  const {
    data: usersData,
    loading: usersLoading,
    refetch,
  } = useQuery(GET_USERS, {
    variables: { search: debouncedSearch || undefined, limit, offset },
    skip: !userData?.me || userData?.me?.role?.toUpperCase() !== 'ADMIN',
  });

  const [updateUserRole, { loading: updateLoading }] = useMutation(UPDATE_USER_ROLE);
  const [deleteUser, { loading: deleteLoading }] = useMutation(DELETE_USER);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

  // Admin role check
  useEffect(() => {
    if (userData?.me && userData.me.role?.toUpperCase() !== 'ADMIN') {
      router.push('/');
    }
  }, [userData, router]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset to first page on new search
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      await updateUserRole({
        variables: {
          userId: selectedUser.id,
          role: selectedRole,
        },
      });
      setIsRoleModalOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (error: any) {
      alert(error.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser({
        variables: {
          userId: selectedUser.id,
        },
      });
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (error: any) {
      alert(error.message || 'Failed to delete user');
    }
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

  if (!userData?.me || userData.me.role?.toUpperCase() !== 'ADMIN') {
    return null; // Will redirect via useEffect
  }

  const users = usersData?.users?.items || [];
  const totalCount = usersData?.users?.totalCount || 0;
  const hasMore = usersData?.users?.hasMore || false;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white mb-2">
            User Management
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            View and manage all users in the system
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-gray-800 text-white px-4 py-3 pl-12 rounded-lg border border-gray-700 focus:border-cosmos-500 focus:outline-none"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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

        {/* Stats */}
        <div className="mb-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-white text-2xl font-bold">{totalCount.toLocaleString()}</p>
            </div>
            {debouncedSearch && (
              <div>
                <p className="text-gray-400 text-sm">Search Results</p>
                <p className="text-white text-2xl font-bold">{users.length}</p>
              </div>
            )}
          </div>
        </div>

        {/* User Table */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cosmos-500"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {users.map((user: User) => (
                      <tr key={user.id} className="hover:bg-gray-800/30 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'ADMIN'
                                ? 'bg-purple-900/50 text-purple-300'
                                : user.role === 'CREATOR'
                                ? 'bg-blue-900/50 text-blue-300'
                                : 'bg-gray-700/50 text-gray-300'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setSelectedRole(user.role);
                              setIsRoleModalOpen(true);
                            }}
                            className="text-cosmos-400 hover:text-cosmos-300 mr-4"
                          >
                            Edit Role
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-800 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing {offset + 1} to {Math.min(offset + limit, totalCount)} of{' '}
                    {totalCount} users
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 bg-gray-800 text-white rounded-lg">
                      Page {page + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!hasMore}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Update Role Modal */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Update User Role</h3>
            <p className="text-gray-400 mb-4">
              Change role for <span className="text-white font-medium">{selectedUser.name}</span>
            </p>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-cosmos-500 focus:outline-none mb-6"
            >
              <option value="VIEWER">Viewer</option>
              <option value="CREATOR">Creator</option>
              <option value="ADMIN">Admin</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsRoleModalOpen(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={updateLoading}
                className="flex-1 px-4 py-2 bg-cosmos-600 text-white rounded-lg hover:bg-cosmos-500 disabled:opacity-50"
              >
                {updateLoading ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Delete User</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete{' '}
              <span className="text-white font-medium">{selectedUser.name}</span>? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
