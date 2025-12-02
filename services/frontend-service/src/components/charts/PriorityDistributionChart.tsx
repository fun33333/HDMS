'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface PriorityData {
  name: string;
  value: number;
  color: string;
}

interface PriorityDistributionChartProps {
  data: PriorityData[];
  height?: number;
}

// IAK Chart Colors
const CHART_COLORS = {
  high: '#f87171',    // Red
  medium: '#fbbf24',  // Yellow
  low: '#34d399',     // Green
};

export const PriorityDistributionChart: React.FC<PriorityDistributionChartProps> = ({
  data = [],
  height = 300
}) => {
  const chartData = data.length > 0 ? data : [
    { name: 'High', value: 5, color: CHART_COLORS.high },
    { name: 'Medium', value: 12, color: CHART_COLORS.medium },
    { name: 'Low', value: 8, color: CHART_COLORS.low },
  ];

  return (
    <Card className="rounded-xl bg-white shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold" style={{ color: '#274c77' }}>
          Priority Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
