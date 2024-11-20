'use client';

import { useEffect, useState } from 'react';
import { ErrorLog } from '@/types/error';
import StatCard from '@/components/StatCard';
import ErrorCard from '@/components/ErrorCard';
import StatusIndicator from '@/components/StatusIndicator';
import AnalyticsChart from '@/components/AnalyticsChart';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const wsUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/status/ws`
    : '';
  const { data: wsData, error: wsError } = useWebSocket(wsUrl);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [analyticsRes, statusRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/status')
        ]);
        
        const [analyticsData, statusData] = await Promise.all([
          analyticsRes.json(),
          statusRes.json()
        ]);
        
        setAnalytics(analyticsData);
        setStatus(statusData);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (wsData) {
      setStatus(wsData);
    }
    if (wsError) {
      console.error('WebSocket error:', wsError);
    }
  }, [wsData, wsError]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">Newsletter Dashboard</h1>
        <StatusIndicator status={status?.systemHealth} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Subscribers"
          value={analytics?.mailchimp?.subscribers || 0}
          trend={analytics?.mailchimp?.subscriberTrend}
        />
        <StatCard
          title="Open Rate"
          value={`${(analytics?.mailchimp?.averageOpenRate || 0).toFixed(1)}%`}
        />
        <StatCard
          title="Newsletters Sent"
          value={analytics?.newsletters?.total || 0}
        />
        <StatCard
          title="System Health"
          value={status?.systemHealth}
          status={status?.systemHealth}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Service Status</h2>
          <div className="space-y-4">
            {Object.entries(status || {}).map(([key, value]) => (
              key !== 'systemHealth' && (
                <div key={key} className="flex justify-between items-center">
                  <span className="capitalize text-black">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <StatusIndicator status={value ? 'healthy' : 'critical'} />
                </div>
              )
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Recent Errors</h2>
          <div className="space-y-4">
            {analytics?.errors?.recent.map((error: ErrorLog) => (
              <ErrorCard key={error._id} error={error} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
