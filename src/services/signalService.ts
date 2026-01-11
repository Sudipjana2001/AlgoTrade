import api from './api';
import { TradingSignal } from '@/types/trading';

// Backend response shape matches loose structure, so we map it to our frontend type
interface SignalResponse {
  id: number;
  symbol: string;
  signal_type: 'BUY' | 'SELL' | 'HOLD';
  strategy_name: string;
  confidence: number;
  entry_price: number;
  stop_loss: number;
  target_price: number;
  risk_reward: number;
  reasoning: string;
  timestamp: string;
  timeframe: string;
  is_active: boolean;
}

const mapSignal = (sig: SignalResponse): TradingSignal => ({
  id: sig.id.toString(), // Frontend expects string ID
  symbol: sig.symbol,
  type: sig.signal_type,
  strategy: sig.strategy_name,
  confidence: sig.confidence,
  price: 0, // Not always present directly in signal model, usually fetched with stock
  timestamp: sig.timestamp ? new Date(sig.timestamp) : new Date(),
  entryPrice: sig.entry_price,
  stopLoss: sig.stop_loss,
  target: sig.target_price,
  riskReward: sig.risk_reward,
  reasoning: sig.reasoning,
});

export const signalService = {
  async getAllSignals(filters: { minConfidence?: number; signalType?: string; limit?: number } = {}): Promise<TradingSignal[]> {
    const response: any = await api.get('/api/signals', {
      params: {
        min_confidence: filters.minConfidence,
        signal_type: filters.signalType,
        limit: filters.limit
      }
    });
    return response.data.map(mapSignal);
  },

  async getSignalById(id: number): Promise<TradingSignal> {
    const response: any = await api.get(`/api/signals/${id}`);
    return mapSignal(response.data);
  },
  
  async getSignalForStock(symbol: string): Promise<TradingSignal> {
    // Note: Updated endpoint path to avoid conflict
    const response: any = await api.get(`/api/signals/stock/${symbol}`);
    return mapSignal(response.data);
  },

  async triggerGeneration(symbols?: string[], minConfidence: number = 60): Promise<any> {
    const response: any = await api.post('/api/signals/generate', {
      symbols,
      min_confidence: minConfidence
    });
    return response;
  }
};
