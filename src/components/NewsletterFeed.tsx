import { useState } from 'react';
import { Newsletter } from '@/types/newsletter';
import NewsletterView from './NewsletterView';

interface Props {
  newsletters: Newsletter[];
}

export default function NewsletterFeed({ newsletters }: Props) {
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {selectedNewsletter ? (
        <div className="mb-8">
          <button 
            onClick={() => setSelectedNewsletter(null)}
            className="mb-6 text-blue-500 hover:text-blue-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to archive
          </button>
          <NewsletterView newsletter={selectedNewsletter} />
        </div>
      ) : (
        <div className="space-y-6">
          {newsletters.map((newsletter) => (
            <div 
              key={newsletter.id}
              onClick={() => setSelectedNewsletter(newsletter)}
              className="cursor-pointer border-b border-gray-100 pb-6 hover:bg-gray-50/50 p-6 rounded-xl transition-all duration-200 ease-in-out"
              style={{
                background: 'linear-gradient(to right, rgba(255,255,255,0.8), rgba(255,243,214,0.3))'
              }}
            >
              <h2 className="text-2xl font-bold mb-2 text-gray-900">{newsletter.title}</h2>
              <h3 className="text-lg text-gray-700 mb-3">{newsletter.subtitle}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{new Date(newsletter.sentAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
                <span className={newsletter.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  Bitcoin: ${newsletter.bitcoinPrice.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}