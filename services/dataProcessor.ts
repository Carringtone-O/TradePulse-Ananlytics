import { type Trade, type DashboardData, type EquityDataPoint, type PerformanceDataPoint, type Account, type SymbolPerformanceData, type TimePerformanceData } from '../types';

// Helper function to format date for performance charts
const getWeekId = (d: Date) => {
    const date = new Date(d.valueOf());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 4 - (date.getDay() || 7));
    const yearStart = new Date(date.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${date.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}
const getMonthId = (d: Date) => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
const getYearId = (d: Date) => `${d.getFullYear()}`;

const parseCsvToTrades = (csvString: string): Trade[] => {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('CSV file must have a header and at least one data row.');
    }
    
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredColumns = ['ticket', 'closetime', 'symbol', 'profit'];
    const columnIndices: { [key: string]: number } = {};

    requiredColumns.forEach(col => {
        const index = header.indexOf(col);
        if (index === -1) {
            throw new Error(`Missing required column in CSV: ${col}`);
        }
        columnIndices[col] = index;
    });

    const trades: Trade[] = lines.slice(1).map((line, i) => {
        const values = line.split(',');
        if (values.length < header.length) return null;
        try {
            return {
                ticket: parseInt(values[columnIndices['ticket']], 10),
                openTime: new Date(), // Placeholder
                closeTime: new Date(values[columnIndices['closetime']]),
                symbol: values[columnIndices['symbol']].trim(),
                profit: parseFloat(values[columnIndices['profit']]),
            };
        } catch (e) {
            console.warn(`Skipping invalid row ${i+2}: ${line}`);
            return null;
        }
    }).filter((trade): trade is Trade => trade !== null && !isNaN(trade.profit) && trade.closeTime.toString() !== 'Invalid Date');

    if (trades.length === 0) {
        throw new Error('No valid trade data found in the file.');
    }
    
    trades.sort((a, b) => a.closeTime.getTime() - b.closeTime.getTime());
    return trades;
};

export const calculateDashboardData = (trades: Trade[]): DashboardData => {
  const totalTrades = trades.length;
  
  if (totalTrades === 0) {
      // Return a default empty state if there are no trades
      return {
          totalTrades: 0, totalProfit: 0, winRate: 0, winningTrades: 0, losingTrades: 0,
          profitFactor: 0, averageWin: 0, averageLoss: 0, riskRewardRatio: 0,
          maxDrawdown: 0, maxDrawdownPercent: 0, equityCurve: [], heatmapData: {},
          timePerformanceData: {}, weeklyPerformance: [], monthlyPerformance: [],
          yearlyPerformance: [], symbolPerformance: [], trades: []
      };
  }
  
  const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);

  const winningTradesArr = trades.filter(t => t.profit > 0);
  const losingTradesArr = trades.filter(t => t.profit <= 0);

  const winningTrades = winningTradesArr.length;
  const losingTrades = losingTradesArr.length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const totalWinProfit = winningTradesArr.reduce((sum, t) => sum + t.profit, 0);
  const totalLossProfit = Math.abs(losingTradesArr.reduce((sum, t) => sum + t.profit, 0));

  const profitFactor = totalLossProfit > 0 ? totalWinProfit / totalLossProfit : Infinity;
  const averageWin = winningTrades > 0 ? totalWinProfit / winningTrades : 0;
  const averageLoss = losingTrades > 0 ? Math.abs(totalLossProfit / losingTrades) : 0;
  const riskRewardRatio = averageLoss > 0 ? averageWin / averageLoss : Infinity;

  let balance = 0;
  let peak = 0;
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;
  const equityCurve: EquityDataPoint[] = trades.map((trade, index) => {
    balance += trade.profit;
    if (balance > peak) {
      peak = balance;
    }
    const drawdown = peak - balance;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      if (peak > 0) {
        maxDrawdownPercent = (drawdown / peak) * 100;
      }
    }
    return { tradeNumber: index + 1, balance };
  });
  
  const heatmapData = Array(7).fill(0).reduce((acc, _, i) => {
      acc[i] = { trades: 0, profit: 0 };
      return acc;
  }, {} as { [key: number]: { trades: number; profit: number } });

  trades.forEach(trade => {
    const day = trade.closeTime.getDay();
    heatmapData[day].trades++;
    heatmapData[day].profit += trade.profit;
  });

  // Time performance by day and hour
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const timePerformanceData: TimePerformanceData = daysOfWeek.reduce((acc, day) => {
      acc[day] = {};
      return acc;
  }, {} as TimePerformanceData);

  trades.forEach(trade => {
      const day = daysOfWeek[trade.closeTime.getDay()];
      const hour = trade.closeTime.getHours();
      if (!timePerformanceData[day][hour]) {
          timePerformanceData[day][hour] = { profit: 0, trades: 0 };
      }
      timePerformanceData[day][hour].profit += trade.profit;
      timePerformanceData[day][hour].trades++;
  });

  // Performance over time aggregation
  const aggregatePerformance = (getPeriodId: (d: Date) => string): PerformanceDataPoint[] => {
      const performanceMap: { [key: string]: { profit: number; trades: number } } = {};
      trades.forEach(trade => {
          const periodId = getPeriodId(trade.closeTime);
          if (!performanceMap[periodId]) {
              performanceMap[periodId] = { profit: 0, trades: 0 };
          }
          performanceMap[periodId].profit += trade.profit;
          performanceMap[periodId].trades++;
      });

      return Object.entries(performanceMap)
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => a.date.localeCompare(b.date));
  };
  
  const weeklyPerformance = aggregatePerformance(getWeekId);
  const monthlyPerformance = aggregatePerformance(getMonthId);
  const yearlyPerformance = aggregatePerformance(getYearId);

  // Symbol performance aggregation
  const symbolPerformanceMap: { [symbol: string]: { profit: number; wins: number; trades: number } } = {};
  trades.forEach(trade => {
    const symbol = trade.symbol || 'Unknown';
    if (!symbolPerformanceMap[symbol]) {
      symbolPerformanceMap[symbol] = { profit: 0, wins: 0, trades: 0 };
    }
    symbolPerformanceMap[symbol].profit += trade.profit;
    symbolPerformanceMap[symbol].trades++;
    if (trade.profit > 0) {
      symbolPerformanceMap[symbol].wins++;
    }
  });

  const symbolPerformance: SymbolPerformanceData[] = Object.entries(symbolPerformanceMap)
    .map(([symbol, data]) => ({
      symbol,
      profit: data.profit,
      winRate: (data.wins / data.trades) * 100,
      trades: data.trades,
    }))
    .sort((a, b) => b.profit - a.profit);

  return {
    totalTrades, totalProfit, winRate, winningTrades, losingTrades,
    profitFactor, averageWin, averageLoss: -averageLoss, riskRewardRatio,
    maxDrawdown, maxDrawdownPercent, equityCurve, heatmapData,
    timePerformanceData, weeklyPerformance, monthlyPerformance, yearlyPerformance,
    symbolPerformance, trades
  };
};

export const processTrades = (csvString: string): DashboardData => {
  const trades = parseCsvToTrades(csvString);
  return calculateDashboardData(trades);
};

export const combineAccountData = (accounts: Account[]): DashboardData => {
    // Flatten all trades from all accounts into a single array
    const allTrades = accounts.flatMap(acc => acc.data.trades);
    
    // Sort all trades chronologically
    allTrades.sort((a, b) => a.closeTime.getTime() - b.closeTime.getTime());
    
    // Re-process the combined data
    return calculateDashboardData(allTrades);
};