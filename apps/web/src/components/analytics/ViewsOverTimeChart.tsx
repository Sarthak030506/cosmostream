'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TimeSeriesData {
  date: string;
  value: number;
}

interface ViewsOverTimeChartProps {
  data: TimeSeriesData[];
}

export function ViewsOverTimeChart({ data }: ViewsOverTimeChartProps) {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      formattedDate: formatDate(point.date),
    }));
  }, [data]);

  const totalViews = useMemo(() => {
    return data.reduce((sum, point) => sum + point.value, 0);
  }, [data]);

  const avgViews = useMemo(() => {
    return data.length > 0 ? totalViews / data.length : 0;
  }, [totalViews, data.length]);

  const peakViews = useMemo(() => {
    return data.length > 0 ? Math.max(...data.map((d) => d.value)) : 0;
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-900/50 rounded-lg border border-gray-800">
        <p className="text-gray-400">No view data available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Views Over Time</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-sm text-gray-300">Daily Views</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="formattedDate"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB',
            }}
            labelStyle={{ color: '#F9FAFB' }}
            formatter={(value: any) => [value.toLocaleString(), 'Views']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorViews)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-xs">Total Views</p>
          <p className="text-white font-semibold text-lg mt-1">{totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-xs">Average per Day</p>
          <p className="text-white font-semibold text-lg mt-1">{Math.round(avgViews).toLocaleString()}</p>
        </div>
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-xs">Peak Day</p>
          <p className="text-white font-semibold text-lg mt-1">{peakViews.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
