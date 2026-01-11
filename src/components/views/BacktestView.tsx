import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  Play,
  Settings2,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRunBacktest } from '@/hooks/useBacktest';
import { BacktestResult, Trade } from '@/services/backtestService';
import { format } from 'date-fns';

const BacktestView = () => {
  const [config, setConfig] = useState({
    symbol: 'RELIANCE.NS',
    strategyName: 'RSI+MACD',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    initialCapital: 100000,
  });

  const [result, setResult] = useState<BacktestResult | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const runBacktest = useRunBacktest();

  const handleRunBacktest = async () => {
    runBacktest.mutate(
      {
        symbol: config.symbol,
        strategy_name: config.strategyName,
        start_date: config.startDate,
        end_date: config.endDate,
        initial_capital: config.initialCapital,
      },
      {
        onSuccess: (data) => {
          if (data.status === 'completed') {
            setResult(data);
          }
        },
      }
    );
  };

  const metrics = result
    ? [
        {
          label: 'Win Rate',
          value: `${result.win_rate?.toFixed(1) || 0}%`,
          icon: Target,
          color: (result.win_rate || 0) >= 50 ? 'text-bullish' : 'text-bearish',
        },
        {
          label: 'Total Return',
          value: `${result.total_return_pct ? (result.total_return_pct >= 0 ? '+' : '') : ''}${result.total_return_pct?.toFixed(2) || 0}%`,
          icon: TrendingUp,
          color: (result.total_return_pct || 0) >= 0 ? 'text-bullish' : 'text-bearish',
        },
        {
          label: 'Sharpe Ratio',
          value: result.sharpe_ratio?.toFixed(2) || '0.00',
          icon: Activity,
          color: (result.sharpe_ratio || 0) >= 1.5 ? 'text-bullish' : 'text-neutral',
        },
        {
          label: 'Max Drawdown',
          value: `-${result.max_drawdown_pct?.toFixed(2) || 0}%`,
          icon: TrendingDown,
          color: 'text-bearish',
        },
      ]
    : [];

  return (
    <div className="flex h-full gap-4">
      {/* Configuration Panel */}
      <Card className="w-80 flex-shrink-0 border-border bg-card p-4 overflow-y-auto h-full">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Configuration</h3>
        </div>

        <div className="space-y-5">
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
                <SelectItem value="RELIANCE.NS">RELIANCE</SelectItem>
                <SelectItem value="TCS.NS">TCS</SelectItem>
                <SelectItem value="HDFCBANK.NS">HDFCBANK</SelectItem>
                <SelectItem value="INFY.NS">INFY</SelectItem>
                <SelectItem value="SBIN.NS">SBIN</SelectItem>
                <SelectItem value="ITC.NS">ITC</SelectItem>
                <SelectItem value="BHARTIARTL.NS">BHARTIARTL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Strategy Selection */}
          <div className="space-y-2">
            <Label>Strategy</Label>
            <Select
              value={config.strategyName}
              onValueChange={(v) => setConfig({ ...config, strategyName: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RSI+MACD">RSI + MACD</SelectItem>
                <SelectItem value="Bollinger Bands+Volume">Bollinger Bands + Volume</SelectItem>
                <SelectItem value="EMA Crossover">EMA Crossover</SelectItem>
                <SelectItem value="VWAP Reversal">VWAP Reversal</SelectItem>
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

          <Button
            className="w-full mt-4"
            onClick={handleRunBacktest}
            disabled={runBacktest.isPending}
            size="lg"
          >
            {runBacktest.isPending ? (
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
      <div className="flex-1 h-full overflow-hidden flex flex-col">
        {result && result.status === 'completed' ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
             <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{result.symbol} Analysis</h2>
                  <p className="text-muted-foreground text-sm">
                    {result.strategy_name} • {result.start_date} to {result.end_date}
                  </p>
                </div>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="trades">Trades ({result.total_trades})</TabsTrigger>
                </TabsList>
             </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <TabsContent value="overview" className="space-y-4 data-[state=active]:block h-full mt-0">
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

                {/* Equity Curve */}
                <Card className="border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Equity Curve</h3>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      Final: ₹{result.final_capital?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </Badge>
                  </div>

                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.equity_curve || []}>
                        <defs>
                          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(str) => {
                            const date = new Date(str);
                            return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                          }}
                          minTickGap={30}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                          labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}
                          formatter={(value: number) => [`₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 'Portfolio Value']}
                          labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
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
                    <h4 className="text-sm font-medium text-muted-foreground mb-4">Trade Statistics</h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Trades</p>
                        <p className="font-mono text-lg font-semibold">{result.total_trades || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Profit Factor</p>
                        <p className="font-mono text-lg font-semibold">{result.profit_factor?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Win</p>
                        <p className="font-mono text-lg font-semibold text-bullish">+{result.avg_win?.toFixed(2) || 0}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Loss</p>
                        <p className="font-mono text-lg font-semibold text-bearish">-{Math.abs(result.avg_loss || 0).toFixed(2)}%</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-border bg-card p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-4">Risk Metrics</h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                      <div>
                        <p className="text-xs text-muted-foreground">Sharpe Ratio</p>
                        <p className="font-mono text-lg font-semibold">{result.sharpe_ratio?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Max Drawdown</p>
                        <p className="font-mono text-lg font-semibold text-bearish">-{result.max_drawdown_pct?.toFixed(2) || 0}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Winning Trades</p>
                        <p className="font-mono text-lg font-semibold text-bullish">{result.winning_trades || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Losing Trades</p>
                        <p className="font-mono text-lg font-semibold text-bearish">{result.losing_trades || 0}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="trades" className="mt-0 h-full">
                <Card className="border-border bg-card overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Entry Price</TableHead>
                          <TableHead className="text-right">Exit Price</TableHead>
                          <TableHead className="text-right">PnL</TableHead>
                          <TableHead className="text-right">Return %</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.trades?.map((trade: Trade, index: number) => (
                          <TableRow key={index} className="group hover:bg-muted/50">
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {new Date(trade.entry_date).toLocaleDateString('en-IN')}
                            </TableCell>
                            <TableCell>
                              <Badge variant={trade.position_type === 'LONG' ? 'default' : 'secondary'} className="text-[10px]">
                                {trade.position_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">₹{trade.entry_price.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-mono">
                                {trade.exit_price ? `₹${trade.exit_price.toFixed(2)}` : '-'}
                            </TableCell>
                            <TableCell className={cn("text-right font-mono font-medium", trade.pnl > 0 ? "text-bullish" : trade.pnl < 0 ? "text-bearish" : "")}>
                              {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                            </TableCell>
                            <TableCell className={cn("text-right font-mono", trade.pnl_pct > 0 ? "text-bullish" : trade.pnl_pct < 0 ? "text-bearish" : "")}>
                              {trade.pnl_pct.toFixed(2)}%
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={cn(
                                    "text-[10px]",
                                    trade.status === 'WIN' ? "border-bullish text-bullish bg-bullish/10" : 
                                    trade.status === 'LOSS' ? "border-bearish text-bearish bg-bearish/10" : 
                                    "border-yellow-500 text-yellow-500 bg-yellow-500/10"
                                )}>
                                    {trade.status}
                                </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!result.trades || result.trades.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No trades executed in this period
                                </TableCell>
                            </TableRow>
                        )}
                      </TableBody>
                    </Table>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          <Card className="flex h-full items-center justify-center border-border bg-card p-8">
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full inline-flex mb-4">
                  <BarChart3 className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ready to Backtest</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Select your strategy parameters from the left panel and click "Run Backtest" to generate performance analytics.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BacktestView;
