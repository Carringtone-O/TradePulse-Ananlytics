import React from 'react';
import { type Trade } from '../types';

interface EmotionChartProps {
  trades: Trade[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-lg">
        <p className="label text-md font-bold text-slate-700">{label}</p>
        {payload.map((p: any, index: number) => (
            <p key={index} style={{ color: p.color }} className="text-sm font-medium">
                {`${p.name}: ${p.value} trades`}
            </p>
        ))}
      </div>
    );
  }
  return null;
};

const EmotionChart: React.FC<EmotionChartProps> = ({ trades }) => {
  const Recharts = (window as any).Recharts;

  if (!Recharts) {
    return (
      <div style={{ width: '100%', height: 300 }} className="flex items-center justify-center text-slate-400">
        Loading Chart...
      </div>
    );
  }

  const { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } = Recharts;

  const emotionOrder = ['Confident', 'Hopeful', 'Neutral', 'Anxious', 'Fearful'];

  const emotionCounts = emotionOrder.map(emotion => ({
    name: emotion,
    Before: 0,
    After: 0,
  }));

  trades.forEach(trade => {
    if (trade.emotionBefore) {
      const index = emotionCounts.findIndex(e => e.name === trade.emotionBefore);
      if (index !== -1) {
        emotionCounts[index].Before++;
      }
    }
    if (trade.emotionAfter) {
      const index = emotionCounts.findIndex(e => e.name === trade.emotionAfter);
      if (index !== -1) {
        emotionCounts[index].After++;
      }
    }
  });

  // Filter out emotions that were never used to keep the chart clean
  const chartData = emotionCounts.filter(d => d.Before > 0 || d.After > 0);
  
  if (chartData.length === 0) {
    return (
        <div style={{ width: '100%', height: 300 }} className="flex items-center justify-center text-slate-400 text-center p-4">
            No emotional data logged yet. Click on a trade in the journal below to add your emotions.
        </div>
    )
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 5, right: 20, left: -10, bottom: 5,
          }}
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            tickLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            tickLine={{ stroke: '#cbd5e1' }}
            allowDecimals={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(221, 214, 254, 0.4)' }} />
          <Legend wrapperStyle={{ color: '#475569', fontSize: '12px', paddingTop: '10px' }} />
          <Bar dataKey="Before" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="After" fill="#38bdf8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionChart;