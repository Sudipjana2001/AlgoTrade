import api from './api';

export interface MarketStatusData {
  isOpen: boolean;
  session: string;
  nextEvent: string;
  timestamp: string;
}

export interface IndexData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export const marketService = {
  async getStatus(): Promise<MarketStatusData> {
    const response: any = await api.get('/api/market/status');
    return response.data;
  },

  async getIndices(): Promise<IndexData[]> {
    const response: any = await api.get('/api/market/indices');
    return response.data;
  }
};
