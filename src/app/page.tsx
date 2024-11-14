import Image from 'next/image';
import Header from '@/components/Header';
import MailchimpForm from '@/components/MailchimpForm';

export default function Home() {
  return (
    <div 
      className="flex flex-col"
      style={{
        background: 'radial-gradient(circle at top, #ffffff 0%, #fff3d6 50%, #ffd6a0 100%)'
      }}
    >
      <Header />
      <main className="flex-1 flex">
        <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight text-black px-4 md:px-0">
              Daily Bitcoin News.
              <br />
              Less Crypto Chaos.
            </h1>
            <p className="text-xl mb-8 text-black px-4 md:px-0">
              A newsletter for serious Bitcoin investors.
            </p>
            <div className="px-4 md:px-0">
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
      </main>
    </div>
  );
}
