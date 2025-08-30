import React from 'react';
import { type DashboardData, type Trade, type Account, type Goals } from '../types';
import MetricCard from './MetricCard';
import EquityCurveChart from './EquityCurveChart';
import PerformanceHeatmap from './PerformanceHeatmap';
import TradeLog from './TradeLog';
import EmotionChart from './EmotionChart';
import PerformanceChart from './PerformanceChart';
import AiJournalAnalysis from './AiJournalAnalysis';
import SymbolPerformance from './SymbolPerformance';
import TagFilter from './TagFilter';
import GoalsTracker from './GoalsTracker';
import TimePerformanceHeatmap from './TimePerformanceHeatmap';
import { PlusIcon, ChevronDownIcon, ProfitIcon, LossIcon, RatioIcon, ChartBarIcon, ScaleIcon, CalendarIcon, JournalIcon, BrainIcon, TrendingUpIcon, TagIcon, SparklesIcon, TargetIcon, ClockIcon } from './icons';

interface DashboardProps {
  data: DashboardData;
  accounts: Account[];
  activeAccount?: Account;
  activeAccountId: string | null;
  viewMode: 'individual' | 'portfolio';
  onSetViewMode: (mode: 'individual' | 'portfolio') => void;
  onSetSelectedAccountId: (id: string) => void;
  onAddAccount: () => void;
  onUpdateTrade: (trade: Trade) => void;
  onUpdateGoals: (goals: Goals) => void;
  isJournalingEnabled: boolean;
  uniqueTags: string[];
  activeTags: string[];
  onSetActiveTags: (tags: string[]) => void;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
    const { 
        data, accounts, activeAccount, activeAccountId, viewMode, onSetViewMode,
        onSetSelectedAccountId, onAddAccount, onUpdateTrade, isJournalingEnabled,
        uniqueTags, activeTags, onSetActiveTags, onUpdateGoals
    } = props;
    
    const { 
        totalProfit, winRate, totalTrades, profitFactor, averageWin, averageLoss,
        riskRewardRatio, maxDrawdownPercent, equityCurve, heatmapData, trades,
        weeklyPerformance, monthlyPerformance, yearlyPerformance, symbolPerformance,
        timePerformanceData
    } = data;
    
    const dashboardTitle = viewMode === 'portfolio' ? 'Combined Portfolio' : activeAccount?.name || 'Dashboard';
    
  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">TradePulse Analytics</h1>
            <p className="text-slate-500">Displaying: <span className="font-semibold text-violet-600">{dashboardTitle}</span></p>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
             <div className="flex bg-slate-100 rounded-md">
                <button onClick={() => { onSetViewMode('individual'); onSetActiveTags([]); }} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'individual' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>Individual</button>
                <button onClick={() => { onSetViewMode('portfolio'); onSetActiveTags([]); }} disabled={accounts.length < 2} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'portfolio' ? 'bg-violet-600 text-white' : ''} ${accounts.length < 2 ? 'cursor-not-allowed text-slate-400' : 'text-slate-600 hover:bg-slate-200'}`}>Portfolio</button>
             </div>
             
             {viewMode === 'individual' && (
                 <div className="relative">
                     <select 
                        value={activeAccountId || ''}
                        onChange={(e) => { onSetSelectedAccountId(e.target.value); onSetActiveTags([]); }}
                        className="appearance-none bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md text-sm w-40 text-left focus:outline-none focus:ring-2 focus:ring-violet-500"
                     >
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                     </select>
                     <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                 </div>
             )}
             
             <button onClick={onAddAccount} className="flex items-center bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-md" title="Add New Account">
                 <PlusIcon />
             </button>
        </div>
      </header>
      
      {uniqueTags.length > 0 && <TagFilter allTags={uniqueTags} activeTags={activeTags} onTaggleTag={onSetActiveTags} />}
      
      {/* Metrics & Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 content-start">
            <MetricCard title="Net Profit/Loss" value={`$${totalProfit.toFixed(2)}`} isProfit={totalProfit >= 0} icon={<ProfitIcon />} />
            <MetricCard title="Win Rate" value={`${winRate.toFixed(2)}%`} icon={<RatioIcon />} />
            <MetricCard title="Total Trades" value={totalTrades.toString()} icon={<ChartBarIcon />} />
            <MetricCard title="Profit Factor" value={isFinite(profitFactor) ? profitFactor.toFixed(2) : 'N/A'} icon={<ScaleIcon />} />
            <MetricCard title="Average Win" value={`$${averageWin.toFixed(2)}`} icon={<ProfitIcon />} />
            <MetricCard title="Average Loss" value={`$${averageLoss.toFixed(2)}`} isProfit={false} icon={<LossIcon />} />
            <MetricCard title="Risk/Reward Ratio" value={isFinite(riskRewardRatio) ? `1 : ${riskRewardRatio.toFixed(2)}` : 'N/A'} icon={<RatioIcon />} />
            <MetricCard title="Max Drawdown" value={`${maxDrawdownPercent.toFixed(2)}%`} isProfit={false} icon={<LossIcon />} />
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200">
             <h3 className="text-xl font-semibold mb-4 text-slate-900 flex items-center"><TargetIcon /> <span className="ml-2">Performance Goals</span></h3>
             {viewMode === 'individual' && activeAccount ? (
                <GoalsTracker goals={activeAccount.goals} data={data} onSave={onUpdateGoals} />
             ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-center">Goal tracking is available when viewing an individual account.</div>
             )}
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 flex items-center"><ChartBarIcon/> <span className="ml-2">Equity Curve</span></h3>
          <EquityCurveChart data={equityCurve} />
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 flex items-center"><CalendarIcon /> <span className="ml-2">Daily Performance</span></h3>
          <PerformanceHeatmap data={heatmapData} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 flex items-center"><ClockIcon /> <span className="ml-2">Performance by Time</span></h3>
          <TimePerformanceHeatmap data={timePerformanceData} />
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 flex items-center"><TrendingUpIcon /> <span className="ml-2">Performance Over Time</span></h3>
          <PerformanceChart data={{ weekly: weeklyPerformance, monthly: monthlyPerformance, yearly: yearlyPerformance }} />
        </div>
      </div>
      
       <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200">
            <h3 className="text-xl font-semibold mb-4 text-slate-900 flex items-center"><TagIcon /> <span className="ml-2">Performance by Symbol</span></h3>
            <SymbolPerformance data={symbolPerformance} />
        </div>

      {isJournalingEnabled ? (
        <>
          {trades.length > 0 && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200">
              <h3 className="text-xl font-semibold mb-4 text-slate-900 flex items-center"><BrainIcon /> <span className="ml-2">Emotional Analysis</span></h3>
              <EmotionChart trades={trades} />
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200">
              <h3 className="text-xl font-semibold mb-4 text-slate-900 flex items-center"><SparklesIcon /> <span className="ml-2">AI-Powered Analysis</span></h3>
              <AiJournalAnalysis trades={trades} />
            </div>
          </div>}

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200">
            <h3 className="text-xl font-semibold mb-4 text-slate-900 flex items-center"><JournalIcon /> <span className="ml-2">Trading Journal</span></h3>
            <TradeLog trades={trades} onUpdateTrade={onUpdateTrade} />
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 text-center text-slate-500">
          <p>Journaling, emotional tracking, and AI analysis are available when viewing an individual account.</p>
        </div>
      )}

    </div>
  );
};

export default Dashboard;