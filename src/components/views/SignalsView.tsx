import { useState } from 'react';
import { mockSignals } from '@/data/mockData';
import { TradingSignal, SignalType, Timeframe } from '@/types/trading';
import SignalCard from '@/components/SignalCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, SortAsc, SortDesc, Bell, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SignalsViewProps {
  onSelectSignal: (signal: TradingSignal) => void;
}

const SignalsView = ({ onSelectSignal }: SignalsViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<SignalType | 'ALL'>('ALL');
  const [timeframeFilter, setTimeframeFilter] = useState<Timeframe | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'confidence' | 'time' | 'riskReward'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredSignals = mockSignals
    .filter((signal) => {
      const matchesSearch =
        signal.stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        signal.stock.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'ALL' || signal.signal === typeFilter;
      const matchesTimeframe = timeframeFilter === 'ALL' || signal.timeframe === timeframeFilter;
      return matchesSearch && matchesType && matchesTimeframe;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'confidence':
          comparison = a.confidence - b.confidence;
          break;
        case 'riskReward':
          comparison = a.riskReward - b.riskReward;
          break;
        case 'time':
        default:
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast.success('Signals refreshed successfully');
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <Card className="border-border bg-card p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">All Trading Signals</h2>
            <Badge variant="outline">{filteredSignals.length} signals</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-[180px] pl-8 text-sm"
              />
            </div>

            {/* Type Filter */}
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as SignalType | 'ALL')}
            >
              <SelectTrigger className="h-9 w-[120px]">
                <SelectValue placeholder="Signal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="BUY">Buy</SelectItem>
                <SelectItem value="SELL">Sell</SelectItem>
                <SelectItem value="HOLD">Hold</SelectItem>
              </SelectContent>
            </Select>

            {/* Timeframe Filter */}
            <Select
              value={timeframeFilter}
              onValueChange={(v) => setTimeframeFilter(v as Timeframe | 'ALL')}
            >
              <SelectTrigger className="h-9 w-[120px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All TF</SelectItem>
                <SelectItem value="1m">1 min</SelectItem>
                <SelectItem value="5m">5 min</SelectItem>
                <SelectItem value="15m">15 min</SelectItem>
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="1d">Daily</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as typeof sortBy)}
            >
              <SelectTrigger className="h-9 w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Time</SelectItem>
                <SelectItem value="confidence">Confidence</SelectItem>
                <SelectItem value="riskReward">Risk/Reward</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Signals Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredSignals.length === 0 ? (
          <Card className="flex h-full items-center justify-center border-border bg-card p-8">
            <div className="text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No signals found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or search query
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('ALL');
                  setTimeframeFilter('ALL');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSignals.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                onClick={() => onSelectSignal(signal)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalsView;
