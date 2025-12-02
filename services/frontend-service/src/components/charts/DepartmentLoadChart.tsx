'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { THEME } from '../../lib/theme';

interface DepartmentLoadData {
  department: string;
  assigned: number;
  completed: number;
  pending: number;
}

interface DepartmentLoadChartProps {
  data?: DepartmentLoadData[];
  height?: number;
}

export const DepartmentLoadChart: React.FC<DepartmentLoadChartProps> = ({ 
  data = [], 
  height = 300 
}) => {
  const chartData = data.length > 0 ? data : [
    { department: 'Development', assigned: 8, completed: 5, pending: 3 },
    { department: 'Finance & Accounts', assigned: 6, completed: 4, pending: 2 },
    { department: 'Procurement', assigned: 5, completed: 3, pending: 2 },
    { department: 'Basic Maintenance', assigned: 10, completed: 7, pending: 3 },
    { department: 'IT', assigned: 12, completed: 8, pending: 4 },
    { department: 'Architecture', assigned: 4, completed: 3, pending: 1 },
    { department: 'Administration', assigned: 3, completed: 2, pending: 1 },
  ];

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={THEME.colors.medium} opacity={0.3} />
          <XAxis 
            dataKey="department" 
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
          <Bar 
            dataKey="assigned" 
            fill={THEME.colors.primary} 
            name="Assigned"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="completed" 
            fill={THEME.colors.success} 
            name="Completed"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="pending" 
            fill={THEME.colors.warning} 
            name="Pending"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

