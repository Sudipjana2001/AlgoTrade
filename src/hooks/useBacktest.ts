/**
 * React Query hooks for backtesting
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backtestService, BacktestConfig, BacktestResult } from '@/services/backtestService';
import { toast } from 'sonner';

/**
 * Hook to run a backtest
 */
export const useRunBacktest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: BacktestConfig) => backtestService.runBacktest(config),
    onSuccess: (data) => {
      // Invalidate and refetch backtest results list
      queryClient.invalidateQueries({ queryKey: ['backtests'] });
      
      if (data.status === 'completed') {
        toast.success('Backtest completed!', {
          description: `${data.total_trades} trades analyzed with ${data.win_rate?.toFixed(1)}% win rate`,
        });
      } else {
        toast.error('Backtest failed', {
          description: data.error_message || 'Unknown error occurred',
        });
      }
    },
    onError: (error: any) => {
      toast.error('Failed to run backtest', {
        description: error.response?.data?.detail || error.message,
      });
    },
  });
};

/**
 * Hook to get a specific backtest result
 */
export const useBacktestResult = (id: string | null) => {
  return useQuery({
    queryKey: ['backtest', id],
    queryFn: () => backtestService.getResult(id!),
    enabled: !!id,
  });
};

/**
 * Hook to list all backtest results
 */
export const useBacktestResults = (filters?: { symbol?: string; strategy?: string; limit?: number }) => {
  return useQuery({
    queryKey: ['backtests', filters],
    queryFn: () => backtestService.listResults(filters),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to delete a backtest result
 */
export const useDeleteBacktest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => backtestService.deleteResult(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backtests'] });
      toast.success('Backtest deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete backtest', {
        description: error.response?.data?.detail || error.message,
      });
    },
  });
};
