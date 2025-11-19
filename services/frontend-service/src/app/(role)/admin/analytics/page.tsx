'use client';

import React, { useEffect, useState } from 'react';
import { DepartmentLoadChart } from '../../../../components/charts/DepartmentLoadChart';
import { PriorityTrendChart } from '../../../../components/charts/PriorityTrendChart';
import { TicketVolumeChart } from '../../../../components/charts/TicketVolumeChart';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { SkeletonLoader } from '../../../../components/ui/SkeletonLoader';
import { THEME } from '../../../../lib/theme';
import { AlertCircle, X } from 'lucide-react';

interface AnalyticsData {
  departmentLoad: Array<{
    department: string;
    assigned: number;
    completed: number;
    pending: number;
  }>;
  priorityTrend: Array<{
    date: string;
    low: number;
    medium: number;
    high: number;
    urgent: number;
  }>;
  ticketVolume: Array<{
    date: string;
    created: number;
    resolved: number;
  }>;
}

const mockData: AnalyticsData = {
  departmentLoad: [
    { department: 'IT', assigned: 12, completed: 8, pending: 4 },
    { department: 'HR', assigned: 8, completed: 6, pending: 2 },
    { department: 'Finance', assigned: 15, completed: 10, pending: 5 },
    { department: 'Operations', assigned: 10, completed: 7, pending: 3 },
  ],
  priorityTrend: [
    { date: 'Jan', low: 5, medium: 8, high: 3, urgent: 1 },
    { date: 'Feb', low: 7, medium: 10, high: 4, urgent: 2 },
    { date: 'Mar', low: 6, medium: 9, high: 5, urgent: 1 },
    { date: 'Apr', low: 8, medium: 12, high: 6, urgent: 2 },
    { date: 'May', low: 9, medium: 11, high: 7, urgent: 3 },
    { date: 'Jun', low: 7, medium: 13, high: 5, urgent: 2 },
  ],
  ticketVolume: [
    { date: 'Week 1', created: 45, resolved: 38 },
    { date: 'Week 2', created: 52, resolved: 45 },
    { date: 'Week 3', created: 48, resolved: 42 },
    { date: 'Week 4', created: 55, resolved: 50 },
    { date: 'Week 5', created: 50, resolved: 48 },
    { date: 'Week 6', created: 58, resolved: 52 },
  ],
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchAnalytics = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);
        
        // Wrap fetch in Promise to handle errors more safely
        const fetchResult = await Promise.resolve(
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/analytics/`,
            {
              headers: {
                'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
              },
            }
          )
        ).catch((fetchError: any) => {
          // Return error object instead of throwing
          return { error: fetchError };
        });

        if (!isMounted) return;

        // Check if fetch returned an error
        if ('error' in fetchResult) {
          const fetchError = fetchResult.error;
          console.warn('Network error, using mock data:', fetchError);
          if (isMounted) {
            setError('Network error. Showing mock data.');
            setData(mockData);
            setLoading(false);
          }
          return;
        }

        const response = fetchResult;

        if (response.ok) {
          try {
            const analyticsData = await response.json();
            if (!isMounted) return;
            setData(analyticsData);
          } catch (jsonError: any) {
            console.warn('Error parsing JSON, using mock data:', jsonError);
            if (!isMounted) return;
            setError('Error parsing response. Showing mock data.');
            setData(mockData);
          }
        } else {
          // Use mock data if API returns error
          console.warn('API returned error, using mock data');
          if (!isMounted) return;
          setData(mockData);
        }
      } catch (error: any) {
        console.error('Error fetching analytics:', error);
        if (!isMounted) return;
        
        // Handle network errors gracefully - use mock data
        if (error?.message === 'Failed to fetch' || error?.name === 'TypeError') {
          console.warn('Network error, using mock data');
          setError('Network error. Showing mock data.');
          setData(mockData);
        } else {
          setError('Failed to load analytics data. Showing mock data.');
          setData(mockData);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Wrap fetchAnalytics to catch any errors that might escape
    const safeFetchAnalytics = async () => {
      try {
        await fetchAnalytics();
      } catch (error: any) {
        console.error('Error in fetchAnalytics wrapper:', error);
        if (isMounted) {
          setError('An error occurred while loading data. Showing mock data.');
          setLoading(false);
          setData(mockData);
        }
      }
    };
    
    // Call and ensure promise is handled to prevent unhandled rejection
    const promise = safeFetchAnalytics();
    promise.catch((error: any) => {
      console.error('Unhandled promise rejection caught:', error);
      if (isMounted) {
        setError('An error occurred while loading data. Showing mock data.');
        setLoading(false);
        setData(mockData);
      }
    });
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <SkeletonLoader type="text" width="200px" height="32px" className="mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader type="card" height="300px" />
          <SkeletonLoader type="card" height="300px" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: THEME.colors.primary }}>
          Analytics Dashboard
        </h1>
        <p className="text-base text-gray-600">
          Comprehensive insights into ticket management and system performance
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Load Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
              Department Load Distribution
            </h3>
          </CardHeader>
          <CardContent>
            <DepartmentLoadChart 
              data={data?.departmentLoad} 
              height={300}
            />
          </CardContent>
        </Card>

        {/* Priority Trend Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
              Priority Trends Over Time
            </h3>
          </CardHeader>
          <CardContent>
            <PriorityTrendChart 
              data={data?.priorityTrend} 
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Ticket Volume Chart - Full Width */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
            Ticket Volume Analysis
          </h3>
        </CardHeader>
        <CardContent>
          <TicketVolumeChart 
            data={data?.ticketVolume} 
            height={350}
          />
        </CardContent>
      </Card>
    </div>
  );
}

