export interface Trade {
  ticket: number;
  openTime: Date;
  closeTime: Date;
  symbol: string;
  profit: number;
  journal?: string;
  emotionBefore?: string;
  emotionAfter?: string;
  tags?: string[];
  newsAnalysis?: string;
}

export interface EquityDataPoint {
  tradeNumber: number;
  balance: number;
}

export interface HeatmapData {
  [key: number]: {
    trades: number;
    profit: number;
  };
}

export interface TimePerformanceData {
    [day: string]: {
        [hour: number]: {
            profit: number;
            trades: number;
        }
    }
}

export interface PerformanceDataPoint {
    date: string;
    profit: number;
    trades: number;
}

export interface SymbolPerformanceData {
    symbol: string;
    profit: number;
    winRate: number;
    trades: number;
}

export interface DashboardData {
  totalTrades: number;
  totalProfit: number;

  winRate: number;
  winningTrades: number;
  losingTrades: number;

  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  riskRewardRatio: number;
  
  maxDrawdown: number;
  maxDrawdownPercent: number;
  
  equityCurve: EquityDataPoint[];
  heatmapData: HeatmapData;
  timePerformanceData: TimePerformanceData;
  weeklyPerformance: PerformanceDataPoint[];
  monthlyPerformance: PerformanceDataPoint[];
  yearlyPerformance: PerformanceDataPoint[];
  symbolPerformance: SymbolPerformanceData[];
  trades: Trade[];
}

export interface Goals {
    totalProfit?: number;
    winRate?: number;
    maxDrawdown?: number;
}

export interface Account {
    id: string;
    name: string;
    data: DashboardData;
    goals?: Goals;
}