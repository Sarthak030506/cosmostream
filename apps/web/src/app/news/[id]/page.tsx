'use client';

import { useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter, useParams } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { GET_NEWS_BY_ID } from '@/graphql/news';
import { BOOKMARK_CONTENT, REMOVE_BOOKMARK, VOTE_CONTENT } from '@/graphql/content';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export default function NewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const newsId = params?.id as string;

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

  const { data, loading, error } = useQuery(GET_NEWS_BY_ID, {
    variables: { id: newsId },
    skip: !newsId,
  });

  const [bookmarkContent] = useMutation(BOOKMARK_CONTENT);
  const [removeBookmark] = useMutation(REMOVE_BOOKMARK);
  const [voteContent] = useMutation(VOTE_CONTENT);

  const newsItem = data?.contentItem;

  const handleBookmark = async () => {
    if (!newsItem) return;
    try {
      if (newsItem.isBookmarked) {
        await removeBookmark({ variables: { contentItemId: newsItem.id } });
      } else {
        await bookmarkContent({ variables: { contentItemId: newsItem.id } });
      }
      window.location.reload();
    } catch (error) {
      console.error('Bookmark error:', error);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!newsItem) return;
    try {
      await voteContent({
        variables: {
          contentItemId: newsItem.id,
          voteType: voteType.toUpperCase(),
        },
      });
      window.location.reload();
    } catch (error) {
      console.error('Vote error:', error);
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

  if (error || !newsItem) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">News not found</h1>
            <Link
              href="/news"
              className="text-cosmos-400 hover:text-cosmos-300 transition"
            >
              Back to News
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(newsItem.publishedAt || newsItem.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-950 relative">
      <Navigation />

      {/* Background Effect */}
      <div className="absolute top-0 left-0 z-0 w-full h-[200px] [mask-image:linear-gradient(to_top,transparent_25%,black_95%)]">
        <FlickeringGrid
          className="absolute top-0 left-0 size-full"
          squareSize={4}
          gridGap={6}
          color="#6366f1"
          maxOpacity={0.2}
          flickerChance={0.05}
        />
      </div>

      {/* Header Section */}
      <div className="space-y-4 border-b border-gray-800 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 p-6">
          <div className="flex flex-wrap items-center gap-3 gap-y-5 text-sm text-gray-400">
            <Link
              href="/news"
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-700 hover:border-cosmos-500 rounded-lg transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="sr-only">Back to all news</span>
            </Link>
            {newsItem.category && (
              <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs font-semibold rounded-md border border-gray-700">
                {newsItem.category.iconEmoji && `${newsItem.category.iconEmoji} `}
                {newsItem.category.name}
              </span>
            )}
            {newsItem.tags && newsItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-3 text-gray-400">
                {newsItem.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium bg-gray-900 text-gray-400 rounded-md border border-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <time className="font-medium text-gray-400">{formattedDate}</time>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-white text-balance">
            {newsItem.title}
          </h1>

          {newsItem.description && (
            <p className="text-gray-400 max-w-4xl md:text-lg md:text-balance">
              {newsItem.description}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex divide-x divide-gray-800 relative max-w-7xl mx-auto px-4 md:px-0 z-10">
        <div className="absolute max-w-7xl mx-auto left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] lg:w-full h-full border-x border-gray-800 p-0 pointer-events-none" />

        <main className="w-full p-0 overflow-hidden lg:w-[calc(100%-350px)]">
          {/* Thumbnail */}
          {newsItem.mediaUrls?.thumbnail && (
            <div className="relative w-full h-[500px] overflow-hidden object-cover border border-transparent">
              <Image
                src={newsItem.mediaUrls.thumbnail}
                alt={newsItem.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Body Content */}
          <div className="p-6 lg:p-10">
            <article className="prose prose-invert max-w-none prose-headings:scroll-mt-8 prose-headings:font-semibold prose-a:text-cosmos-400 prose-a:no-underline hover:prose-a:underline prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance prose-lg">
              {newsItem.bodyMarkdown ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {newsItem.bodyMarkdown}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-400">{newsItem.description}</p>
              )}
            </article>

            {/* Source Link */}
            {newsItem.sourceUrl && (
              <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Original Source:</p>
                <a
                  href={newsItem.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cosmos-400 hover:text-cosmos-300 transition break-all"
                >
                  {newsItem.sourceUrl}
                </a>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block w-[350px] flex-shrink-0 p-6 lg:p-10 bg-gray-900/30">
          <div className="sticky top-20 space-y-8">
            {/* Author Card */}
            {newsItem.author && (
              <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                  Author
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cosmos-600 rounded-full flex items-center justify-center text-white font-bold">
                    {newsItem.author.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {newsItem.author.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Engagement Stats */}
            <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">
                Engagement
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Views</span>
                  <span className="text-white font-medium">
                    {newsItem.viewCount?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Engagement</span>
                  <span className="text-white font-medium">
                    {newsItem.engagementScore || 0}
                  </span>
                </div>
              </div>

              {/* Vote Buttons */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800">
                <button
                  onClick={() => handleVote('upvote')}
                  className={`flex-1 px-3 py-2 rounded-lg border transition ${
                    newsItem.userVote === 'UPVOTE'
                      ? 'bg-green-600 border-green-500 text-white'
                      : 'border-gray-700 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <svg
                    className="w-5 h-5 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleVote('downvote')}
                  className={`flex-1 px-3 py-2 rounded-lg border transition ${
                    newsItem.userVote === 'DOWNVOTE'
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'border-gray-700 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <svg
                    className="w-5 h-5 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleBookmark}
                  className={`px-4 py-2 rounded-lg border transition ${
                    newsItem.isBookmarked
                      ? 'bg-cosmos-600 border-cosmos-500 text-white'
                      : 'border-gray-700 text-gray-400 hover:bg-gray-800'
                  }`}
                  title={newsItem.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                >
                  {newsItem.isBookmarked ? '🔖' : '📑'}
                </button>
              </div>
            </div>

            {/* Share */}
            <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                Share
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }}
                  className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
