import { useState } from 'react';
import { TradingSignal } from '@/types/trading';
import { mockSignals, nifty50Stocks } from '@/data/mockData';
import Header from '@/components/Header';
import MarketStatusBar from '@/components/MarketStatusBar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import SignalFeed from '@/components/SignalFeed';
import StockChart from '@/components/StockChart';
import IndicatorPanel from '@/components/IndicatorPanel';
import Watchlist from '@/components/Watchlist';
import BacktestCard from '@/components/BacktestCard';

const Index = () => {
  const [selectedSignal, setSelectedSignal] = useState<TradingSignal | null>(mockSignals[0]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');

  const handleSelectStock = (symbol: string) => {
    setSelectedSymbol(symbol);
    const signal = mockSignals.find((s) => s.stock.symbol === symbol);
    if (signal) {
      setSelectedSignal(signal);
    } else {
      setSelectedSignal(null);
    }
  };

  const handleSelectSignal = (signal: TradingSignal) => {
    setSelectedSignal(signal);
    setSelectedSymbol(signal.stock.symbol);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <DisclaimerBanner />
      <Header />
      <MarketStatusBar />

      <main className="flex-1 overflow-hidden p-4">
        <div className="grid h-full grid-cols-12 gap-4">
          {/* Left Panel - Watchlist */}
          <div className="col-span-12 md:col-span-2 h-full overflow-hidden">
            <Watchlist
              onSelectStock={handleSelectStock}
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
                onSelectSignal={handleSelectSignal}
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
      </main>

      {/* Footer Disclaimer */}
      <footer className="border-t border-border bg-card/50 px-4 py-2 text-center">
        <p className="text-[10px] text-muted-foreground">
          © 2026 SignalEdge | Not SEBI registered | Algorithmic signals for educational purposes only | 
          Past performance ≠ future results | Invest responsibly
        </p>
      </footer>
    </div>
  );
};

export default Index;
