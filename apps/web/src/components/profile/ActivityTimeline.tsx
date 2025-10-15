'use client';

import Link from 'next/link';

interface ActivityItem {
  id: string;
  type: 'VOTE' | 'BOOKMARK' | 'SHARE' | 'FOLLOW' | 'COMMENT' | 'CREATE';
  timestamp: string;
  contentTitle?: string;
  contentId?: string;
  categoryName?: string;
  categorySlug?: string;
  platform?: string;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  loading?: boolean;
}

export function ActivityTimeline({ activities, loading }: ActivityTimelineProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmos-500"></div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-white mb-2">No Activity Yet</h3>
        <p className="text-gray-400 mb-6">Start exploring content to see your activity here!</p>
        <Link
          href="/discover"
          className="inline-block bg-cosmos-600 hover:bg-cosmos-500 text-white px-6 py-3 rounded-lg transition"
        >
          Discover Content
        </Link>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'VOTE':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'BOOKMARK':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        );
      case 'SHARE':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        );
      case 'FOLLOW':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        );
      case 'CREATE':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'VOTE':
        return 'bg-green-500/20 text-green-400';
      case 'BOOKMARK':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'SHARE':
        return 'bg-blue-500/20 text-blue-400';
      case 'FOLLOW':
        return 'bg-purple-500/20 text-purple-400';
      case 'CREATE':
        return 'bg-cosmos-500/20 text-cosmos-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'VOTE':
        return (
          <>
            Upvoted{' '}
            {activity.contentId ? (
              <Link
                href={`/content/${activity.contentId}`}
                className="text-cosmos-400 hover:underline font-medium"
              >
                {activity.contentTitle}
              </Link>
            ) : (
              <span className="font-medium">{activity.contentTitle}</span>
            )}
          </>
        );
      case 'BOOKMARK':
        return (
          <>
            Bookmarked{' '}
            {activity.contentId ? (
              <Link
                href={`/content/${activity.contentId}`}
                className="text-cosmos-400 hover:underline font-medium"
              >
                {activity.contentTitle}
              </Link>
            ) : (
              <span className="font-medium">{activity.contentTitle}</span>
            )}
          </>
        );
      case 'SHARE':
        return (
          <>
            Shared{' '}
            {activity.contentId ? (
              <Link
                href={`/content/${activity.contentId}`}
                className="text-cosmos-400 hover:underline font-medium"
              >
                {activity.contentTitle}
              </Link>
            ) : (
              <span className="font-medium">{activity.contentTitle}</span>
            )}{' '}
            on {activity.platform}
          </>
        );
      case 'FOLLOW':
        return (
          <>
            Followed category{' '}
            {activity.categorySlug ? (
              <Link
                href={`/category/${activity.categorySlug}`}
                className="text-cosmos-400 hover:underline font-medium"
              >
                {activity.categoryName}
              </Link>
            ) : (
              <span className="font-medium">{activity.categoryName}</span>
            )}
          </>
        );
      case 'CREATE':
        return (
          <>
            Created{' '}
            {activity.contentId ? (
              <Link
                href={`/content/${activity.contentId}`}
                className="text-cosmos-400 hover:underline font-medium"
              >
                {activity.contentTitle}
              </Link>
            ) : (
              <span className="font-medium">{activity.contentTitle}</span>
            )}
          </>
        );
      default:
        return 'Unknown activity';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-gray-700 transition"
        >
          <div className={`flex-shrink-0 p-3 rounded-lg ${getActivityColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-gray-300 text-sm">{getActivityText(activity)}</p>
            <p className="text-gray-500 text-xs mt-1">{formatTimestamp(activity.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
