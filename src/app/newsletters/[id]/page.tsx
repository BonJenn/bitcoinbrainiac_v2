'use client';

import { useEffect, useState } from 'react';
import { Newsletter } from '@/types/newsletter';
import NewsletterView from '@/components/NewsletterView';
import { use } from 'react';

export default function NewsletterPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNewsletter() {
      try {
        const response = await fetch(`/api/newsletters/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch newsletter');
        }
        const data = await response.json();
        setNewsletter(data);
      } catch (err) {
        setError('Failed to load newsletter');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchNewsletter();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !newsletter) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Newsletter not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <NewsletterView newsletter={newsletter} />
      </div>
    </div>
  );
}
