import { useState } from 'react';
import { nifty50Stocks } from '@/data/mockData';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WatchlistProps {
  onSelectStock?: (symbol: string) => void;
  selectedSymbol?: string;
}

const Watchlist = ({ onSelectStock, selectedSymbol }: WatchlistProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['RELIANCE', 'TCS', 'HDFCBANK']));

  const filteredStocks = nifty50Stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(symbol)) {
        newFavorites.delete(symbol);
      } else {
        newFavorites.add(symbol);
      }
      return newFavorites;
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 10000000) return `${(volume / 10000000).toFixed(1)}Cr`;
    if (volume >= 100000) return `${(volume / 100000).toFixed(1)}L`;
    return `${(volume / 1000).toFixed(0)}K`;
  };

  // Sort stocks: favorites first, then alphabetically
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    const aFav = favorites.has(a.symbol);
    const bFav = favorites.has(b.symbol);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return a.symbol.localeCompare(b.symbol);
  });

  return (
    <Card className="flex h-full flex-col border-border bg-card">
      <div className="border-b border-border p-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Watchlist</h3>
          <Badge variant="secondary" className="ml-auto text-[10px]">
            NIFTY 50
          </Badge>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 bg-secondary/50 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-border">
          {sortedStocks.map((stock) => (
            <div
              key={stock.symbol}
              className={cn(
                'cursor-pointer p-3 transition-colors hover:bg-secondary/50',
                selectedSymbol === stock.symbol && 'bg-secondary/50 border-l-2 border-primary'
              )}
              onClick={() => onSelectStock?.(stock.symbol)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleFavorite(stock.symbol, e)}
                    className="text-muted-foreground hover:text-neutral transition-colors"
                  >
                    <Star
                      className={cn(
                        'h-3.5 w-3.5',
                        favorites.has(stock.symbol) && 'fill-neutral text-neutral'
                      )}
                    />
                  </button>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold">{stock.symbol}</span>
                      <span className="text-[10px] text-muted-foreground">{stock.exchange}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                      {stock.name}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono text-sm font-medium">{formatPrice(stock.currentPrice)}</p>
                  <div
                    className={cn(
                      'flex items-center justify-end gap-0.5 text-[10px]',
                      stock.change >= 0 ? 'text-bullish' : 'text-bearish'
                    )}
                  >
                    {stock.change >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    <span>
                      {stock.change >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{stock.sector}</span>
                <span>Vol: {formatVolume(stock.volume)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default Watchlist;
