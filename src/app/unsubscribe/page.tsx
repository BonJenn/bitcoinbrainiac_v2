export default function UnsubscribePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Unsubscribe from Newsletter</h1>
      <p className="text-gray-600 text-center mb-8">
        We're sorry to see you go. Enter your email address below to unsubscribe from our newsletter.
      </p>
      <UnsubscribeForm />
    </div>
  );
}
