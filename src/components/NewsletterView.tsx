import { Newsletter } from '@/types/newsletter';

interface Props {
  newsletter: Newsletter;
}

export default function NewsletterView({ newsletter }: Props) {
  return (
    <article className="bg-white rounded-xl shadow-sm p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{newsletter.title}</h1>
        <h2 className="text-xl text-gray-700 mb-4">{newsletter.subtitle}</h2>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <time dateTime={new Date(newsletter.sentAt).toISOString()}>
            {new Date(newsletter.sentAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          <span className={newsletter.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}>
            Bitcoin: ${newsletter.bitcoinPrice.toLocaleString()}
          </span>
        </div>
      </header>
      
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: newsletter.content }}
      />
    </article>
  );
}