'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DifficultyData {
  difficulty: string;
  count: number;
}

interface DifficultyChartProps {
  data: DifficultyData[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: '#10b981', // green
  INTERMEDIATE: '#3b82f6', // blue
  ADVANCED: '#f59e0b', // amber
  EXPERT: '#ef4444', // red
  ALL: '#6366f1', // indigo
};

export function DifficultyChart({ data }: DifficultyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Create pie chart
    const pie = d3
      .pie<DifficultyData>()
      .value((d) => d.count)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<DifficultyData>>()
      .innerRadius(radius * 0.5) // Donut chart
      .outerRadius(radius * 0.8);

    const outerArc = d3
      .arc<d3.PieArcDatum<DifficultyData>>()
      .innerRadius(radius * 0.8)
      .outerRadius(radius);

    // Draw slices
    const slices = svg
      .selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => DIFFICULTY_COLORS[d.data.difficulty] || '#6366f1')
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 2)
      .style('opacity', 0.9)
      .style('transition', 'all 0.3s ease');

    // Add hover effect
    slices
      .on('mouseenter', function () {
        d3.select(this).style('opacity', 1).attr('d', outerArc);
      })
      .on('mouseleave', function () {
        d3.select(this).style('opacity', 0.9).attr('d', arc);
      });

    // Add labels
    const labels = svg
      .selectAll('text')
      .data(pie(data))
      .enter()
      .append('text')
      .attr('transform', (d) => {
        const pos = arc.centroid(d);
        return `translate(${pos[0]},${pos[1]})`;
      })
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none');

    labels.append('tspan').text((d) => d.data.count).attr('x', 0).attr('dy', '0em');

    labels
      .append('tspan')
      .text((d) => `${((d.data.count / d3.sum(data, (d) => d.count)) * 100).toFixed(0)}%`)
      .attr('x', 0)
      .attr('dy', '1.2em')
      .style('font-size', '12px')
      .style('font-weight', 'normal')
      .attr('fill', '#d1d5db');
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No difficulty distribution data available
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wide">
        Content by Difficulty
      </h3>

      <div className="flex flex-col items-center">
        <svg ref={svgRef}></svg>

        {/* Legend */}
        <div className="mt-6 w-full space-y-2">
          {data.map((item) => (
            <div key={item.difficulty} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: DIFFICULTY_COLORS[item.difficulty] }}
                ></div>
                <span className="text-sm text-gray-300 capitalize">
                  {item.difficulty.toLowerCase()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white">{item.count}</span>
                <span className="text-xs text-gray-500 w-12 text-right">
                  {((item.count / total) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
