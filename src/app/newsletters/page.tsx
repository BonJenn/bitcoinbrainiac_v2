'use client';

import { useEffect, useState } from 'react';
import NewsletterFeed from '@/components/NewsletterFeed';
import { Newsletter } from '@/types/newsletter';
import Header from '@/components/Header';

export default function NewslettersPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNewsletters() {
      try {
        const response = await fetch('/api/newsletters');
        if (!response.ok) throw new Error('Failed to fetch newsletters');
        const data = await response.json();
        setNewsletters(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNewsletters();
  }, []);

  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'radial-gradient(circle at top, #ffffff 0%, #fff3d6 50%, #ffd6a0 100%)'
      }}
    >
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">Newsletter Archive</h1>
        
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">
            <p className="text-xl font-semibold mb-2">Oops! Something went wrong</p>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : (
          <NewsletterFeed newsletters={newsletters} />
        )}
      </main>
    </div>
  );
}