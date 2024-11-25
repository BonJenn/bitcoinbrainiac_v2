import { useState, useEffect } from 'react';
import { Newsletter } from '@/types/newsletter';
import NewsletterView from './NewsletterView';

interface Props {
  newsletters: Newsletter[];
}

interface GroupedNewsletters {
  [year: string]: {
    [month: string]: Newsletter[];
  };
}

export default function NewsletterFeed({ newsletters: initialNewsletters }: Props) {
  const [newsletters, setNewsletters] = useState<Newsletter[]>(initialNewsletters);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add polling for new newsletters
  useEffect(() => {
    const pollInterval = 5 * 60 * 1000; // Poll every 5 minutes
    
    const fetchLatestNewsletters = async () => {
      try {
        const response = await fetch('/api/newsletters');
        if (!response.ok) {
          throw new Error('Failed to fetch newsletters');
        }
        const latestNewsletters = await response.json();
        setNewsletters(latestNewsletters);
      } catch (err) {
        console.error('Failed to poll newsletters:', err);
      }
    };

    const intervalId = setInterval(fetchLatestNewsletters, pollInterval);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Group newsletters by year and month
  const groupedNewsletters = newsletters.reduce((acc: GroupedNewsletters, newsletter) => {
    const date = new Date(newsletter.sentAt);
    const year = date.getFullYear().toString();
    const month = date.toLocaleString('default', { month: 'long' });
    
    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][month]) {
      acc[year][month] = [];
    }
    acc[year][month].push(newsletter);
    return acc;
  }, {});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

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

  if (selectedNewsletter) {
    return (
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
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {Object.entries(groupedNewsletters).reverse().map(([year, months]) => (
        <div key={year} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection(`year-${year}`)}
            className="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
          >
            <h2 className="text-xl font-semibold">{year}</h2>
            <svg
              className={`w-6 h-6 transform transition-transform ${
                expandedSections[`year-${year}`] ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections[`year-${year}`] && (
            <div className="space-y-2 p-4">
              {Object.entries(months).reverse().map(([month, monthNewsletters]) => (
                <div key={`${year}-${month}`} className="border rounded-lg">
                  <button
                    onClick={() => toggleSection(`${year}-${month}`)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                  >
                    <h3 className="text-lg font-medium">{month}</h3>
                    <svg
                      className={`w-5 h-5 transform transition-transform ${
                        expandedSections[`${year}-${month}`] ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {expandedSections[`${year}-${month}`] && (
                    <div className="divide-y">
                      {monthNewsletters.map((newsletter) => (
                        <div
                          key={newsletter.id}
                          onClick={() => handleNewsletterClick(newsletter)}
                          className="p-4 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{newsletter.title}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(newsletter.sentAt).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              newsletter.priceChange >= 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              ${newsletter.bitcoinPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}