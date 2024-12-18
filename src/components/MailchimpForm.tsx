'use client';

import { useState } from 'react';

export default function MailchimpForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Subscribing...');
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error);
        if (data.error.includes('already subscribed')) {
          setEmail('');
        }
      }
    } catch (error) {
      setStatus('Error subscribing. Please try again.');
    }
  };

  const SuccessMessage = () => (
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-green-800 font-semibold mb-2">Almost there!</h3>
      <p className="text-green-700">
        We've sent you a confirmation email. Please click the link in the email to complete your subscription.
      </p>
      <p className="text-green-600 text-sm mt-2">
        (Don't forget to check your spam folder if you don't see it)
      </p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-black placeholder:text-gray-400 bg-white"
          required
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Subscribe
        </button>
      </div>
      {status && <p className="mt-2 text-sm text-center text-black">{status}</p>}
      {message && <p className="mt-2 text-sm text-center text-black">{message}</p>}
      {status === 'success' && <SuccessMessage />}
    </form>
  );
}
