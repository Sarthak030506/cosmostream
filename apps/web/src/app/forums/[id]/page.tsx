'use client';

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';

const GET_THREAD = gql`
  query GetThread($id: ID!) {
    thread(id: $id) {
      id
      title
      category
      tags
      createdAt
      updatedAt
      creator {
        id
        name
      }
      posts {
        id
        content
        votes
        isExpertAnswer
        createdAt
        author {
          id
          name
          role
        }
      }
    }
  }
`;

const CREATE_POST = gql`
  mutation CreatePost($threadId: ID!, $content: String!) {
    createPost(threadId: $threadId, content: $content) {
      id
      content
      votes
      createdAt
      author {
        id
        name
      }
    }
  }
`;

const VOTE_POST = gql`
  mutation VotePost($postId: ID!, $value: Int!) {
    votePost(postId: $postId, value: $value) {
      id
      votes
    }
  }
`;

export default function ThreadDetailPage() {
  const params = useParams();
  const threadId = params.id as string;

  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_THREAD, {
    variables: { id: threadId },
  });

  const [createPost, { loading: posting }] = useMutation(CREATE_POST, {
    onCompleted: () => {
      setReplyContent('');
      setIsReplying(false);
      refetch();
    },
  });

  const [votePost] = useMutation(VOTE_POST, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    await createPost({
      variables: {
        threadId,
        content: replyContent,
      },
    });
  };

  const handleVote = async (postId: string, value: number) => {
    await votePost({
      variables: { postId, value },
    });
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

  if (error || !data?.thread) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-white mb-2">Thread Not Found</h2>
            <p className="text-gray-400 mb-6">This thread doesn't exist or has been removed.</p>
            <Link
              href="/forums"
              className="inline-block bg-cosmos-600 hover:bg-cosmos-500 text-white px-6 py-3 rounded-lg transition"
            >
              Back to Forums
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const thread = data.thread;
  const posts = thread.posts || [];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-400">
          <Link href="/forums" className="hover:text-cosmos-400 transition">
            Forums
          </Link>
          {' '}/{' '}
          <span className="text-white">{thread.title}</span>
        </div>

        {/* Thread Header */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cosmos-500 to-nebula-500 flex items-center justify-center text-white text-2xl flex-shrink-0">
              {thread.creator.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{thread.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span>Started by <Link href={`/profile/${thread.creator.id}`} className="text-cosmos-400 hover:underline">{thread.creator.name}</Link></span>
                <span>•</span>
                <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{posts.length} replies</span>
              </div>
            </div>
          </div>

          {/* Tags and Category */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-cosmos-500/20 text-cosmos-300 text-sm rounded-full">
              {thread.category}
            </span>
            {thread.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-gray-800 text-gray-400 text-sm rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4 mb-6">
          {posts.map((post: any) => (
            <div
              key={post.id}
              className={`bg-gray-900/50 backdrop-blur-sm border rounded-xl p-6 ${
                post.isExpertAnswer ? 'border-green-500/50 bg-green-500/5' : 'border-gray-800'
              }`}
            >
              <div className="flex gap-4">
                {/* User Avatar */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cosmos-500 to-nebula-500 flex items-center justify-center text-white font-bold">
                    {post.author.name.charAt(0)}
                  </div>

                  {/* Vote Buttons */}
                  <div className="flex flex-col items-center bg-gray-800 rounded-lg py-2 px-1">
                    <button
                      onClick={() => handleVote(post.id, 1)}
                      className="text-gray-400 hover:text-cosmos-400 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <span className="text-white font-semibold my-1">{post.votes}</span>
                    <button
                      onClick={() => handleVote(post.id, -1)}
                      className="text-gray-400 hover:text-red-400 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Link
                        href={`/profile/${post.author.id}`}
                        className="font-semibold text-white hover:text-cosmos-400 transition"
                      >
                        {post.author.name}
                      </Link>
                      <span className="ml-2 px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded capitalize">
                        {post.author.role.toLowerCase()}
                      </span>
                      {post.isExpertAnswer && (
                        <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded font-semibold">
                          ✓ Expert Answer
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                    {post.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        {isReplying ? (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Post a Reply</h3>
            <form onSubmit={handleSubmitReply}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={6}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition resize-none mb-4"
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={posting || !replyContent.trim()}
                  className="bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {posting ? 'Posting...' : 'Post Reply'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent('');
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setIsReplying(true)}
            className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-cosmos-500 rounded-xl p-6 text-gray-400 hover:text-white transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add a reply
          </button>
        )}
      </div>
    </div>
  );
}
