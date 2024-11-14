import Header from '@/components/Header';
import UnsubscribeForm from '@/components/UnsubscribeForm';

export default function UnsubscribePage() {
  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'radial-gradient(circle at top, #ffffff 0%, #fff3d6 50%, #ffd6a0 100%)'
      }}
    >
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4 text-black">Unsubscribe from Newsletter</h1>
          <p className="text-gray-600 mb-8">
            We're sorry to see you go. Enter your email address below to unsubscribe from our newsletter.
          </p>
          <UnsubscribeForm />
        </div>
      </main>
    </div>
  );
}
