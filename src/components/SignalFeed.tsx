import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { TradingSignal, SignalType, Timeframe } from '@/types/trading';
import SignalCard from './SignalCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, RefreshCw, Bell, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SignalFeedProps {
  onSelectSignal?: (signal: TradingSignal) => void;
  selectedSignal?: TradingSignal | null;
}

import { useSignals } from '@/hooks/useSignals';

const SignalFeed = ({ onSelectSignal, selectedSignal }: SignalFeedProps) => {
  const [activeFilter, setActiveFilter] = useState<SignalType | 'ALL'>('ALL');
  const [timeframeFilter, setTimeframeFilter] = useState<Timeframe | 'ALL'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch signals from API
  const { data: apiSignals, isLoading, error, refetch } = useSignals({
      minConfidence: 60,
      signalType: activeFilter === 'ALL' ? undefined : activeFilter as string, // Cast to string as hook expects string
  });

  const signals = apiSignals || [];

  const filteredSignals = signals.filter((signal) => {
    const matchesTimeframe = timeframeFilter === 'ALL' || signal.timeframe === timeframeFilter;
    return matchesTimeframe;
  });

  const signalCounts = {
    BUY: signals.filter((s) => s.signal === 'BUY').length,
    SELL: signals.filter((s) => s.signal === 'SELL').length,
    HOLD: signals.filter((s) => s.signal === 'HOLD').length,
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success('Signals refreshed', {
      description: `${signals.length} active signals loaded`,
    });
  };

  return (
    <Card className="flex h-full flex-col border-border bg-card">
      <div className="border-b border-border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Live Signals</h3>
            <Badge variant="outline" className="text-[10px]">
              {filteredSignals.length} Active
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
          </Button>
        </div>

        {/* Signal Type Filters */}
        <div className="mt-3 flex items-center gap-2">
          <Button
            variant={activeFilter === 'ALL' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setActiveFilter('ALL')}
          >
            All
          </Button>
          <Button
            variant={activeFilter === 'BUY' ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'h-7 text-xs',
              activeFilter === 'BUY' && 'bg-bullish/20 text-bullish hover:bg-bullish/30'
            )}
            onClick={() => setActiveFilter('BUY')}
          >
            <ArrowUpRight className="mr-1 h-3 w-3" />
            Buy ({signalCounts.BUY})
          </Button>
          <Button
            variant={activeFilter === 'SELL' ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'h-7 text-xs',
              activeFilter === 'SELL' && 'bg-bearish/20 text-bearish hover:bg-bearish/30'
            )}
            onClick={() => setActiveFilter('SELL')}
          >
            <ArrowDownRight className="mr-1 h-3 w-3" />
            Sell ({signalCounts.SELL})
          </Button>
          <Button
            variant={activeFilter === 'HOLD' ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'h-7 text-xs',
              activeFilter === 'HOLD' && 'bg-neutral/20 text-neutral hover:bg-neutral/30'
            )}
            onClick={() => setActiveFilter('HOLD')}
          >
            <Minus className="mr-1 h-3 w-3" />
            Hold ({signalCounts.HOLD})
          </Button>
        </div>

        {/* Timeframe Filters */}
        <div className="mt-2 flex items-center gap-1">
          <Filter className="h-3 w-3 text-muted-foreground mr-1" />
          {(['ALL', '1m', '5m', '15m', '1h', '1d'] as const).map((tf) => (
            <Button
              key={tf}
              variant={timeframeFilter === tf ? 'secondary' : 'ghost'}
              size="sm"
              className="h-6 px-2 text-[10px]"
              onClick={() => setTimeframeFilter(tf as Timeframe | 'ALL')}
            >
              {tf === 'ALL' ? 'All TF' : tf}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load signals</p>
            <p className="text-xs text-muted-foreground mt-1">Check backend connection</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        ) : filteredSignals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No signals match your filters</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => {
                setActiveFilter('ALL');
                setTimeframeFilter('ALL');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          filteredSignals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              onClick={() => onSelectSignal?.(signal)}
            />
          ))
        )}
      </div>
    </Card>
  );
};

export default SignalFeed;
