import { useState } from 'react';
import { mockBacktestResults, generateOHLCVData } from '@/data/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  BarChart3,
  Play,
  Settings2,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const BacktestView = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(true);
  const [config, setConfig] = useState({
    symbol: 'RELIANCE',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    initialCapital: 100000,
    rsiPeriod: 14,
    rsiOversold: 30,
    rsiOverbought: 70,
    useMACD: true,
    useBollingerBands: true,
    stopLossPercent: 2,
    takeProfitPercent: 4,
  });

  const results = mockBacktestResults;

  // Generate P&L curve data
  const plCurveData = Array.from({ length: 90 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (90 - i));
    const baseValue = 100000;
    const growth = Math.sin(i / 10) * 5000 + (i / 90) * 35000;
    const noise = (Math.random() - 0.5) * 3000;
    return {
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      value: baseValue + growth + noise,
      drawdown: Math.max(0, -noise / 1000),
    };
  });

  const handleRunBacktest = async () => {
    setIsRunning(true);
    toast.info('Running backtest...', { description: 'This may take a few seconds' });
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsRunning(false);
    setHasRun(true);
    toast.success('Backtest completed!', {
      description: `${results.totalTrades} trades analyzed with ${results.winRate}% win rate`,
    });
  };

  const metrics = [
    {
      label: 'Win Rate',
      value: `${results.winRate}%`,
      icon: Target,
      color: results.winRate >= 50 ? 'text-bullish' : 'text-bearish',
    },
    {
      label: 'Total Return',
      value: `+${results.totalReturn}%`,
      icon: TrendingUp,
      color: 'text-bullish',
    },
    {
      label: 'Sharpe Ratio',
      value: results.sharpeRatio.toFixed(2),
      icon: Activity,
      color: results.sharpeRatio >= 1.5 ? 'text-bullish' : 'text-neutral',
    },
    {
      label: 'Max Drawdown',
      value: `-${results.maxDrawdown}%`,
      icon: TrendingDown,
      color: 'text-bearish',
    },
  ];

  return (
    <div className="flex h-full gap-4">
      {/* Configuration Panel */}
      <Card className="w-80 flex-shrink-0 border-border bg-card p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Backtest Configuration</h3>
        </div>

        <div className="space-y-4">
          {/* Symbol Selection */}
          <div className="space-y-2">
            <Label>Symbol</Label>
            <Select
              value={config.symbol}
              onValueChange={(v) => setConfig({ ...config, symbol: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RELIANCE">RELIANCE</SelectItem>
                <SelectItem value="TCS">TCS</SelectItem>
                <SelectItem value="HDFCBANK">HDFCBANK</SelectItem>
                <SelectItem value="INFY">INFY</SelectItem>
                <SelectItem value="SBIN">SBIN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={config.startDate}
                onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={config.endDate}
                onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Initial Capital */}
          <div className="space-y-2">
            <Label>Initial Capital (₹)</Label>
            <Input
              type="number"
              value={config.initialCapital}
              onChange={(e) =>
                setConfig({ ...config, initialCapital: parseInt(e.target.value) })
              }
            />
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium mb-3">RSI Settings</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Period</span>
                  <span className="font-mono text-primary">{config.rsiPeriod}</span>
                </div>
                <Slider
                  value={[config.rsiPeriod]}
                  onValueChange={([v]) => setConfig({ ...config, rsiPeriod: v })}
                  min={7}
                  max={21}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Oversold Level</span>
                  <span className="font-mono text-bullish">{config.rsiOversold}</span>
                </div>
                <Slider
                  value={[config.rsiOversold]}
                  onValueChange={([v]) => setConfig({ ...config, rsiOversold: v })}
                  min={20}
                  max={40}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overbought Level</span>
                  <span className="font-mono text-bearish">{config.rsiOverbought}</span>
                </div>
                <Slider
                  value={[config.rsiOverbought]}
                  onValueChange={([v]) => setConfig({ ...config, rsiOverbought: v })}
                  min={60}
                  max={80}
                  step={5}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium mb-3">Additional Indicators</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Use MACD</Label>
                <Switch
                  checked={config.useMACD}
                  onCheckedChange={(v) => setConfig({ ...config, useMACD: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Use Bollinger Bands</Label>
                <Switch
                  checked={config.useBollingerBands}
                  onCheckedChange={(v) => setConfig({ ...config, useBollingerBands: v })}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium mb-3">Risk Management</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Stop Loss</span>
                  <span className="font-mono text-bearish">{config.stopLossPercent}%</span>
                </div>
                <Slider
                  value={[config.stopLossPercent]}
                  onValueChange={([v]) => setConfig({ ...config, stopLossPercent: v })}
                  min={1}
                  max={5}
                  step={0.5}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Take Profit</span>
                  <span className="font-mono text-bullish">{config.takeProfitPercent}%</span>
                </div>
                <Slider
                  value={[config.takeProfitPercent]}
                  onValueChange={([v]) => setConfig({ ...config, takeProfitPercent: v })}
                  min={2}
                  max={10}
                  step={0.5}
                />
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleRunBacktest}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Backtest
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results Panel */}
      <div className="flex-1 space-y-4 overflow-y-auto">
        {hasRun ? (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-4">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <Card key={metric.label} className="border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{metric.label}</span>
                    </div>
                    <p className={cn('mt-2 font-mono text-2xl font-bold', metric.color)}>
                      {metric.value}
                    </p>
                  </Card>
                );
              })}
            </div>

            {/* P&L Curve */}
            <Card className="border-border bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Equity Curve</h3>
                </div>
                <Badge variant="secondary">
                  ₹{((config.initialCapital * (1 + results.totalReturn / 100))).toLocaleString('en-IN')} Final Value
                </Badge>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={plCurveData}>
                    <defs>
                      <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 15%)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }}
                      axisLine={{ stroke: 'hsl(220, 15%, 18%)' }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }}
                      axisLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(220, 18%, 12%)',
                        border: '1px solid hsl(220, 15%, 18%)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Portfolio Value']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(142, 70%, 45%)"
                      fill="url(#equityGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-border bg-card p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Trade Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Trades</p>
                    <p className="font-mono text-lg font-semibold">{results.totalTrades}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Profit Factor</p>
                    <p className="font-mono text-lg font-semibold">{results.profitFactor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Win</p>
                    <p className="font-mono text-lg font-semibold text-bullish">+{results.avgWin}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Loss</p>
                    <p className="font-mono text-lg font-semibold text-bearish">-{results.avgLoss}%</p>
                  </div>
                </div>
              </Card>

              <Card className="border-border bg-card p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Risk Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Sharpe Ratio</p>
                    <p className="font-mono text-lg font-semibold">{results.sharpeRatio}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Max Drawdown</p>
                    <p className="font-mono text-lg font-semibold text-bearish">-{results.maxDrawdown}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Win/Loss Ratio</p>
                    <p className="font-mono text-lg font-semibold">
                      {(results.avgWin / results.avgLoss).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expectancy</p>
                    <p className="font-mono text-lg font-semibold text-bullish">
                      +{((results.winRate / 100 * results.avgWin) - ((100 - results.winRate) / 100 * results.avgLoss)).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        ) : (
          <Card className="flex h-full items-center justify-center border-border bg-card p-8">
            <div className="text-center">
              <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No Backtest Results</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Configure your strategy parameters and click "Run Backtest" to see historical performance analysis
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BacktestView;
