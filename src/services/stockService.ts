import api from './api';

export interface StockData {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap?: number;
  previousClose?: number;
}

export interface OHLCVData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorsData {
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

export const stockService = {
  async getAllStocks(): Promise<StockData[]> {
    const response: any = await api.get('/api/stocks');
    return response.data;
  },

  async getStock(symbol: string, exchange: 'NSE' | 'BSE' = 'NSE'): Promise<StockData> {
    const response: any = await api.get(`/api/stocks/${symbol}`, {
      params: { exchange }
    });
    return response.data;
  },

  async getOHLCV(symbol: string, timeframe: string = '1d', period: string = '1mo', exchange: string = 'NSE'): Promise<OHLCVData[]> {
    const response: any = await api.get(`/api/stocks/${symbol}/ohlcv`, {
      params: { timeframe, period, exchange }
    });
    return response.data;
  },

  async getIndicators(symbol: string, timeframe: string = '1d', exchange: string = 'NSE'): Promise<IndicatorsData> {
    const response: any = await api.get(`/api/stocks/${symbol}/indicators`, {
      params: { timeframe, exchange }
    });
    return response.data;
  }
};
