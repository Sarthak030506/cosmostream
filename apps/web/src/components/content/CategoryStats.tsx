'use client';

interface CategoryStatsProps {
  followerCount: number;
  contentCount: number;
  viewCount?: number;
  isFollowing?: boolean;
}

export function CategoryStats({
  followerCount,
  contentCount,
  viewCount,
  isFollowing,
}: CategoryStatsProps) {
  const stats = [
    {
      label: 'Content Items',
      value: contentCount.toLocaleString(),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      color: 'text-cosmos-400',
      bgColor: 'bg-cosmos-500/10',
    },
    {
      label: 'Followers',
      value: followerCount.toLocaleString(),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      color: 'text-nebula-400',
      bgColor: 'bg-nebula-500/10',
    },
  ];

  if (viewCount !== undefined) {
    stats.push({
      label: 'Total Views',
      value: viewCount.toLocaleString(),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      ),
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <div className={stat.color}>{stat.icon}</div>
            </div>
            {index === 1 && isFollowing && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                Following
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
          <p className="text-sm text-gray-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
