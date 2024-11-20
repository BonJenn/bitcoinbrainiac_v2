import { useMemo } from 'react';

interface StatusIndicatorProps {
  status: 'healthy' | 'degraded' | 'critical' | boolean;
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const { color, text } = useMemo(() => {
    if (typeof status === 'boolean') {
      return status ? 
        { color: 'bg-green-500', text: 'Healthy' } : 
        { color: 'bg-red-500', text: 'Down' };
    }
    
    switch (status) {
      case 'healthy':
        return { color: 'bg-green-500', text: 'Healthy' };
      case 'degraded':
        return { color: 'bg-yellow-500', text: 'Degraded' };
      case 'critical':
        return { color: 'bg-red-500', text: 'Critical' };
      default:
        return { color: 'bg-gray-500', text: 'Unknown' };
    }
  }, [status]);

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-sm font-medium text-black">{text}</span>
    </div>
  );
}
