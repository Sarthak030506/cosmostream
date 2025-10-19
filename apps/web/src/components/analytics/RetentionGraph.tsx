'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface RetentionPoint {
  timestamp: number;
  viewerPercentage: number;
  viewerCount: number;
  dropOffCount: number;
}

interface RetentionGraphProps {
  data: RetentionPoint[];
  videoDuration?: number;
}

export function RetentionGraph({ data, videoDuration }: RetentionGraphProps) {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      time: formatTime(point.timestamp),
      timestamp: point.timestamp,
      retention: point.viewerPercentage,
      viewers: point.viewerCount,
      dropOff: point.dropOffCount,
    }));
  }, [data]);

  const milestones = useMemo(() => {
    if (!videoDuration) return [];
    return [
      { value: videoDuration * 0.25, label: '25%' },
      { value: videoDuration * 0.5, label: '50%' },
      { value: videoDuration * 0.75, label: '75%' },
      { value: videoDuration, label: '100%' },
    ];
  }, [videoDuration]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-900/50 rounded-lg border border-gray-800">
        <p className="text-gray-400">No retention data available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Audience Retention</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-gray-300">Retention %</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB',
            }}
            labelStyle={{ color: '#F9FAFB' }}
            formatter={(value: any, name: string) => {
              if (name === 'retention') return [`${value.toFixed(1)}%`, 'Retention'];
              if (name === 'viewers') return [value, 'Viewers'];
              if (name === 'dropOff') return [value, 'Drop-off'];
              return [value, name];
            }}
          />

          {/* Milestone markers */}
          {milestones.map((milestone) => (
            <ReferenceLine
              key={milestone.label}
              x={formatTime(milestone.value)}
              stroke="#6366F1"
              strokeDasharray="3 3"
              label={{ value: milestone.label, fill: '#818CF8', fontSize: 11 }}
            />
          ))}

          <Line
            type="monotone"
            dataKey="retention"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-xs">Start Retention</p>
          <p className="text-white font-semibold text-lg mt-1">
            {chartData[0]?.retention.toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-xs">Avg Retention</p>
          <p className="text-white font-semibold text-lg mt-1">
            {(chartData.reduce((sum, d) => sum + d.retention, 0) / chartData.length).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-xs">End Retention</p>
          <p className="text-white font-semibold text-lg mt-1">
            {chartData[chartData.length - 1]?.retention.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
