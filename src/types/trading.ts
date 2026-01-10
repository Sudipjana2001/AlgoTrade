export type SignalType = 'BUY' | 'SELL' | 'HOLD';
export type Exchange = 'NSE' | 'BSE';
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '1d';

export interface Stock {
  symbol: string;
  name: string;
  exchange: Exchange;
  sector: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
}

export interface TradingSignal {
  id: string;
  stock: Stock;
  signal: SignalType;
  timestamp: Date;
  entryPrice: number;
  stopLoss: number;
  target: number;
  confidence: number; // 0-100
  riskReward: number;
  timeframe: Timeframe;
  indicators: IndicatorSnapshot;
  reasoning: string;
}

export interface IndicatorSnapshot {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  ema20: number;
  ema50: number;
  sma200: number;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  vwap: number;
  atr: number;
  volumeSpike: boolean;
}

export interface OHLCVData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BacktestResult {
  totalTrades: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalReturn: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
}

export interface MarketStatus {
  isOpen: boolean;
  nextOpenTime: Date;
  nextCloseTime: Date;
  session: 'pre-market' | 'market-hours' | 'post-market' | 'closed';
}
