import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationPanel from './NotificationPanel';
import SettingsDialog from './SettingsDialog';
import UserMenu from './UserMenu';

export type PageType = 'dashboard' | 'signals' | 'backtest' | 'screener';

interface HeaderProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

const Header = ({ currentPage, onNavigate }: HeaderProps) => {
  const navItems: { label: string; page: PageType }[] = [
    { label: 'Dashboard', page: 'dashboard' },
    { label: 'Signals', page: 'signals' },
    { label: 'Backtest', page: 'backtest' },
    { label: 'Screener', page: 'screener' },
  ];

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
        {navItems.map((item) => (
          <Button
            key={item.page}
            variant={currentPage === item.page ? 'secondary' : 'ghost'}
            size="sm"
            className="text-sm"
            onClick={() => onNavigate(item.page)}
          >
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <NotificationPanel />
        <SettingsDialog />
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
