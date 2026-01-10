import { useState } from 'react';
import { nifty50Stocks } from '@/data/mockData';
import { Stock } from '@/types/trading';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  RefreshCw,
  Download,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ScreenerViewProps {
  onSelectStock: (symbol: string) => void;
}

// Extend stock data with screener-specific fields
interface ScreenerStock extends Stock {
  rsi: number;
  pe: number;
  marketCap: number;
  dayHigh: number;
  dayLow: number;
  weekHigh52: number;
  weekLow52: number;
}

const generateScreenerData = (): ScreenerStock[] => {
  return nifty50Stocks.map((stock) => ({
    ...stock,
    rsi: Math.floor(Math.random() * 60) + 20,
    pe: Math.floor(Math.random() * 40) + 10,
    marketCap: Math.floor(Math.random() * 500000) + 50000,
    dayHigh: stock.currentPrice * 1.02,
    dayLow: stock.currentPrice * 0.98,
    weekHigh52: stock.currentPrice * 1.3,
    weekLow52: stock.currentPrice * 0.7,
  }));
};

const ScreenerView = ({ onSelectStock }: ScreenerViewProps) => {
  const [stocks] = useState<ScreenerStock[]>(generateScreenerData());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(new Set());
  const [rsiRange, setRsiRange] = useState([0, 100]);
  const [peRange, setPeRange] = useState([0, 50]);
  const [changeFilter, setChangeFilter] = useState<'all' | 'gainers' | 'losers'>('all');
  const [sortColumn, setSortColumn] = useState<keyof ScreenerStock>('symbol');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sectors = Array.from(new Set(stocks.map((s) => s.sector)));

  const filteredStocks = stocks
    .filter((stock) => {
      const matchesSearch =
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector =
        selectedSectors.size === 0 || selectedSectors.has(stock.sector);
      const matchesRSI = stock.rsi >= rsiRange[0] && stock.rsi <= rsiRange[1];
      const matchesPE = stock.pe >= peRange[0] && stock.pe <= peRange[1];
      const matchesChange =
        changeFilter === 'all' ||
        (changeFilter === 'gainers' && stock.change > 0) ||
        (changeFilter === 'losers' && stock.change < 0);
      return matchesSearch && matchesSector && matchesRSI && matchesPE && matchesChange;
    })
    .sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      const comparison = typeof aVal === 'string' 
        ? aVal.localeCompare(bVal as string)
        : (aVal as number) - (bVal as number);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleSort = (column: keyof ScreenerStock) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) => {
      const next = new Set(prev);
      if (next.has(sector)) {
        next.delete(sector);
      } else {
        next.add(sector);
      }
      return next;
    });
  };

  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return next;
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast.success('Screener data refreshed');
  };

  const handleExport = () => {
    toast.success('Export started', { description: 'CSV file will download shortly' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatMarketCap = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L Cr`;
    return `₹${(value / 1000).toFixed(1)}K Cr`;
  };

  return (
    <div className="flex h-full gap-4">
      {/* Filters Panel */}
      {showFilters && (
        <Card className="w-64 flex-shrink-0 border-border bg-card p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Filters</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setSelectedSectors(new Set());
                setRsiRange([0, 100]);
                setPeRange([0, 50]);
                setChangeFilter('all');
              }}
            >
              Reset
            </Button>
          </div>

          <div className="space-y-6">
            {/* Sector Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sectors</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {sectors.map((sector) => (
                  <div key={sector} className="flex items-center space-x-2">
                    <Checkbox
                      id={sector}
                      checked={selectedSectors.has(sector)}
                      onCheckedChange={() => toggleSector(sector)}
                    />
                    <label
                      htmlFor={sector}
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      {sector}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Change Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Price Change</Label>
              <Select
                value={changeFilter}
                onValueChange={(v) => setChangeFilter(v as typeof changeFilter)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stocks</SelectItem>
                  <SelectItem value="gainers">Gainers Only</SelectItem>
                  <SelectItem value="losers">Losers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* RSI Range */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-medium">RSI Range</Label>
                <span className="text-xs font-mono text-muted-foreground">
                  {rsiRange[0]} - {rsiRange[1]}
                </span>
              </div>
              <Slider
                value={rsiRange}
                onValueChange={setRsiRange}
                min={0}
                max={100}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Oversold</span>
                <span>Overbought</span>
              </div>
            </div>

            {/* P/E Range */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-medium">P/E Ratio</Label>
                <span className="text-xs font-mono text-muted-foreground">
                  {peRange[0]} - {peRange[1]}
                </span>
              </div>
              <Slider
                value={peRange}
                onValueChange={setPeRange}
                min={0}
                max={50}
                step={5}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <Card className="border-border bg-card p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-[250px] pl-8"
                />
              </div>

              <Badge variant="outline">{filteredStocks.length} stocks</Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="flex-1 border-border bg-card overflow-hidden">
          <div className="h-full overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('symbol')}
                  >
                    Symbol
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-foreground text-right"
                    onClick={() => handleSort('currentPrice')}
                  >
                    Price
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-foreground text-right"
                    onClick={() => handleSort('changePercent')}
                  >
                    Change
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-foreground text-right"
                    onClick={() => handleSort('rsi')}
                  >
                    RSI
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-foreground text-right"
                    onClick={() => handleSort('pe')}
                  >
                    P/E
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-foreground text-right"
                    onClick={() => handleSort('volume')}
                  >
                    Volume
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-foreground text-right"
                    onClick={() => handleSort('marketCap')}
                  >
                    Market Cap
                  </TableHead>
                  <TableHead>Sector</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.map((stock) => (
                  <TableRow
                    key={stock.symbol}
                    className="cursor-pointer hover:bg-secondary/50"
                    onClick={() => onSelectStock(stock.symbol)}
                  >
                    <TableCell>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(stock.symbol);
                        }}
                      >
                        <Star
                          className={cn(
                            'h-4 w-4',
                            favorites.has(stock.symbol)
                              ? 'fill-neutral text-neutral'
                              : 'text-muted-foreground hover:text-neutral'
                          )}
                        />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{stock.symbol}</span>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {stock.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(stock.currentPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className={cn(
                          'flex items-center justify-end gap-1',
                          stock.change >= 0 ? 'text-bullish' : 'text-bearish'
                        )}
                      >
                        {stock.change >= 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        <span className="font-mono">
                          {stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'font-mono',
                          stock.rsi <= 30
                            ? 'text-bullish'
                            : stock.rsi >= 70
                            ? 'text-bearish'
                            : ''
                        )}
                      >
                        {stock.rsi}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {stock.pe.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {(stock.volume / 1000000).toFixed(1)}M
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {formatMarketCap(stock.marketCap)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {stock.sector}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ScreenerView;
