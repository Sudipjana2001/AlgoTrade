import { IndicatorSnapshot } from '@/types/trading';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface IndicatorPanelProps {
  indicators: IndicatorSnapshot;
}

const IndicatorPanel = ({ indicators }: IndicatorPanelProps) => {
  const getRSIColor = (rsi: number) => {
    if (rsi >= 70) return 'text-bearish';
    if (rsi <= 30) return 'text-bullish';
    return 'text-foreground';
  };

  const getRSILabel = (rsi: number) => {
    if (rsi >= 70) return 'Overbought';
    if (rsi <= 30) return 'Oversold';
    return 'Neutral';
  };

  const getMACDSignal = () => {
    if (indicators.macd.histogram > 0) return { label: 'Bullish', color: 'text-bullish' };
    if (indicators.macd.histogram < 0) return { label: 'Bearish', color: 'text-bearish' };
    return { label: 'Neutral', color: 'text-muted-foreground' };
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const macdSignal = getMACDSignal();

  return (
    <Card className="border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Technical Indicators
      </h3>

      <div className="space-y-4">
        {/* RSI */}
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">RSI (14)</span>
            <span className={cn('text-xs', getRSIColor(indicators.rsi))}>{getRSILabel(indicators.rsi)}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={cn('font-mono text-lg font-semibold', getRSIColor(indicators.rsi))}>
              {formatNumber(indicators.rsi, 1)}
            </span>
            <div className="flex-1">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-bullish via-neutral to-bearish"
                  style={{ width: '100%' }}
                />
                <div
                  className="absolute top-0 h-full w-1 bg-foreground"
                  style={{ left: `${indicators.rsi}%`, transform: 'translateX(-50%)' }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>30</span>
                <span>50</span>
                <span>70</span>
              </div>
            </div>
          </div>
        </div>

        {/* MACD */}
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">MACD (12,26,9)</span>
            <span className={cn('text-xs', macdSignal.color)}>{macdSignal.label}</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-muted-foreground">MACD</span>
              <p className="font-mono text-sm">{formatNumber(indicators.macd.value)}</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground">Signal</span>
              <p className="font-mono text-sm">{formatNumber(indicators.macd.signal)}</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground">Histogram</span>
              <p className={cn('font-mono text-sm font-semibold', macdSignal.color)}>
                {formatNumber(indicators.macd.histogram)}
              </p>
            </div>
          </div>
        </div>

        {/* Moving Averages */}
        <div className="rounded-lg bg-secondary/50 p-3">
          <span className="text-xs text-muted-foreground">Moving Averages</span>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs">EMA 20</span>
              <span className="font-mono text-xs">{formatCurrency(indicators.ema20)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs">EMA 50</span>
              <span className="font-mono text-xs">{formatCurrency(indicators.ema50)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs">SMA 200</span>
              <span className="font-mono text-xs">{formatCurrency(indicators.sma200)}</span>
            </div>
          </div>
        </div>

        {/* Bollinger Bands */}
        <div className="rounded-lg bg-secondary/50 p-3">
          <span className="text-xs text-muted-foreground">Bollinger Bands (20,2)</span>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-bullish">Upper</span>
              <span className="font-mono text-xs">{formatCurrency(indicators.bollingerBands.upper)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs">Middle</span>
              <span className="font-mono text-xs">{formatCurrency(indicators.bollingerBands.middle)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-bearish">Lower</span>
              <span className="font-mono text-xs">{formatCurrency(indicators.bollingerBands.lower)}</span>
            </div>
          </div>
        </div>

        {/* VWAP & ATR */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-secondary/50 p-3">
            <span className="text-xs text-muted-foreground">VWAP</span>
            <p className="mt-1 font-mono text-sm font-semibold">{formatCurrency(indicators.vwap)}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <span className="text-xs text-muted-foreground">ATR (14)</span>
            <p className="mt-1 font-mono text-sm font-semibold">{formatNumber(indicators.atr)}</p>
          </div>
        </div>

        {/* Volume Spike */}
        <div className={cn(
          'flex items-center justify-between rounded-lg p-3',
          indicators.volumeSpike ? 'bg-bullish-muted' : 'bg-secondary/50'
        )}>
          <span className="text-xs text-muted-foreground">Volume Spike</span>
          <span className={cn(
            'text-xs font-semibold',
            indicators.volumeSpike ? 'text-bullish' : 'text-muted-foreground'
          )}>
            {indicators.volumeSpike ? 'Detected' : 'Normal'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default IndicatorPanel;
