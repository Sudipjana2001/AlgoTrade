import { useEffect, useState } from 'react';
import { getMarketStatus } from '@/data/mockData';
import { Activity, Clock, TrendingUp } from 'lucide-react';

const MarketStatusBar = () => {
  const [status, setStatus] = useState(getMarketStatus());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getMarketStatus());
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

  return (
    <div className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${status.isOpen ? 'bg-bullish pulse-live' : 'bg-muted-foreground'}`} />
          <span className="text-sm font-medium">
            {status.isOpen ? 'Market Open' : 'Market Closed'}
          </span>
          <span className="text-xs text-muted-foreground">({status.session})</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono">{formatTime(currentTime)} IST</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">NIFTY 50</span>
            <span className="font-mono text-sm font-semibold text-bullish">23,465.60</span>
            <span className="text-xs text-bullish">+0.82%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">BANK NIFTY</span>
            <span className="font-mono text-sm font-semibold text-bearish">50,234.15</span>
            <span className="text-xs text-bearish">-0.34%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-bullish" />
          <span>{status.nextEvent}</span>
        </div>
      </div>
    </div>
  );
};

export default MarketStatusBar;
