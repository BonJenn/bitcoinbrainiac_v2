import { Suspense } from 'react';
import { headers } from 'next/headers';

async function fetchAnalytics() {
  const headersList = headers();
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/analytics`, {
    headers: {
      'Content-Type': 'application/json',
      // Add any other required headers
    },
    next: { revalidate: 3600 }
  });
  return response.json();
}

export default async function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Newsletter Dashboard</h1>
      
      <Suspense fallback={<div>Loading analytics...</div>}>
        <AnalyticsDisplay />
      </Suspense>
    </div>
  );
}

async function AnalyticsDisplay() {
  const analytics = await fetchAnalytics();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Campaign Performance</h2>
        {/* Add campaign metrics visualization */}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Subscriber Growth</h2>
        {/* Add subscriber growth visualization */}
      </div>
    </div>
  );
}
