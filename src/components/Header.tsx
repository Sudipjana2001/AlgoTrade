import { Bell, Settings, User, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card/80 px-6 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">SignalEdge</h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">NSE • BSE Trading Signals</p>
          </div>
        </div>
        <Badge variant="outline" className="ml-4 text-[10px] border-bullish/30 text-bullish">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-bullish pulse-live" />
          Live
        </Badge>
      </div>

      <nav className="hidden md:flex items-center gap-1">
        {['Dashboard', 'Signals', 'Backtest', 'Screener'].map((item, index) => (
          <Button
            key={item}
            variant={index === 0 ? 'secondary' : 'ghost'}
            size="sm"
            className="text-sm"
          >
            {item}
          </Button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-bullish text-[10px] font-bold text-bullish-foreground">
            3
          </span>
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
