
import React from 'react';
import { type HeatmapData } from '../types';

interface PerformanceHeatmapProps {
  data: HeatmapData;
}

const PerformanceHeatmap: React.FC<PerformanceHeatmapProps> = ({ data }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const profits = Object.values(data).map(d => d.profit);
  // Add a small non-zero value to prevent division by zero if no wins/losses exist.
  const maxProfit = Math.max(...profits.filter(p => p > 0), 0.01);
  const minProfit = Math.min(...profits.filter(p => p < 0), -0.01);

  const getBackgroundColor = (profit: number): string => {
    if (profit > 0) {
      const intensity = Math.sqrt(profit / maxProfit);
      const opacity = Math.round(20 + intensity * 80);
      return `bg-emerald-500/${opacity}`;
    }
    if (profit < 0) {
      const intensity = Math.sqrt(profit / minProfit);
      const opacity = Math.round(20 + intensity * 80);
      return `bg-rose-500/${opacity}`;
    }
    return 'bg-slate-200'; // Neutral color for zero profit
  };

  return (
    <div className="space-y-4">
      {days.map((day, index) => {
        const dayData = data[index] || { trades: 0, profit: 0 };
        const textColor = dayData.profit === 0 ? 'text-slate-700' : 'text-white';
        const tradesColor = dayData.profit === 0 ? 'text-slate-500' : 'text-slate-100';
        return (
          <div key={day} className="flex items-center space-x-2">
            <span className="w-10 text-sm font-medium text-slate-500">{day}</span>
            <div
              className={`w-full h-10 rounded-md flex items-center justify-between px-3 transition-colors duration-300 ${getBackgroundColor(dayData.profit)}`}
              title={`Profit: $${dayData.profit.toFixed(2)} | Trades: ${dayData.trades}`}
            >
              <span className={`font-bold text-sm ${textColor}`}>${dayData.profit.toFixed(2)}</span>
              <span className={`text-xs ${tradesColor}`}>{dayData.trades} trades</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PerformanceHeatmap;