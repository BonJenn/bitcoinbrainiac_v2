'use client';

import { useState } from 'react';

export default function MailchimpForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

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
        setStatus('Successfully subscribed!');
        setEmail('');
      } else {
        setStatus(`Error: ${data.error}`);
        if (data.error.includes('already subscribed')) {
          setEmail('');
        }
      }
    } catch (error) {
      setStatus('Error subscribing. Please try again.');
    }
  };

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
      {status === 'success' && (
        <p className="text-black font-bold mt-4">
          Thanks for subscribing! You will now receive daily Bitcoin updates. Unsubscribe anytime.
        </p>
      )}
    </form>
  );
}
