import { Stock, TradingSignal, OHLCVData, BacktestResult } from '@/types/trading';

export const nifty50Stocks: Stock[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', sector: 'Oil & Gas', currentPrice: 2876.50, change: 45.30, changePercent: 1.60, volume: 8234567, avgVolume: 7500000 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'IT', currentPrice: 4123.75, change: -28.45, changePercent: -0.69, volume: 2456789, avgVolume: 2800000 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', sector: 'Banking', currentPrice: 1654.20, change: 18.90, changePercent: 1.16, volume: 5678901, avgVolume: 5200000 },
  { symbol: 'INFY', name: 'Infosys Ltd', exchange: 'NSE', sector: 'IT', currentPrice: 1876.35, change: 32.15, changePercent: 1.74, volume: 4567890, avgVolume: 4100000 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', exchange: 'NSE', sector: 'Banking', currentPrice: 1234.80, change: -8.65, changePercent: -0.70, volume: 6789012, avgVolume: 6500000 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', exchange: 'NSE', sector: 'Telecom', currentPrice: 1567.45, change: 23.40, changePercent: 1.52, volume: 3456789, avgVolume: 3200000 },
  { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', sector: 'Banking', currentPrice: 834.25, change: 12.35, changePercent: 1.50, volume: 9876543, avgVolume: 9000000 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', exchange: 'NSE', sector: 'FMCG', currentPrice: 2456.90, change: -15.60, changePercent: -0.63, volume: 1234567, avgVolume: 1500000 },
  { symbol: 'ITC', name: 'ITC Ltd', exchange: 'NSE', sector: 'FMCG', currentPrice: 467.85, change: 8.25, changePercent: 1.80, volume: 12345678, avgVolume: 11000000 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', exchange: 'NSE', sector: 'Banking', currentPrice: 1789.60, change: -22.45, changePercent: -1.24, volume: 2345678, avgVolume: 2600000 },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', exchange: 'NSE', sector: 'Infrastructure', currentPrice: 3456.75, change: 67.80, changePercent: 2.00, volume: 1567890, avgVolume: 1400000 },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', exchange: 'NSE', sector: 'Banking', currentPrice: 1123.45, change: 15.30, changePercent: 1.38, volume: 4567890, avgVolume: 4200000 },
];

const generateTimestamp = (minutesAgo: number): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - minutesAgo);
  return now;
};

export const mockSignals: TradingSignal[] = [
  {
    id: '1',
    stock: nifty50Stocks[0],
    signal: 'BUY',
    timestamp: generateTimestamp(2),
    entryPrice: 2876.50,
    stopLoss: 2830.00,
    target: 2960.00,
    confidence: 87,
    riskReward: 1.8,
    timeframe: '15m',
    indicators: {
      rsi: 42,
      macd: { value: 12.5, signal: 8.3, histogram: 4.2 },
      ema20: 2865.30,
      ema50: 2842.15,
      sma200: 2780.00,
      bollingerBands: { upper: 2920.50, middle: 2870.25, lower: 2820.00 },
      vwap: 2868.45,
      atr: 45.30,
      volumeSpike: true,
    },
    reasoning: 'Strong bullish divergence on RSI with MACD crossover. Price above VWAP with volume spike indicating institutional buying.',
  },
  {
    id: '2',
    stock: nifty50Stocks[3],
    signal: 'BUY',
    timestamp: generateTimestamp(5),
    entryPrice: 1876.35,
    stopLoss: 1845.00,
    target: 1935.00,
    confidence: 78,
    riskReward: 1.87,
    timeframe: '5m',
    indicators: {
      rsi: 38,
      macd: { value: 8.2, signal: 5.1, histogram: 3.1 },
      ema20: 1870.50,
      ema50: 1858.30,
      sma200: 1820.00,
      bollingerBands: { upper: 1910.25, middle: 1875.00, lower: 1839.75 },
      vwap: 1872.60,
      atr: 28.45,
      volumeSpike: false,
    },
    reasoning: 'Oversold RSI with price bouncing off lower Bollinger Band. EMA crossover imminent.',
  },
  {
    id: '3',
    stock: nifty50Stocks[4],
    signal: 'SELL',
    timestamp: generateTimestamp(8),
    entryPrice: 1234.80,
    stopLoss: 1265.00,
    target: 1180.00,
    confidence: 72,
    riskReward: 1.82,
    timeframe: '15m',
    indicators: {
      rsi: 73,
      macd: { value: -5.8, signal: -2.3, histogram: -3.5 },
      ema20: 1242.30,
      ema50: 1255.15,
      sma200: 1290.00,
      bollingerBands: { upper: 1270.00, middle: 1235.50, lower: 1201.00 },
      vwap: 1238.90,
      atr: 22.15,
      volumeSpike: true,
    },
    reasoning: 'Overbought RSI with bearish MACD divergence. Price rejected at upper Bollinger Band with high volume selling.',
  },
  {
    id: '4',
    stock: nifty50Stocks[6],
    signal: 'BUY',
    timestamp: generateTimestamp(12),
    entryPrice: 834.25,
    stopLoss: 815.00,
    target: 870.00,
    confidence: 85,
    riskReward: 1.86,
    timeframe: '5m',
    indicators: {
      rsi: 45,
      macd: { value: 4.2, signal: 1.8, histogram: 2.4 },
      ema20: 832.50,
      ema50: 828.30,
      sma200: 810.00,
      bollingerBands: { upper: 855.00, middle: 832.75, lower: 810.50 },
      vwap: 833.10,
      atr: 18.60,
      volumeSpike: true,
    },
    reasoning: 'PSU bank rally with strong volume. MACD histogram expanding with positive momentum.',
  },
  {
    id: '5',
    stock: nifty50Stocks[1],
    signal: 'HOLD',
    timestamp: generateTimestamp(15),
    entryPrice: 4123.75,
    stopLoss: 4050.00,
    target: 4250.00,
    confidence: 55,
    riskReward: 1.71,
    timeframe: '15m',
    indicators: {
      rsi: 52,
      macd: { value: 0.5, signal: 0.3, histogram: 0.2 },
      ema20: 4120.00,
      ema50: 4115.50,
      sma200: 4080.00,
      bollingerBands: { upper: 4180.00, middle: 4120.00, lower: 4060.00 },
      vwap: 4118.30,
      atr: 55.20,
      volumeSpike: false,
    },
    reasoning: 'Consolidating near VWAP with neutral indicators. Wait for breakout confirmation.',
  },
];

export const generateOHLCVData = (days: number = 30): OHLCVData[] => {
  const data: OHLCVData[] = [];
  let basePrice = 2800;
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const volatility = Math.random() * 50;
    const trend = Math.random() > 0.5 ? 1 : -1;
    
    const open = basePrice + (Math.random() - 0.5) * volatility;
    const close = open + trend * Math.random() * volatility;
    const high = Math.max(open, close) + Math.random() * 20;
    const low = Math.min(open, close) - Math.random() * 20;
    const volume = Math.floor(5000000 + Math.random() * 5000000);
    
    data.push({
      timestamp: date,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
    
    basePrice = close;
  }
  
  return data;
};

export const mockBacktestResults: BacktestResult = {
  totalTrades: 248,
  winRate: 64.5,
  maxDrawdown: 8.2,
  sharpeRatio: 1.87,
  totalReturn: 34.6,
  profitFactor: 1.92,
  avgWin: 2.8,
  avgLoss: 1.6,
};

export const getMarketStatus = (): { isOpen: boolean; session: string; nextEvent: string } => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  
  const marketOpen = 9 * 60 + 15; // 9:15 AM
  const marketClose = 15 * 60 + 30; // 3:30 PM
  
  const day = now.getDay();
  const isWeekday = day >= 1 && day <= 5;
  
  if (!isWeekday) {
    return { isOpen: false, session: 'Weekend', nextEvent: 'Opens Monday 9:15 AM IST' };
  }
  
  if (currentTime < marketOpen) {
    return { isOpen: false, session: 'Pre-Market', nextEvent: `Opens at 9:15 AM IST` };
  }
  
  if (currentTime >= marketOpen && currentTime < marketClose) {
    return { isOpen: true, session: 'Market Hours', nextEvent: `Closes at 3:30 PM IST` };
  }
  
  return { isOpen: false, session: 'Post-Market', nextEvent: 'Opens tomorrow 9:15 AM IST' };
};
