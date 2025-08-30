import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  isProfit?: boolean;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, isProfit, icon }) => {
  const valueColor = isProfit === undefined ? 'text-slate-900' : isProfit ? 'text-emerald-500' : 'text-rose-500';
  
  return (
    <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 flex items-start space-x-4">
      <div className="bg-slate-100 p-3 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
};

export default MetricCard;