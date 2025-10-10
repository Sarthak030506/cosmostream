'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SHARE_CONTENT } from '@/graphql/content';

interface ShareModalProps {
  contentId: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ contentId, title, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareContent] = useMutation(SHARE_CONTENT);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const shareOptions = [
    {
      name: 'Twitter',
      platform: 'TWITTER',
      icon: '𝕏',
      color: 'bg-black hover:bg-gray-900',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        title
      )}&url=${encodeURIComponent(currentUrl)}`,
    },
    {
      name: 'Facebook',
      platform: 'FACEBOOK',
      icon: 'f',
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    },
    {
      name: 'LinkedIn',
      platform: 'LINKEDIN',
      icon: 'in',
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        currentUrl
      )}`,
    },
    {
      name: 'Reddit',
      platform: 'REDDIT',
      icon: 'R',
      color: 'bg-orange-600 hover:bg-orange-700',
      url: `https://www.reddit.com/submit?url=${encodeURIComponent(
        currentUrl
      )}&title=${encodeURIComponent(title)}`,
    },
  ];

  const handleShare = async (platform: string, url: string) => {
    try {
      // Track the share
      await shareContent({
        variables: {
          contentItemId: contentId,
          platform,
        },
      });

      // Open share window
      window.open(url, '_blank', 'width=600,height=400');
    } catch (error) {
      console.error('Error sharing content:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);

      // Track the share
      await shareContent({
        variables: {
          contentItemId: contentId,
          platform: 'LINK',
        },
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <h3 className="text-2xl font-bold text-white mb-2">Share Content</h3>
        <p className="text-gray-400 text-sm mb-6 pr-8 line-clamp-2">{title}</p>

        {/* Share options */}
        <div className="space-y-3 mb-6">
          {shareOptions.map((option) => (
            <button
              key={option.platform}
              onClick={() => handleShare(option.platform, option.url)}
              className={`w-full ${option.color} text-white px-4 py-3 rounded-lg font-medium transition flex items-center gap-3`}
            >
              <span className="text-xl font-bold">{option.icon}</span>
              <span>Share on {option.name}</span>
            </button>
          ))}
        </div>

        {/* Copy link */}
        <div className="border-t border-gray-800 pt-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Or copy link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentUrl}
              readOnly
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cosmos-500"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {copied ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>
          {copied && (
            <p className="text-green-400 text-sm mt-2">✓ Link copied to clipboard!</p>
          )}
        </div>
      </div>
    </div>
  );
}
