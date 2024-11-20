import { Newsletter } from '@/types/newsletter';

interface Props {
  newsletter: Newsletter;
}

export default function NewsletterView({ newsletter }: Props) {
  const priceColor = newsletter.priceChange >= 0 ? 'text-green-600' : 'text-red-600';
  
  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{newsletter.title}</h1>
        <h2 className="text-xl text-gray-700 mb-6">{newsletter.subtitle}</h2>
        
        <div className="flex items-center gap-4 mb-8 text-sm">
          <span className="text-gray-500">{new Date(newsletter.sentAt).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
          <span className={`${priceColor} font-semibold`}>
            Bitcoin: ${newsletter.bitcoinPrice.toLocaleString()} 
            ({newsletter.priceChange >= 0 ? '+' : ''}{newsletter.priceChange.toFixed(2)}%)
          </span>
        </div>
        
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: newsletter.content.replace(
              /\*\*(.*?)\*\*/g, 
              '<strong class="text-gray-900">$1</strong>'
            )
          }}
        />
      </div>
    </div>
  );
}