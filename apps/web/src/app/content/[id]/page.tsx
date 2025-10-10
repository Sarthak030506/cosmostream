'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { DifficultyBadge } from '@/components/content/DifficultyBadge';
import { ShareModal } from '@/components/content/ShareModal';
import { RelatedContent } from '@/components/content/RelatedContent';
import { TableOfContents } from '@/components/content/TableOfContents';
import { AuthorCard } from '@/components/content/AuthorCard';
import {
  GET_CONTENT_ITEM,
  VOTE_CONTENT,
  REMOVE_VOTE,
  BOOKMARK_CONTENT,
  REMOVE_BOOKMARK,
  RECORD_CONTENT_VIEW,
} from '@/graphql/content';
import Link from 'next/link';

export default function ContentDetailPage() {
  const params = useParams();
  const contentId = params.id as string;

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);

  const { data, loading, error } = useQuery(GET_CONTENT_ITEM, {
    variables: { id: contentId },
  });

  const [voteContent] = useMutation(VOTE_CONTENT);
  const [removeVote] = useMutation(REMOVE_VOTE);
  const [bookmarkContent] = useMutation(BOOKMARK_CONTENT);
  const [removeBookmark] = useMutation(REMOVE_BOOKMARK);
  const [recordView] = useMutation(RECORD_CONTENT_VIEW);

  const content = data?.contentItem;

  // Initialize state from content data
  useEffect(() => {
    if (content) {
      setUserVote(content.userVote);
      setIsBookmarked(content.isBookmarked);
      setUpvotes(content.upvotes);
      setDownvotes(content.downvotes);
    }
  }, [content]);

  // Record view on page load
  useEffect(() => {
    if (contentId) {
      recordView({ variables: { contentItemId: contentId } });
    }
  }, [contentId, recordView]);

  // Calculate reading time
  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  const handleVote = async (value: number) => {
    try {
      if (userVote === value) {
        // Remove vote
        await removeVote({ variables: { contentItemId: contentId } });
        if (value === 1) {
          setUpvotes(upvotes - 1);
        } else {
          setDownvotes(downvotes - 1);
        }
        setUserVote(null);
      } else {
        // Add or change vote
        await voteContent({ variables: { contentItemId: contentId, value } });

        if (userVote === 1) {
          setUpvotes(upvotes - 1);
        } else if (userVote === -1) {
          setDownvotes(downvotes - 1);
        }

        if (value === 1) {
          setUpvotes(upvotes + 1);
        } else {
          setDownvotes(downvotes + 1);
        }

        setUserVote(value);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await removeBookmark({ variables: { contentItemId: contentId } });
        setIsBookmarked(false);
      } else {
        await bookmarkContent({ variables: { contentItemId: contentId } });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error bookmarking:', error);
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

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-3xl font-bold text-white mb-4">Content Not Found</h1>
          <p className="text-gray-400 mb-6">The content you're looking for doesn't exist.</p>
          <Link
            href="/discover"
            className="bg-cosmos-600 hover:bg-cosmos-500 text-white px-6 py-3 rounded-lg transition inline-block"
          >
            Back to Discovery
          </Link>
        </div>
      </div>
    );
  }

  const readingTime = calculateReadingTime(content.bodyMarkdown || '');

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      {/* Hero Section */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900/50 to-gray-950">
        <div className="container mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/discover" className="hover:text-white transition">
              Discover
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link
              href={`/category/${content.category.slug}`}
              className="hover:text-white transition flex items-center gap-1"
            >
              <span>{content.category.iconEmoji}</span>
              <span>{content.category.name}</span>
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{content.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <DifficultyBadge level={content.difficultyLevel} size="lg" />
            <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
              {content.contentType}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">{readingTime} min read</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">{content.viewCount.toLocaleString()} views</span>
          </div>

          {/* Description */}
          {content.description && (
            <p className="text-xl text-gray-400 max-w-3xl">{content.description}</p>
          )}
        </div>
      </div>

      {/* Social Actions Bar - Sticky */}
      <div className="sticky top-16 z-30 border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Upvote */}
              <button
                onClick={() => handleVote(1)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  userVote === 1
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{upvotes}</span>
              </button>

              {/* Downvote */}
              <button
                onClick={() => handleVote(-1)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  userVote === -1
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{downvotes}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Bookmark */}
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  isBookmarked
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={isBookmarked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                <span className="hidden md:inline">
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </span>
              </button>

              {/* Share */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span className="hidden md:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-8">
            <MarkdownRenderer content={content.bodyMarkdown || ''} />

            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-800">
                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wide">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {content.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-gray-700 transition cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <TableOfContents content={content.bodyMarkdown || ''} />
            <AuthorCard author={content.author} />
            <RelatedContent
              categoryId={content.category.id}
              currentContentId={contentId}
              difficultyLevel={content.difficultyLevel}
            />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        contentId={contentId}
        title={content.title}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
