import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { TradingSignal } from '@/types/trading';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StockChartProps {
  signal?: TradingSignal;
  symbol?: string;
}

import { useStockOHLCV } from '@/hooks/useStocks';

const StockChart = ({ signal, symbol = 'RELIANCE' }: StockChartProps) => {
  const [timeframe, setTimeframe] = useState<'1d' | '1h' | '15m' | '5m'>('1d');
  
  // Fetch OHLCV data from API
  const { data: ohlcvData, isLoading } = useStockOHLCV(symbol, timeframe, timeframe === '1d' ? '3mo' : '5d');

  const chartData = useMemo(() => {
    if (!ohlcvData || ohlcvData.length === 0) return [];
    
    return ohlcvData.map((d, index) => {
      const timestamp = new Date(d.timestamp);
      return {
        ...d,
        date: timestamp.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        color: d.close >= d.open ? 'hsl(142, 70%, 45%)' : 'hsl(0, 75%, 50%)',
        ema20: ohlcvData.slice(Math.max(0, index - 19), index + 1).reduce((sum, item) => sum + item.close, 0) / Math.min(index + 1, 20),
      };
    });
  }, [ohlcvData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-border bg-popover p-3 shadow-xl">
          <p className="mb-2 font-semibold">{label}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Open</span>
              <span className="font-mono">{formatCurrency(data.open)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">High</span>
              <span className="font-mono text-bullish">{formatCurrency(data.high)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Low</span>
              <span className="font-mono text-bearish">{formatCurrency(data.low)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Close</span>
              <span className="font-mono font-semibold">{formatCurrency(data.close)}</span>
            </div>
            <div className="mt-2 border-t border-border pt-2">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Volume</span>
                <span className="font-mono">{(data.volume / 1000000).toFixed(2)}M</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const latestData = chartData[chartData.length - 1];
  const previousData = chartData[chartData.length - 2];
  const priceChange = latestData && previousData ? latestData.close - previousData.close : 0;
  const priceChangePercent = latestData && previousData ? (priceChange / Number(previousData.close)) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="border-border bg-card p-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="border-border bg-card p-4">
        <div className="text-center text-muted-foreground py-12">
          <p>No chart data available for {symbol}</p>
          <p className="text-xs mt-1">Check backend connection</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{signal?.stock.symbol || symbol}</h3>
            <span className="text-sm text-muted-foreground">NSE</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-2xl font-bold">{latestData ? formatCurrency(Number(latestData.close)) : 'N/A'}</span>
            <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-bullish' : 'text-bearish'}`}>
              {priceChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              <span className="font-mono text-sm font-medium">
                {priceChange >= 0 ? '+' : ''}{formatCurrency(priceChange)} ({priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
        
        {signal && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Entry</span>
              <p className="font-mono text-sm">{formatCurrency(signal.entryPrice)}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Target</span>
              <p className="font-mono text-sm text-bullish">{formatCurrency(signal.target)}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Stop Loss</span>
              <p className="font-mono text-sm text-bearish">{formatCurrency(signal.stopLoss)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(220, 40%, 35%)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(220, 40%, 35%)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(220, 15%, 15%)"
              vertical={false}
            />
            
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }}
              axisLine={{ stroke: 'hsl(220, 15%, 18%)' }}
              tickLine={false}
            />
            
            <YAxis
              yAxisId="price"
              orientation="right"
              domain={['auto', 'auto']}
              tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            
            <YAxis
              yAxisId="volume"
              orientation="left"
              domain={[0, 'auto']}
              tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {signal && (
              <>
                <ReferenceLine
                  yAxisId="price"
                  y={signal.entryPrice}
                  stroke="hsl(210, 100%, 50%)"
                  strokeDasharray="5 5"
                  label={{ value: 'Entry', fill: 'hsl(210, 100%, 50%)', fontSize: 10, position: 'left' }}
                />
                <ReferenceLine
                  yAxisId="price"
                  y={signal.target}
                  stroke="hsl(142, 70%, 45%)"
                  strokeDasharray="5 5"
                  label={{ value: 'Target', fill: 'hsl(142, 70%, 45%)', fontSize: 10, position: 'left' }}
                />
                <ReferenceLine
                  yAxisId="price"
                  y={signal.stopLoss}
                  stroke="hsl(0, 75%, 50%)"
                  strokeDasharray="5 5"
                  label={{ value: 'SL', fill: 'hsl(0, 75%, 50%)', fontSize: 10, position: 'left' }}
                />
              </>
            )}
            
            <Bar
              yAxisId="volume"
              dataKey="volume"
              fill="url(#volumeGradient)"
              radius={[2, 2, 0, 0]}
            />
            
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="close"
              stroke="hsl(210, 80%, 55%)"
              fill="url(#priceGradient)"
              strokeWidth={2}
            />
            
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="ema20"
              stroke="hsl(45, 90%, 50%)"
              strokeWidth={1}
              dot={false}
              strokeDasharray="3 3"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-4 bg-chart-line" />
          <span className="text-muted-foreground">Price</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-4 bg-neutral" style={{ borderStyle: 'dashed' }} />
          <span className="text-muted-foreground">EMA 20</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-chart-volume opacity-50" />
          <span className="text-muted-foreground">Volume</span>
        </div>
      </div>
    </Card>
  );
};

export default StockChart;
