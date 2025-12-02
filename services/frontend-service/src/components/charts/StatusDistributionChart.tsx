'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface StatusData {
  name: string;
  count: number;
  color: string;
}

interface StatusDistributionChartProps {
  data: StatusData[];
  height?: number;
}

// Status colors matching IAK design
const STATUS_COLORS: Record<string, string> = {
  'Draft': '#9ca3af',
  'Submitted': '#60a5fa',
  'Pending': '#fbbf24',
  'In Progress': '#3b82f6',
  'Resolved': '#34d399',
  'Completed': '#22c55e',
  'Closed': '#6b7280',
  'Rejected': '#ef4444',
};

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  data = [],
  height = 300
}) => {
  const chartData = data.length > 0 ? data : [
    { name: 'Submitted', count: 5, color: STATUS_COLORS['Submitted'] },
    { name: 'Pending', count: 3, color: STATUS_COLORS['Pending'] },
    { name: 'In Progress', count: 8, color: STATUS_COLORS['In Progress'] },
    { name: 'Resolved', count: 12, color: STATUS_COLORS['Resolved'] },
    { name: 'Completed', count: 10, color: STATUS_COLORS['Completed'] },
  ];

  return (
    <Card className="rounded-xl bg-white shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold" style={{ color: '#274c77' }}>
          Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              stroke="#8b8c89"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#8b8c89"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar 
              dataKey="count" 
              fill="#365486"
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

