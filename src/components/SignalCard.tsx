import { TradingSignal } from '@/types/trading';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Minus, Target, Shield, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignalCardProps {
  signal: TradingSignal;
  onClick?: () => void;
}

const SignalCard = ({ signal, onClick }: SignalCardProps) => {
  const getSignalConfig = () => {
    switch (signal.signal) {
      case 'BUY':
        return {
          icon: ArrowUpRight,
          bgClass: 'bg-bullish-muted border-bullish/30',
          textClass: 'text-bullish',
          glowClass: 'glow-bullish',
        };
      case 'SELL':
        return {
          icon: ArrowDownRight,
          bgClass: 'bg-bearish-muted border-bearish/30',
          textClass: 'text-bearish',
          glowClass: 'glow-bearish',
        };
      default:
        return {
          icon: Minus,
          bgClass: 'bg-neutral-muted border-neutral/30',
          textClass: 'text-neutral',
          glowClass: '',
        };
    }
  };

  const config = getSignalConfig();
  const SignalIcon = config.icon;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'text-confidence-high';
    if (confidence >= 50) return 'text-confidence-medium';
    return 'text-confidence-low';
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <Card
      className={cn(
        'group cursor-pointer border p-4 transition-all duration-300 hover:scale-[1.02]',
        config.bgClass,
        'hover:border-primary/50'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            signal.signal === 'BUY' ? 'bg-bullish/20' : signal.signal === 'SELL' ? 'bg-bearish/20' : 'bg-neutral/20'
          )}>
            <SignalIcon className={cn('h-5 w-5', config.textClass)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{signal.stock.symbol}</span>
              <Badge variant={signal.signal === 'BUY' ? 'bullish' : signal.signal === 'SELL' ? 'bearish' : 'neutral'}>
                {signal.signal}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{signal.stock.name}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatTimestamp(signal.timestamp)}</span>
          </div>
          <Badge variant="secondary" className="mt-1 text-[10px]">
            {signal.timeframe}
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-background/50 p-3">
        <div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            Entry
          </div>
          <p className="font-mono text-sm font-medium">{formatPrice(signal.entryPrice)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Shield className="h-3 w-3" />
            Stop Loss
          </div>
          <p className="font-mono text-sm font-medium text-bearish">{formatPrice(signal.stopLoss)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Target className="h-3 w-3" />
            Target
          </div>
          <p className="font-mono text-sm font-medium text-bullish">{formatPrice(signal.target)}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] text-muted-foreground">Confidence</span>
            <div className="flex items-center gap-1">
              <span className={cn('font-mono text-sm font-semibold', getConfidenceColor(signal.confidence))}>
                {signal.confidence}%
              </span>
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full', getConfidenceColor(signal.confidence).replace('text-', 'bg-'))}
                  style={{ width: `${signal.confidence}%` }}
                />
              </div>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Risk:Reward</span>
            <p className="font-mono text-sm font-semibold">1:{signal.riskReward.toFixed(1)}</p>
          </div>
        </div>
        
        <div className={cn(
          'flex items-center gap-1 text-xs',
          signal.stock.change >= 0 ? 'text-bullish' : 'text-bearish'
        )}>
          {signal.stock.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {signal.stock.changePercent.toFixed(2)}%
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
        {signal.reasoning}
      </p>
    </Card>
  );
};

export default SignalCard;
