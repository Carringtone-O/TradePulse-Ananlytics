
import React from 'react';
import { type EquityDataPoint } from '../types';

interface EquityCurveChartProps {
  data: EquityDataPoint[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-lg">
        <p className="label text-sm text-slate-700">{`Trade #${label}`}</p>
        <p className="intro text-md font-bold text-violet-600">{`Balance: $${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

const EquityCurveChart: React.FC<EquityCurveChartProps> = ({ data }) => {
  // Access Recharts from the window object inside the component render function
  // to ensure the script has loaded.
  const Recharts = (window as any).Recharts;

  // If the library hasn't loaded yet, show a loading message.
  if (!Recharts) {
    return (
      <div style={{ width: '100%', height: 400 }} className="flex items-center justify-center text-slate-400">
        Loading Chart...
      </div>
    );
  }

  const { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } = Recharts;

  return (
    <div style={{ width: '100%', height: 400 }}>
       <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="tradeNumber" 
            stroke="#94a3b8" 
            tick={{ fill: '#64748b' }} 
            tickLine={{ stroke: '#94a3b8' }}
            name="Trade #"
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fill: '#64748b' }} 
            tickLine={{ stroke: '#94a3b8' }}
            tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
            domain={['auto', 'auto']}
            allowDataOverflow={true}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="balance" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EquityCurveChart;