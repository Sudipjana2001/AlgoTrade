import { useQuery } from '@tanstack/react-query';
import { stockService } from '@/services/stockService';

export const useStocks = () => {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: () => stockService.getAllStocks(),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useStockDetails = (symbol: string) => {
  return useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => stockService.getStock(symbol),
    enabled: !!symbol,
  });
};

export const useStockOHLCV = (symbol: string, timeframe: string = '1d', period: string = '1mo') => {
  return useQuery({
    queryKey: ['ohlcv', symbol, timeframe, period],
    queryFn: () => stockService.getOHLCV(symbol, timeframe, period),
    enabled: !!symbol,
  });
};

export const useStockIndicators = (symbol: string, timeframe: string = '1d') => {
  return useQuery({
    queryKey: ['indicators', symbol, timeframe],
    queryFn: () => stockService.getIndicators(symbol, timeframe),
    enabled: !!symbol,
  });
};
