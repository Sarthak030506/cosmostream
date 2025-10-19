'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { GET_VIDEO_ANALYTICS, GET_REALTIME_ANALYTICS, GET_VIDEO } from '@/graphql/video';
import { RetentionGraph } from '@/components/analytics/RetentionGraph';
import { TrafficSourceChart } from '@/components/analytics/TrafficSourceChart';
import { DeviceStatsChart } from '@/components/analytics/DeviceStatsChart';
import { ViewsOverTimeChart } from '@/components/analytics/ViewsOverTimeChart';

type TimeRange = 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'ALL_TIME';

export default function VideoAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;
  const [timeRange, setTimeRange] = useState<TimeRange>('LAST_30_DAYS');

  // Fetch video details
  const { data: videoData, loading: videoLoading } = useQuery(GET_VIDEO, {
    variables: { id: videoId },
  });

  // Fetch analytics data
  const { data: analyticsData, loading: analyticsLoading, refetch } = useQuery(GET_VIDEO_ANALYTICS, {
    variables: { videoId, timeRange },
  });

  // Fetch realtime data
  const { data: realtimeData, loading: realtimeLoading } = useQuery(GET_REALTIME_ANALYTICS, {
    variables: { videoId },
    pollInterval: 30000, // Refresh every 30 seconds
  });

  const video = videoData?.video;
  const analytics = analyticsData?.videoAnalytics;
  const realtime = realtimeData?.realtimeAnalytics;

  const loading = videoLoading || analyticsLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!video || !analytics) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-300">Video not found</h2>
            <button
              onClick={() => router.push('/dashboard/videos')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Back to Videos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    if (hours > 1000) {
      return `${(hours / 1000).toFixed(1)}K hours`;
    }
    if (hours > 0) {
      return `${hours.toLocaleString()} hours`;
    }
    const mins = Math.floor(seconds / 60);
    return `${mins} minutes`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <button
            onClick={() => router.push('/dashboard/videos')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Videos
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{video.title}</h1>
              <p className="text-gray-400 mt-2">Video Analytics Dashboard</p>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2">
              {[
                { value: 'LAST_7_DAYS', label: '7 days' },
                { value: 'LAST_30_DAYS', label: '30 days' },
                { value: 'LAST_90_DAYS', label: '90 days' },
                { value: 'ALL_TIME', label: 'All time' },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => {
                    setTimeRange(range.value as TimeRange);
                    refetch({ videoId, timeRange: range.value });
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    timeRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Realtime Stats Bar */}
        {realtime && !realtimeLoading && (
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-4 rounded-lg border border-blue-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="font-semibold">Live Stats</span>
              </div>
              <div className="flex gap-8 text-sm">
                <div>
                  <span className="text-gray-400">Current Viewers: </span>
                  <span className="font-semibold text-white">{realtime.currentViewers}</span>
                </div>
                <div>
                  <span className="text-gray-400">Last Hour: </span>
                  <span className="font-semibold text-white">{realtime.viewsLastHour}</span>
                </div>
                <div>
                  <span className="text-gray-400">Last 24h: </span>
                  <span className="font-semibold text-white">{realtime.viewsLast24h}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Total Views</h3>
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{analytics.totalViews.toLocaleString()}</p>
            <p className="text-gray-400 text-sm mt-1">
              {analytics.uniqueViews.toLocaleString()} unique
            </p>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Watch Time</h3>
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{formatWatchTime(analytics.watchTime)}</p>
            <p className="text-gray-400 text-sm mt-1">
              Avg: {formatDuration(analytics.avgViewDuration)}
            </p>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Completion Rate</h3>
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{analytics.completionRate.toFixed(1)}%</p>
            <p className="text-gray-400 text-sm mt-1">Video completion</p>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Engagement</h3>
              <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{video.likes || 0}</p>
            <p className="text-gray-400 text-sm mt-1">Total likes</p>
          </div>
        </div>

        {/* Views Over Time */}
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
          <ViewsOverTimeChart data={analytics.viewsByDate || []} />
        </div>

        {/* Retention Graph */}
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
          <RetentionGraph data={analytics.retentionCurve || []} videoDuration={video.duration} />
        </div>

        {/* Traffic Sources & Device Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <TrafficSourceChart data={analytics.trafficSources || []} />
          </div>

          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <DeviceStatsChart data={analytics.deviceStats || {}} />
          </div>
        </div>

        {/* Geographic Data */}
        {analytics.topCountries && analytics.topCountries.length > 0 && (
          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Top Countries</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.topCountries.map((country: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-sm font-bold text-gray-300">
                      {index + 1}
                    </div>
                    <span className="text-white font-medium">{country.country}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{country.views.toLocaleString()}</p>
                    <p className="text-gray-400 text-sm">{country.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Section */}
        <div className="flex justify-end gap-4">
          <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
