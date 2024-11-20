import { ErrorLog } from '@/types/error';

interface ErrorCardProps {
  error: ErrorLog;
}

export default function ErrorCard({ error }: ErrorCardProps) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-black font-medium">{error.context}</p>
          <p className="text-black mt-1">{error.error}</p>
        </div>
        <span className="text-black text-sm">
          {new Date(error.timestamp).toLocaleString()}
        </span>
      </div>
      {error.metadata && (
        <div className="mt-2">
          <pre className="text-sm text-black overflow-x-auto">
            {error.metadata}
          </pre>
        </div>
      )}
    </div>
  );
}
