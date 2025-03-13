'use client';

import { useEffect, useState } from 'react';
import NewsletterFeed from '@/components/NewsletterFeed';
import { Newsletter } from '@/types/newsletter';

export default function NewslettersPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNewsletters() {
      console.log('Starting newsletter fetch...');
      
      try {
        const response = await fetch('/api/newsletters');
        console.log('API Response:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to fetch newsletters: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Newsletters received:', data);
        
        if (!Array.isArray(data)) {
          console.error('Invalid data format:', data);
          throw new Error('Invalid data format received from server');
        }
        
        setNewsletters(data);
      } catch (err: any) {
        console.error('Newsletter fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNewsletters();
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-[#ffe4bc] to-[#ffc49d] -z-10" />
      <div className="relative min-h-screen">
        <main className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center mb-12 text-[#f97316]">Newsletter Archive</h1>
          
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">
              <p className="text-xl font-semibold mb-2">Error Loading Newsletters</p>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : newsletters.length === 0 ? (
            <div className="text-center text-gray-600 py-12">
              <p>No newsletters found</p>
            </div>
          ) : (
            <NewsletterFeed newsletters={newsletters} />
          )}
        </main>
      </div>
    </>
  );
}