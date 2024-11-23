'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import MailchimpForm from '@/components/MailchimpForm';
import HomeNewsletterFeed from '@/components/HomeNewsletterFeed';
import { Newsletter } from '@/types/newsletter';

export default function Home() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);

  useEffect(() => {
    async function fetchNewsletters() {
      try {
        console.log('Fetching newsletters...');
        const response = await fetch('/api/newsletters');
        console.log('Newsletter response:', response);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Newsletter data:', data);
          setNewsletters(data);
        } else {
          console.error('Failed to fetch newsletters:', await response.text());
        }
      } catch (error) {
        console.error('Failed to fetch newsletters:', error);
      }
    }

    fetchNewsletters();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight text-black px-4 md:px-0 text-center md:text-left">
              Daily Bitcoin News.
              <br />
              Less Crypto Chaos.
            </h1>
            <p className="text-xl mb-8 text-black px-4 md:px-0 text-center md:text-left">
              A newsletter for serious Bitcoin investors.
            </p>
            <div className="px-4 md:px-0 flex justify-center md:justify-start">
              <MailchimpForm />
            </div>
          </div>
          
          <div className="flex-1 max-w-md">
            <Image
              src="/images/bitcoin_image.png"
              alt="Bitcoin Island Illustration"
              width={500}
              height={500}
              priority
              className="w-full h-auto"
            />
          </div>
        </div>
        
        {newsletters.length > 0 && <HomeNewsletterFeed newsletters={newsletters} />}
      </div>
    </div>
  );
}
