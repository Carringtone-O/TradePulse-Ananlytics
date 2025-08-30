import React from 'react';
import { type TimePerformanceData } from '../types';

interface TimePerformanceHeatmapProps {
  data: TimePerformanceData;
}

const TimePerformanceHeatmap: React.FC<TimePerformanceHeatmapProps> = ({ data }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Display hours in 4-hour blocks for a cleaner UI
  const hourBlocks = Array.from({ length: 6 }, (_, i) => i * 4); // 0, 4, 8, 12, 16, 20

  const aggregatedData = days.map(day => {
    return hourBlocks.map(startHour => {
      let profit = 0;
      let trades = 0;
      for (let i = 0; i < 4; i++) {
        const hourData = data[day]?.[startHour + i];
        if (hourData) {
          profit += hourData.profit;
          trades += hourData.trades;
        }
      }
      return { profit, trades };
    });
  });

  const allProfits = aggregatedData.flat().map(d => d.profit);
  const maxProfit = Math.max(...allProfits.filter(p => p > 0), 0.01);
  const minProfit = Math.min(...allProfits.filter(p => p < 0), -0.01);

  const getBackgroundColor = (profit: number): string => {
    if (profit > 0) {
      const intensity = Math.sqrt(profit / maxProfit);
      const opacity = Math.round(15 + intensity * 85);
      return `bg-emerald-500/${opacity}`;
    }
    if (profit < 0) {
      const intensity = Math.sqrt(profit / minProfit);
      const opacity = Math.round(15 + intensity * 85);
      return `bg-rose-500/${opacity}`;
    }
    return 'bg-slate-100';
  };
  
  const formatHour = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-center text-xs">
        <thead>
          <tr>
            <th className="p-2 font-medium text-slate-500"></th>
            {hourBlocks.map(hour => (
              <th key={hour} className="p-2 font-medium text-slate-500 w-1/6">{`${formatHour(hour)}`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dayIndex) => (
            <tr key={day}>
              <td className="p-2 font-semibold text-slate-700">{day}</td>
              {aggregatedData[dayIndex].map((blockData, blockIndex) => {
                const textColor = blockData.profit === 0 ? 'text-slate-500' : 'text-white';
                return(
                <td key={blockIndex} className="p-1">
                  <div
                    className={`w-full h-12 rounded-md flex items-center justify-center font-bold transition-colors duration-300 ${getBackgroundColor(blockData.profit)} ${textColor}`}
                    title={`Profit: $${blockData.profit.toFixed(2)}\nTrades: ${blockData.trades}`}
                  >
                    {blockData.trades > 0 ? `$${Math.round(blockData.profit)}` : ''}
                  </div>
                </td>
              )})}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimePerformanceHeatmap;