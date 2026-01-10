import { mockBacktestResults } from '@/data/mockData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Target, Activity, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

const BacktestCard = () => {
  const results = mockBacktestResults;

  const metrics = [
    {
      label: 'Win Rate',
      value: `${results.winRate}%`,
      icon: Target,
      color: results.winRate >= 50 ? 'text-bullish' : 'text-bearish',
      bgColor: results.winRate >= 50 ? 'bg-bullish/10' : 'bg-bearish/10',
    },
    {
      label: 'Total Return',
      value: `${results.totalReturn >= 0 ? '+' : ''}${results.totalReturn}%`,
      icon: results.totalReturn >= 0 ? TrendingUp : TrendingDown,
      color: results.totalReturn >= 0 ? 'text-bullish' : 'text-bearish',
      bgColor: results.totalReturn >= 0 ? 'bg-bullish/10' : 'bg-bearish/10',
    },
    {
      label: 'Sharpe Ratio',
      value: results.sharpeRatio.toFixed(2),
      icon: Activity,
      color: results.sharpeRatio >= 1.5 ? 'text-bullish' : results.sharpeRatio >= 1 ? 'text-neutral' : 'text-bearish',
      bgColor: results.sharpeRatio >= 1.5 ? 'bg-bullish/10' : results.sharpeRatio >= 1 ? 'bg-neutral/10' : 'bg-bearish/10',
    },
    {
      label: 'Max Drawdown',
      value: `-${results.maxDrawdown}%`,
      icon: TrendingDown,
      color: results.maxDrawdown <= 10 ? 'text-bullish' : results.maxDrawdown <= 20 ? 'text-neutral' : 'text-bearish',
      bgColor: results.maxDrawdown <= 10 ? 'bg-bullish/10' : results.maxDrawdown <= 20 ? 'bg-neutral/10' : 'bg-bearish/10',
    },
  ];

  return (
    <Card className="border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Strategy Performance</h3>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          Last 90 Days
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={cn('rounded-lg p-3', metric.bgColor)}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn('h-3.5 w-3.5', metric.color)} />
                <span className="text-[10px] text-muted-foreground">{metric.label}</span>
              </div>
              <p className={cn('mt-1 font-mono text-lg font-semibold', metric.color)}>
                {metric.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 rounded-lg bg-secondary/50 p-3">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Total Trades</p>
          <p className="font-mono text-sm font-semibold">{results.totalTrades}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Profit Factor</p>
          <p className="font-mono text-sm font-semibold">{results.profitFactor}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Avg Win</p>
          <p className="font-mono text-sm font-semibold text-bullish">+{results.avgWin}%</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Avg Loss</p>
          <p className="font-mono text-sm font-semibold text-bearish">-{results.avgLoss}%</p>
        </div>
      </div>
    </Card>
  );
};

export default BacktestCard;
