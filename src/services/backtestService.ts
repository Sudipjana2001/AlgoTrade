/**
 * Backtest Service
 * Handles all backtest-related API calls
 */

import { api } from './api';

export interface BacktestConfig {
  symbol: string;
  strategy_name: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
}

export interface Trade {
  entry_date: string;
  entry_price: number;
  exit_date?: string;
  exit_price?: number;
  position_type: 'LONG' | 'SHORT';
  quantity: number;
  stop_loss: number;
  target: number;
  pnl: number;
  pnl_pct: number;
  status: 'OPEN' | 'WIN' | 'LOSS';
}

export interface BacktestResult {
  id: string;
  status: string;
  symbol: string;
  strategy_name: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  final_capital?: number;
  total_return?: number;
  total_return_pct?: number;
  win_rate?: number;
  profit_factor?: number;
  sharpe_ratio?: number;
  max_drawdown?: number;
  max_drawdown_pct?: number;
  total_trades?: number;
  winning_trades?: number;
  losing_trades?: number;
  avg_win?: number;
  avg_loss?: number;
  equity_curve?: { date: string; value: number }[];
  trades?: Trade[];
  error_message?: string;
  created_at: string;
}

export const backtestService = {
  /**
   * Run a new backtest
   */
  runBacktest: async (config: BacktestConfig): Promise<BacktestResult> => {
    return api.post('/api/backtest/run', config);
  },

  /**
   * Get a specific backtest result by ID
   */
  getResult: async (id: string): Promise<BacktestResult> => {
    return api.get(`/api/backtest/results/${id}`);
  },

  /**
   * List all backtest results
   */
  listResults: async (filters?: {
    symbol?: string;
    strategy?: string;
    limit?: number;
  }): Promise<BacktestResult[]> => {
    const params = new URLSearchParams();
    if (filters?.symbol) params.append('symbol', filters.symbol);
    if (filters?.strategy) params.append('strategy', filters.strategy);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    return api.get(`/api/backtest/results?${params.toString()}`);
  },

  /**
   * Delete a backtest result
   */
  deleteResult: async (id: string): Promise<void> => {
    return api.delete(`/api/backtest/results/${id}`);
  },
};

export default backtestService;
