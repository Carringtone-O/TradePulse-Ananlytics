import React, { useState } from 'react';
import { type PerformanceDataPoint } from '../types';

interface PerformanceChartProps {
  data: {
    weekly: PerformanceDataPoint[];
    monthly: PerformanceDataPoint[];
    yearly: PerformanceDataPoint[];
  };
}

type TimeFrame = 'weekly' | 'monthly' | 'yearly';

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-lg">
        <p className="label text-sm font-bold text-slate-700">{label}</p>
        <p className={`text-md font-semibold ${data.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            Profit: ${data.profit.toFixed(2)}
        </p>
        <p className="text-xs text-slate-500">{`Trades: ${data.trades}`}</p>
      </div>
    );
  }
  return null;
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('monthly');
  const Recharts = (window as any).Recharts;

  if (!Recharts) {
    return (
      <div style={{ width: '100%', height: 300 }} className="flex items-center justify-center text-slate-400">
        Loading Chart...
      </div>
    );
  }

  const { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } = Recharts;
  const chartData = data[timeFrame];
  
  const noData = !chartData || chartData.length === 0;

  return (
    <div>
        <div className="flex justify-center mb-4">
            <div className="inline-flex bg-slate-100 rounded-lg p-1 space-x-1">
                <button onClick={() => setTimeFrame('weekly')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFrame === 'weekly' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>Weekly</button>
                <button onClick={() => setTimeFrame('monthly')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFrame === 'monthly' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>Monthly</button>
                <button onClick={() => setTimeFrame('yearly')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFrame === 'yearly' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>Yearly</button>
            </div>
        </div>
        <div style={{ width: '100%', height: 300 }}>
            {noData ? (
                 <div className="flex items-center justify-center h-full text-slate-400">
                    Not enough data for this time frame.
                </div>
            ) : (
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                        dataKey="date" 
                        stroke="#94a3b8" 
                        tick={{ fill: '#64748b', fontSize: 12 }} 
                        tickLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis 
                        stroke="#94a3b8" 
                        tick={{ fill: '#64748b', fontSize: 12 }} 
                        tickLine={{ stroke: '#cbd5e1' }}
                        tickFormatter={(value) => `$${Number(value / 1000).toFixed(0)}k`}
                        width={40}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(221, 214, 254, 0.4)' }} />
                    <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#f43f5e'} />
                        ))}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    </div>
  );
};

export default PerformanceChart;