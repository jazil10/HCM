import type { LeaveBalance } from '../../types/leave';

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
}

export default function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
  const utilizationPercentage = balance.allocated > 0 
    ? Math.round((balance.used / balance.allocated) * 100) 
    : 0;

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600 bg-red-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: balance.leaveType.color }}
          />
          <h4 className="text-sm font-medium text-gray-900">
            {balance.leaveType.name}
          </h4>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getUtilizationColor(utilizationPercentage)}`}>
          {utilizationPercentage}% used
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Allocated:</span>
          <span className="font-medium text-gray-900">{balance.allocated} days</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Used:</span>
          <span className="font-medium text-red-600">{balance.used} days</span>
        </div>
        
        {balance.pending > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Pending:</span>
            <span className="font-medium text-yellow-600">{balance.pending} days</span>
          </div>
        )}
        
        {balance.carriedForward > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Carried Forward:</span>
            <span className="font-medium text-blue-600">{balance.carriedForward} days</span>
          </div>
        )}
        
        <div className="flex justify-between items-center text-sm border-t pt-2">
          <span className="text-gray-500">Available:</span>
          <span className="font-medium text-green-600">{balance.remaining} days</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Usage</span>
          <span>{balance.used}/{balance.allocated}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(utilizationPercentage, 100)}%`,
              backgroundColor: utilizationPercentage >= 80 ? '#DC2626' : 
                             utilizationPercentage >= 60 ? '#D97706' : '#059669'
            }}
          />
        </div>
      </div>
    </div>
  );
}
