'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface TrafficSource {
  source: string;
  views: number;
  uniqueViewers: number;
  percentage: number;
  avgCompletion: number;
}

interface TrafficSourceChartProps {
  data: TrafficSource[];
}

const COLORS = {
  search: '#3B82F6',
  browse: '#8B5CF6',
  recommended: '#EC4899',
  direct: '#10B981',
  external: '#F59E0B',
  social: '#EF4444',
};

const SOURCE_LABELS: Record<string, string> = {
  search: 'Search',
  browse: 'Browse',
  recommended: 'Recommended',
  direct: 'Direct',
  external: 'External',
  social: 'Social Media',
};

export function TrafficSourceChart({ data }: TrafficSourceChartProps) {
  const chartData = useMemo(() => {
    return data.map((source) => ({
      name: SOURCE_LABELS[source.source] || source.source,
      value: source.views,
      percentage: source.percentage,
      uniqueViewers: source.uniqueViewers,
      avgCompletion: source.avgCompletion,
      color: COLORS[source.source as keyof typeof COLORS] || '#6B7280',
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-900/50 rounded-lg border border-gray-800">
        <p className="text-gray-400">No traffic data available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Traffic Sources</h3>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
                formatter={(value: any, name: string, props: any) => {
                  if (name === 'value') {
                    return [
                      `${value.toLocaleString()} views (${props.payload.percentage.toFixed(1)}%)`,
                      'Views',
                    ];
                  }
                  return [value, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2">
          {chartData.map((source, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: source.color }}
                />
                <div>
                  <p className="text-white font-medium">{source.name}</p>
                  <p className="text-gray-400 text-sm">
                    {source.uniqueViewers.toLocaleString()} unique viewers
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{source.value.toLocaleString()}</p>
                <p className="text-gray-400 text-sm">{source.percentage.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
