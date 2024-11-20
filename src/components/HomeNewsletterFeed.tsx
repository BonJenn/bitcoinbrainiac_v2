import { Newsletter } from '@/types/newsletter';
import Link from 'next/link';

interface Props {
  newsletters: Newsletter[];
}

export default function HomeNewsletterFeed({ newsletters }: Props) {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="space-y-6">
        {newsletters.slice(0, 3).map((newsletter) => (
          <Link 
            href={`/newsletters/${newsletter.id}`}
            key={newsletter.id}
            className="block cursor-pointer border-b border-gray-100 pb-6 hover:bg-gray-50/50 p-6 rounded-xl transition-all duration-200 ease-in-out"
            style={{
              background: 'linear-gradient(to right, rgba(255,255,255,0.8), rgba(255,243,214,0.3))'
            }}
          >
            <h3 className="text-xl font-bold mb-2 text-gray-900">{newsletter.title}</h3>
            <p className="text-gray-700 mb-3">{newsletter.subtitle}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{new Date(newsletter.sentAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric'
              })}</span>
              <span className={newsletter.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                Bitcoin: ${newsletter.bitcoinPrice.toLocaleString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
