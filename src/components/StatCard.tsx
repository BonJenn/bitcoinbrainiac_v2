interface StatCardProps {
  title: string;
  value: string | number;
  status?: 'success' | 'error' | 'warning';
  trend?: number;
}

export default function StatCard({ title, value, status, trend }: StatCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      default: return 'text-black';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-black text-sm font-medium">{title}</h3>
      <p className={`text-2xl font-bold mt-2 ${getStatusColor()}`}>{value}</p>
      {trend !== undefined && (
        <p className={`text-sm mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </p>
      )}
    </div>
  );
}
