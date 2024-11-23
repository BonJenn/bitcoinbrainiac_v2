import { useState } from 'react';
import { Newsletter } from '@/types/newsletter';
import NewsletterView from './NewsletterView';

interface Props {
  newsletters: Newsletter[];
}

export default function NewsletterFeed({ newsletters }: Props) {
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNewsletterClick = async (newsletter: Newsletter) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/newsletters/${newsletter.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch newsletter');
      }
      const fullNewsletter = await response.json();
      setSelectedNewsletter(fullNewsletter);
    } catch (err) {
      setError('Failed to load newsletter');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">
          <p>{error}</p>
        </div>
      ) : selectedNewsletter ? (
        <div className="mb-8">
          <button 
            onClick={() => setSelectedNewsletter(null)}
            className="mb-6 text-blue-500 hover:text-blue-700 flex items-center gap-2 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to archive
          </button>
          <NewsletterView newsletter={selectedNewsletter} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {newsletters.map((newsletter) => (
            <div 
              key={newsletter.id}
              onClick={() => handleNewsletterClick(newsletter)}
              className="group cursor-pointer rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div 
                className="p-6 relative bg-gradient-to-br from-[#f6d365] to-[#fda085] group-hover:bg-white transition-all duration-300"
              >
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-2 text-gray-900">
                    {newsletter.title}
                  </h2>
                  <h3 className="text-lg text-gray-800 mb-4 opacity-90">
                    {newsletter.subtitle}
                  </h3>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="bg-white/30 px-3 py-1 rounded-full text-gray-800 group-hover:bg-gray-100">
                      {new Date(newsletter.sentAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className={`px-3 py-1 rounded-full ${
                      newsletter.priceChange >= 0 
                        ? 'bg-green-500/20 text-green-800' 
                        : 'bg-red-500/20 text-red-800'
                    }`}>
                      Bitcoin: ${newsletter.bitcoinPrice.toLocaleString()}
                      <span className="ml-1">
                        ({newsletter.priceChange >= 0 ? '+' : ''}{newsletter.priceChange}%)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}