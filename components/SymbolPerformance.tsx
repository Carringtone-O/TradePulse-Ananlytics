import React from 'react';
import { type SymbolPerformanceData } from '../types';

interface SymbolPerformanceProps {
  data: SymbolPerformanceData[];
}

const SymbolPerformance: React.FC<SymbolPerformanceProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400">
        No symbol data to display.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full align-middle">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-500 sm:pl-0">Symbol</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-500">Net Profit</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-500">Win Rate</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-500">Total Trades</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((item) => (
              <tr key={item.symbol} className="hover:bg-slate-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-0">{item.symbol}</td>
                <td className={`whitespace-nowrap px-3 py-4 text-sm font-semibold ${item.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  ${item.profit.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{item.winRate.toFixed(2)}%</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{item.trades}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SymbolPerformance;