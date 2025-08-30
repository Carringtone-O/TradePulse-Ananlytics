import React, { useState, useEffect } from 'react';
import { type Goals, type DashboardData } from '../types';

interface GoalsTrackerProps {
  goals?: Goals;
  data: DashboardData;
  onSave: (newGoals: Goals) => void;
}

interface GoalInputProps {
    label: string;
    value: number | undefined;
    onChange: (value: number | undefined) => void;
    prefix?: string;
    suffix?: string;
}

const GoalInput: React.FC<GoalInputProps> = ({ label, value, onChange, prefix, suffix }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            {prefix && <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center"><span className="text-slate-400 sm:text-sm">{prefix}</span></div>}
            <input 
                type="number"
                value={value || ''}
                onChange={e => onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                className={`w-full bg-white border border-slate-300 rounded-md py-2 text-slate-900 focus:ring-violet-500 focus:border-violet-500 sm:text-sm ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'}`}
            />
            {suffix && <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center"><span className="text-slate-400 sm:text-sm">{suffix}</span></div>}
        </div>
    </div>
);


const ProgressBar: React.FC<{ label: string; current: number; target: number; format: (val: number) => string; invert?: boolean }> = ({ label, current, target, format, invert = false }) => {
    const progress = target !== 0 ? Math.min(Math.abs(current / target) * 100, 100) : 0;
    
    let colorClass = 'bg-violet-500';
    if (invert) {
        // For drawdown, progress is bad. Higher percentage is worse.
        colorClass = progress > 80 ? 'bg-rose-500' : progress > 50 ? 'bg-amber-500' : 'bg-emerald-500';
    } else {
        // For profit/winrate, progress is good.
        colorClass = progress > 80 ? 'bg-emerald-500' : progress > 50 ? 'bg-sky-500' : 'bg-violet-500';
    }


    return (
        <div>
            <div className="flex justify-between text-sm font-medium text-slate-700">
                <span>{label}</span>
                <span className="text-slate-500">{`${format(current)} / ${format(target)}`}</span>
            </div>
            <div className="mt-1 w-full bg-slate-200 rounded-full h-2.5">
                <div className={`${colorClass} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};


const GoalsTracker: React.FC<GoalsTrackerProps> = ({ goals: initialGoals, data, onSave }) => {
  const [goals, setGoals] = useState<Goals>(initialGoals || {});
  
  useEffect(() => {
    setGoals(initialGoals || {});
  }, [initialGoals]);

  const handleSave = () => {
    onSave(goals);
  };
  
  const hasGoals = goals.totalProfit || goals.winRate || goals.maxDrawdown;

  return (
    <div className="space-y-4">
        {hasGoals ? (
            <div className="space-y-4">
                {goals.totalProfit && <ProgressBar label="Profit Target" current={data.totalProfit} target={goals.totalProfit} format={v => `$${v.toFixed(0)}`} />}
                {goals.winRate && <ProgressBar label="Win Rate Target" current={data.winRate} target={goals.winRate} format={v => `${v.toFixed(1)}%`} />}
                {goals.maxDrawdown && <ProgressBar label="Drawdown Limit" current={data.maxDrawdownPercent} target={goals.maxDrawdown} format={v => `${v.toFixed(1)}%`} invert={true} />}
            </div>
        ) : (
            <p className="text-sm text-slate-500 text-center py-8">Set your performance goals below to start tracking your progress.</p>
        )}
      
        <details className="group">
            <summary className="text-sm text-violet-600 cursor-pointer hover:text-violet-700 list-none font-medium text-center">
                 <span className="group-open:hidden">Set / Edit Goals</span>
                 <span className="hidden group-open:inline">Hide Goal Editor</span>
            </summary>
            <div className="mt-4 p-4 bg-slate-50/50 rounded-lg space-y-4 border border-slate-200">
                <GoalInput label="Total Profit Target" value={goals.totalProfit} onChange={v => setGoals({...goals, totalProfit: v})} prefix="$" />
                <GoalInput label="Win Rate Target" value={goals.winRate} onChange={v => setGoals({...goals, winRate: v})} suffix="%" />
                <GoalInput label="Max Drawdown Limit" value={goals.maxDrawdown} onChange={v => setGoals({...goals, maxDrawdown: v})} suffix="%" />
                <button onClick={handleSave} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-4 rounded-md">Save Goals</button>
            </div>
        </details>
    </div>
  );
};

export default GoalsTracker;