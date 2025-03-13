import UnsubscribeForm from '@/components/UnsubscribeForm';

export default function UnsubscribePage() {
  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-[#ffe4bc] to-[#ffc49d] -z-10" />
      <div className="relative min-h-screen">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <h1 className="text-3xl font-bold text-[#f97316] text-center mb-8">Unsubscribe from Newsletter</h1>
          <p className="text-[#c2410c] text-center mb-8">
            We're sorry to see you go. Enter your email address below to unsubscribe from our newsletter.
          </p>
          <UnsubscribeForm />
        </div>
      </div>
    </>
  );
}
