import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/services/marketService';

export const useMarketStatus = () => {
  return useQuery({
    queryKey: ['marketStatus'],
    queryFn: () => marketService.getStatus(),
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useIndices = () => {
  return useQuery({
    queryKey: ['indices'],
    queryFn: () => marketService.getIndices(),
    refetchInterval: 60 * 1000,
  });
};
