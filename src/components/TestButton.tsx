'use client';

export default function TestButton() {
  const handleClick = async () => {
    try {
      const response = await fetch('/api/test/seed', { method: 'POST' });
      const data = await response.json();
      console.log('Seed result:', data);
      // Reload the page to show new newsletters
      window.location.reload();
    } catch (error) {
      console.error('Failed to seed:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
    >
      Generate Test Newsletters
    </button>
  );
}
