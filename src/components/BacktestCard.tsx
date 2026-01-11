import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBacktestResults } from '@/hooks/useBacktest';
import { Skeleton } from '@/components/ui/skeleton';

const BacktestCard = () => {
    // Fetch latest backtest result
    const { data: resultsList, isLoading } = useBacktestResults({ limit: 1 });
    const result = resultsList?.[0];

    if (isLoading) {
        return (
            <Card className="border-border bg-card p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                </div>
            </Card>
        );
    }

    // Default empty state if no backtests found
    if (!result) {
        return (
            <Card className="border-border bg-card p-4 h-full flex flex-col justify-center items-center text-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No backtest data available</p>
            </Card>
        );
    }

    const metrics = [
        {
            label: 'Win Rate',
            value: `${result.win_rate?.toFixed(1) || 0}%`,
            icon: Target,
            color: (result.win_rate || 0) >= 50 ? 'text-bullish' : 'text-bearish',
            bgColor: (result.win_rate || 0) >= 50 ? 'bg-bullish/10' : 'bg-bearish/10',
        },
        {
            label: 'Total Return',
            value: `${result.total_return_pct ? (result.total_return_pct >= 0 ? '+' : '') : ''}${result.total_return_pct?.toFixed(2) || 0}%`,
            icon: TrendingUp,
            color: (result.total_return_pct || 0) >= 0 ? 'text-bullish' : 'text-bearish',
            bgColor: (result.total_return_pct || 0) >= 0 ? 'bg-bullish/10' : 'bg-bearish/10',
        },
        {
            label: 'Sharpe Ratio',
            value: result.sharpe_ratio?.toFixed(2) || '0.00',
            icon: Activity,
            color: (result.sharpe_ratio || 0) >= 1.5 ? 'text-bullish' : (result.sharpe_ratio || 0) >= 1 ? 'text-neutral' : 'text-bearish',
            bgColor: (result.sharpe_ratio || 0) >= 1.5 ? 'bg-bullish/10' : (result.sharpe_ratio || 0) >= 1 ? 'bg-neutral/10' : 'bg-bearish/10',
        },
        {
            label: 'Max Drawdown',
            value: `-${result.max_drawdown_pct?.toFixed(2) || 0}%`,
            icon: TrendingDown,
            color: (result.max_drawdown_pct || 0) <= 10 ? 'text-bullish' : (result.max_drawdown_pct || 0) <= 20 ? 'text-neutral' : 'text-bearish',
            bgColor: (result.max_drawdown_pct || 0) <= 10 ? 'bg-bullish/10' : (result.max_drawdown_pct || 0) <= 20 ? 'bg-neutral/10' : 'bg-bearish/10',
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
                    {result.symbol} • {result.strategy_name}
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
                    <p className="font-mono text-sm font-semibold">{result.total_trades || 0}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Profit Factor</p>
                    <p className="font-mono text-sm font-semibold">{result.profit_factor?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Avg Win</p>
                    <p className="font-mono text-sm font-semibold text-bullish">+{result.avg_win?.toFixed(2) || 0}%</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Avg Loss</p>
                    <p className="font-mono text-sm font-semibold text-bearish">-{Math.abs(result.avg_loss || 0).toFixed(2)}%</p>
                </div>
            </div>
        </Card>
    );
};

export default BacktestCard;
