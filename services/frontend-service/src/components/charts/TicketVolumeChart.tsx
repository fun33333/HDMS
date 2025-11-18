'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { THEME } from '../../lib/theme';

interface TicketVolumeData {
  date: string;
  created: number;
  resolved: number;
}

interface TicketVolumeChartProps {
  data?: TicketVolumeData[];
  height?: number;
}

export const TicketVolumeChart: React.FC<TicketVolumeChartProps> = ({ 
  data = [], 
  height = 300 
}) => {
  const chartData = data.length > 0 ? data : [
    { date: 'Week 1', created: 45, resolved: 38 },
    { date: 'Week 2', created: 52, resolved: 45 },
    { date: 'Week 3', created: 48, resolved: 42 },
    { date: 'Week 4', created: 55, resolved: 50 },
    { date: 'Week 5', created: 50, resolved: 48 },
    { date: 'Week 6', created: 58, resolved: 52 },
  ];

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={THEME.colors.primary} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={THEME.colors.primary} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={THEME.colors.success} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={THEME.colors.success} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={THEME.colors.medium} opacity={0.3} />
          <XAxis 
            dataKey="date" 
            stroke={THEME.colors.gray}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke={THEME.colors.gray}
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: THEME.colors.white,
              border: `1px solid ${THEME.colors.medium}`,
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="created" 
            stroke={THEME.colors.primary} 
            fillOpacity={1}
            fill="url(#colorCreated)"
            name="Created"
          />
          <Area 
            type="monotone" 
            dataKey="resolved" 
            stroke={THEME.colors.success} 
            fillOpacity={1}
            fill="url(#colorResolved)"
            name="Resolved"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

