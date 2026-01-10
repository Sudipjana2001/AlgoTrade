import { TradingSignal } from '@/types/trading';
import { mockSignals, nifty50Stocks } from '@/data/mockData';
import SignalFeed from '@/components/SignalFeed';
import StockChart from '@/components/StockChart';
import IndicatorPanel from '@/components/IndicatorPanel';
import Watchlist from '@/components/Watchlist';
import BacktestCard from '@/components/BacktestCard';

interface DashboardViewProps {
  selectedSignal: TradingSignal | null;
  selectedSymbol: string;
  onSelectSignal: (signal: TradingSignal) => void;
  onSelectStock: (symbol: string) => void;
}

const DashboardView = ({
  selectedSignal,
  selectedSymbol,
  onSelectSignal,
  onSelectStock,
}: DashboardViewProps) => {
  return (
    <div className="grid h-full grid-cols-12 gap-4">
      {/* Left Panel - Watchlist */}
      <div className="col-span-12 md:col-span-2 h-full overflow-hidden">
        <Watchlist
          onSelectStock={onSelectStock}
          selectedSymbol={selectedSymbol}
        />
      </div>

      {/* Center Panel - Chart & Signals */}
      <div className="col-span-12 md:col-span-7 flex flex-col gap-4 overflow-hidden">
        <div className="flex-shrink-0">
          <StockChart signal={selectedSignal || undefined} symbol={selectedSymbol} />
        </div>
        <div className="flex-1 min-h-0">
          <SignalFeed
            onSelectSignal={onSelectSignal}
            selectedSignal={selectedSignal}
          />
        </div>
      </div>

      {/* Right Panel - Indicators & Backtest */}
      <div className="col-span-12 md:col-span-3 flex flex-col gap-4 overflow-y-auto">
        {selectedSignal && (
          <IndicatorPanel indicators={selectedSignal.indicators} />
        )}
        <BacktestCard />
      </div>
    </div>
  );
};

export default DashboardView;
