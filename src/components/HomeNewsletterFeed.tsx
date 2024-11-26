import { Newsletter } from '@/types/newsletter';
import Link from 'next/link';

interface Props {
  newsletters: Newsletter[];
}

export default function HomeNewsletterFeed({ newsletters }: Props) {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-black mb-6 text-center">Recent Newsletters</h2>
      <div className="space-y-6">
        {newsletters.slice(0, 3).map((newsletter) => (
          <Link 
            href={`/newsletters/${newsletter.id}`}
            key={newsletter.id}
            className="block cursor-pointer bg-gradient-to-br from-[#ffe4bc] to-[#ffc49d] hover:from-[#ffd6a0] hover:to-[#ffb183] p-6 rounded-xl transition-all duration-200 ease-in-out shadow-sm hover:shadow-inner"
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
      <div className="mt-8 text-center">
        <Link
          href="/newsletters"
          className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          View All Newsletters
        </Link>
      </div>
    </div>
  );
}
