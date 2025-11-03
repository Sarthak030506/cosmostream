'use client';

import { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { MetricsCard } from '@/components/analytics/MetricsCard';
import { EngagementChart } from '@/components/analytics/EngagementChart';
import { ContentCard } from '@/components/content/ContentCard';
import Link from 'next/link';

const GET_ME = gql`
  query GetMe {
    me {
      id
      role
    }
  }
`;

const GET_CREATOR_ANALYTICS = gql`
  query GetCreatorAnalytics($timeRange: AnalyticsTimeRange) {
    myCreatorAnalytics(timeRange: $timeRange) {
      totalContent
      totalViews
      totalUpvotes
      totalBookmarks
      totalShares
      engagementRate
      viewsOverTime {
        date
        value
      }
      engagementOverTime {
        date
        value
      }
      topContent {
        id
        title
        description
        contentType
        difficultyLevel
        ageGroup
        tags
        category {
          id
          name
          slug
          iconEmoji
        }
        author {
          id
          name
        }
        viewCount
        upvotes
        downvotes
        shareCount
        bookmarkCount
        engagementScore
        userVote
        isBookmarked
        createdAt
        updatedAt
      }
      contentByCategory {
        category {
          id
          name
          slug
          iconEmoji
        }
        contentCount
        totalViews
        totalEngagement
      }
      audienceLevel {
        level
        count
        percentage
      }
    }
  }
`;

type TimeRange = 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'ALL_TIME';

export default function AnalyticsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>('LAST_30_DAYS');

  const { data: userData, loading: userLoading } = useQuery(GET_ME);
  const { data: analyticsData, loading: analyticsLoading } = useQuery(GET_CREATOR_ANALYTICS, {
    variables: { timeRange },
    skip: !userData?.me,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

  // All authenticated users can access analytics (removed role check)

  if (userLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmos-500"></div>
        </div>
      </div>
    );
  }

  if (!userData?.me) {
    return null; // Will redirect via useEffect
  }

  const analytics = analyticsData?.myCreatorAnalytics;

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'LAST_7_DAYS', label: 'Last 7 Days' },
    { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
    { value: 'LAST_90_DAYS', label: 'Last 90 Days' },
    { value: 'ALL_TIME', label: 'All Time' },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white mb-2">Creator Analytics</h1>
            <p className="text-sm sm:text-base text-gray-400">
              Track your content performance and audience engagement
            </p>
          </div>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="bg-gray-800 text-gray-300 px-3 sm:px-4 py-2.5 rounded-lg border border-gray-700 focus:border-cosmos-500 focus:outline-none text-sm sm:text-base min-h-touch"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {analytics ? (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 xs:gap-4 mb-6 sm:mb-8">
              <MetricsCard
                title="Total Content"
                value={analytics.totalContent}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
                color="cosmos"
              />
              <MetricsCard
                title="Total Views"
                value={analytics.totalViews.toLocaleString()}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                }
                color="nebula"
              />
              <MetricsCard
                title="Total Upvotes"
                value={analytics.totalUpvotes.toLocaleString()}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
                color="green"
              />
              <MetricsCard
                title="Total Bookmarks"
                value={analytics.totalBookmarks.toLocaleString()}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                }
                color="yellow"
              />
              <MetricsCard
                title="Engagement Rate"
                value={`${analytics.engagementRate}%`}
                subtitle="Interactions / Views"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                }
                color="purple"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <EngagementChart
                data={analytics.viewsOverTime}
                title="Views Over Time"
                color="#8b5cf6"
              />
              <EngagementChart
                data={analytics.engagementOverTime}
                title="Engagement Over Time"
                color="#ec4899"
              />
            </div>

            {/* Top Content */}
            {analytics.topContent && analytics.topContent.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Top Performing Content</h2>
                <div className="grid grid-cols-1 gap-6">
                  {analytics.topContent.map((content: any) => (
                    <ContentCard key={content.id} content={content} />
                  ))}
                </div>
              </div>
            )}

            {/* Content by Category & Audience Level */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Content by Category */}
              {analytics.contentByCategory && analytics.contentByCategory.length > 0 && (
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Content by Category</h3>
                  <div className="space-y-4">
                    {analytics.contentByCategory.map((item: any) => (
                      <Link
                        key={item.category.id}
                        href={`/category/${item.category.slug}`}
                        className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.category.iconEmoji}</span>
                          <div>
                            <p className="font-medium text-white">{item.category.name}</p>
                            <p className="text-sm text-gray-400">
                              {item.contentCount} content • {item.totalViews.toLocaleString()}{' '}
                              views
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-cosmos-400">
                            {item.totalEngagement}
                          </p>
                          <p className="text-xs text-gray-500">engagement</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Audience Level */}
              {analytics.audienceLevel && analytics.audienceLevel.length > 0 && (
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Audience by Level</h3>
                  <div className="space-y-4">
                    {analytics.audienceLevel.map((item: any) => (
                      <div key={item.level} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium capitalize">
                            {item.level.toLowerCase()}
                          </span>
                          <span className="text-gray-400">
                            {item.count} ({item.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-cosmos-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">No Analytics Data</h3>
            <p className="text-gray-400 mb-6">
              Start creating content to see your analytics here!
            </p>
            <button
              onClick={() => router.push('/create')}
              className="bg-cosmos-600 hover:bg-cosmos-500 text-white px-6 py-3 rounded-lg transition"
            >
              Create Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
