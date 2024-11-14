'use client';

import { useState } from 'react';

export default function UnsubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Processing...');
    
    try {
      console.log('Submitting unsubscribe request for:', email);
      
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      console.log('Response:', data);
      
      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setStatus('error');
      setMessage('Error processing your request. Please try again.');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-black"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Unsubscribe
        </button>
        {status === 'success' && (
          <p className="text-green-600 text-center">{message}</p>
        )}
        {status === 'error' && (
          <p className="text-red-600 text-center">{message}</p>
        )}
        {status === 'Processing...' && (
          <p className="text-gray-600 text-center">{status}</p>
        )}
      </form>
    </div>
  );
}