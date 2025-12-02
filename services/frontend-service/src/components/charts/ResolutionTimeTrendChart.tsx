'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ResolutionTimeData {
  date: string;
  averageDays: number;
}

interface ResolutionTimeTrendChartProps {
  data: ResolutionTimeData[];
  height?: number;
}

export const ResolutionTimeTrendChart: React.FC<ResolutionTimeTrendChartProps> = ({
  data = [],
  height = 300
}) => {
  // Generate last 30 days data if not provided
  const generateLast30DaysData = (): ResolutionTimeData[] => {
    const days: ResolutionTimeData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Simulate realistic resolution time data
      const baseTime = 3.5;
      const variation = (Math.random() - 0.5) * 2;
      const averageDays = Math.max(0.5, Math.min(7, baseTime + variation));
      
      days.push({
        date: dateStr,
        averageDays: Math.round(averageDays * 10) / 10,
      });
    }
    
    return days;
  };

  const chartData = data.length > 0 ? data : generateLast30DaysData();

  return (
    <Card className="rounded-xl bg-white shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold" style={{ color: '#274c77' }}>
          Resolution Time Trend (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#8b8c89"
              style={{ fontSize: '11px' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#8b8c89"
              style={{ fontSize: '12px' }}
              label={{ value: 'Days', angle: -90, position: 'insideLeft', style: { fill: '#8b8c89' } }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value} days`, 'Average']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="averageDays" 
              stroke="#365486"
              strokeWidth={2}
              dot={{ fill: '#365486', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
