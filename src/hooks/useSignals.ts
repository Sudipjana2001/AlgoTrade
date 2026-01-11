import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { signalService } from '@/services/signalService';
import { websocketService } from '@/services/websocket.ts';
import { useEffect } from 'react';

export const useSignals = (filters: { minConfidence?: number; signalType?: string; limit?: number } = {}) => {
  const queryClient = useQueryClient();

  // Listen for real-time updates
  useEffect(() => {
    const unsubscribe = websocketService.on('NEW_SIGNALS', () => {
      // Invalidate query to refetch new signals
      queryClient.invalidateQueries({ queryKey: ['signals'] });
    });
    return unsubscribe;
  }, [queryClient]);

  return useQuery({
    queryKey: ['signals', filters],
    queryFn: () => signalService.getAllSignals(filters),
  });
};

export const useSignalForStock = (symbol: string) => {
  return useQuery({
    queryKey: ['signal', symbol],
    queryFn: () => signalService.getSignalForStock(symbol),
    enabled: !!symbol,
    retry: false, // Don't retry if 404 (no signal)
  });
};

export const useGenerateSignals = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { symbols?: string[], minConfidence?: number }) => 
      signalService.triggerGeneration(data.symbols, data.minConfidence),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals'] });
    },
  });
};
