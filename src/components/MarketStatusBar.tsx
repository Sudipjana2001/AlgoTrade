import { useState, useEffect } from 'react';
import { useMarketStatus, useIndices } from '@/hooks/useMarketStatus';
import { Activity, Clock } from 'lucide-react';

const MarketStatusBar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch market status with auto-refresh
  const { data: status, isLoading: statusLoading } = useMarketStatus();

  // Fetch market indices
  const { data: indices, isLoading: indicesLoading } = useIndices();

  // Update local time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  };

  // Default values while loading
  const isOpen = status?.isOpen ?? false;
  const session = status?.session ?? 'Loading...';
  const nextEvent = status?.nextEvent ?? 'Fetching status...';

  // Extract index data
  const nifty = indices?.find(idx => idx.name === 'NIFTY');
  const bankNifty = indices?.find(idx => idx.name === 'BANKNIFTY');

  return (
    <div className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isOpen ? 'bg-bullish pulse-live' : 'bg-muted-foreground'}`} />
          <span className="text-sm font-medium">
            {isOpen ? 'Market Open' : 'Market Closed'}
          </span>
          <span className="text-xs text-muted-foreground">({session})</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono">{formatTime(currentTime)} IST</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          {/* NIFTY 50 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">NIFTY 50</span>
            {indicesLoading ? (
              <span className="text-xs text-muted-foreground">Loading...</span>
            ) : nifty ? (
              <>
                <span className={`font-mono text-sm font-semibold ${nifty.change >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                  {nifty.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-xs ${nifty.changePercent >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                  {nifty.changePercent >= 0 ? '+' : ''}{nifty.changePercent.toFixed(2)}%
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">N/A</span>
            )}
          </div>

          {/* BANK NIFTY */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">BANK NIFTY</span>
            {indicesLoading ? (
              <span className="text-xs text-muted-foreground">Loading...</span>
            ) : bankNifty ? (
              <>
                <span className={`font-mono text-sm font-semibold ${bankNifty.change >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                  {bankNifty.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-xs ${bankNifty.changePercent >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                  {bankNifty.changePercent >= 0 ? '+' : ''}{bankNifty.changePercent.toFixed(2)}%
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">N/A</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-bullish" />
          <span>{nextEvent}</span>
        </div>
      </div>
    </div>
  );
};

export default MarketStatusBar;
