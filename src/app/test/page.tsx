export default function TestPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          Tailwind Test Page
        </h1>
        <p className="text-gray-600">
          If you can see this text in gray with a white background card and blue heading, 
          Tailwind is working.
        </p>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Test Button
        </button>
      </div>
    </div>
  );
} 