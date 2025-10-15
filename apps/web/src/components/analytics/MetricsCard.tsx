'use client';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: JSX.Element;
  color: 'cosmos' | 'nebula' | 'purple' | 'green' | 'yellow' | 'red';
}

const colorClasses = {
  cosmos: {
    bg: 'bg-cosmos-500/10',
    text: 'text-cosmos-400',
    icon: 'text-cosmos-500',
  },
  nebula: {
    bg: 'bg-nebula-500/10',
    text: 'text-nebula-400',
    icon: 'text-nebula-500',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    icon: 'text-purple-500',
  },
  green: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    icon: 'text-green-500',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    icon: 'text-yellow-500',
  },
  red: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    icon: 'text-red-500',
  },
};

export function MetricsCard({ title, value, subtitle, trend, icon, color }: MetricsCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <div className={colors.icon}>{icon}</div>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend.isPositive
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              style={{
                transform: trend.isPositive ? 'rotate(0deg)' : 'rotate(180deg)',
              }}
            >
              <path
                fillRule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <p className={`text-3xl font-bold ${colors.text} mb-1`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
