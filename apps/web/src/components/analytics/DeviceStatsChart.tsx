'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BrowserStat {
  browser: string;
  count: number;
  percentage: number;
}

interface OSStat {
  os: string;
  count: number;
  percentage: number;
}

interface DeviceStats {
  desktop: number;
  mobile: number;
  tablet: number;
  browsers: BrowserStat[];
  operatingSystems: OSStat[];
}

interface DeviceStatsChartProps {
  data: DeviceStats;
}

const DEVICE_COLORS = {
  desktop: '#3B82F6',
  mobile: '#8B5CF6',
  tablet: '#10B981',
};

export function DeviceStatsChart({ data }: DeviceStatsChartProps) {
  const deviceData = useMemo(() => {
    const total = data.desktop + data.mobile + data.tablet;
    return [
      {
        name: 'Desktop',
        value: data.desktop,
        percentage: total > 0 ? (data.desktop / total) * 100 : 0,
        color: DEVICE_COLORS.desktop,
      },
      {
        name: 'Mobile',
        value: data.mobile,
        percentage: total > 0 ? (data.mobile / total) * 100 : 0,
        color: DEVICE_COLORS.mobile,
      },
      {
        name: 'Tablet',
        value: data.tablet,
        percentage: total > 0 ? (data.tablet / total) * 100 : 0,
        color: DEVICE_COLORS.tablet,
      },
    ];
  }, [data]);

  const topBrowsers = useMemo(() => {
    return [...data.browsers].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [data.browsers]);

  const topOS = useMemo(() => {
    return [...data.operatingSystems].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [data.operatingSystems]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Device & Platform Stats</h3>

      {/* Device Types */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Device Types</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={deviceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
              formatter={(value: any, name: string, props: any) => [
                `${value.toLocaleString()} (${props.payload.percentage.toFixed(1)}%)`,
                'Views',
              ]}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {deviceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Browsers */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Top Browsers</h4>
          <div className="space-y-2">
            {topBrowsers.map((browser, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-xs font-bold text-gray-300">
                    {index + 1}
                  </div>
                  <span className="text-white font-medium">{browser.browser}</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{browser.count.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">{browser.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
            {topBrowsers.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No browser data yet</p>
            )}
          </div>
        </div>

        {/* Operating Systems */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Top Operating Systems</h4>
          <div className="space-y-2">
            {topOS.map((os, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-xs font-bold text-gray-300">
                    {index + 1}
                  </div>
                  <span className="text-white font-medium">{os.os}</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{os.count.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">{os.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
            {topOS.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No OS data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
