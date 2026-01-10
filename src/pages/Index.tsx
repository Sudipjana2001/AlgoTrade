import { useState } from 'react';
import { TradingSignal } from '@/types/trading';
import { mockSignals } from '@/data/mockData';
import Header, { PageType } from '@/components/Header';
import MarketStatusBar from '@/components/MarketStatusBar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import DashboardView from '@/components/views/DashboardView';
import SignalsView from '@/components/views/SignalsView';
import BacktestView from '@/components/views/BacktestView';
import ScreenerView from '@/components/views/ScreenerView';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
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
    // Switch to dashboard when selecting a stock from screener
    if (currentPage === 'screener') {
      setCurrentPage('dashboard');
    }
  };

  const handleSelectSignal = (signal: TradingSignal) => {
    setSelectedSignal(signal);
    setSelectedSymbol(signal.stock.symbol);
    // Switch to dashboard when selecting a signal
    if (currentPage === 'signals') {
      setCurrentPage('dashboard');
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardView
            selectedSignal={selectedSignal}
            selectedSymbol={selectedSymbol}
            onSelectSignal={handleSelectSignal}
            onSelectStock={handleSelectStock}
          />
        );
      case 'signals':
        return <SignalsView onSelectSignal={handleSelectSignal} />;
      case 'backtest':
        return <BacktestView />;
      case 'screener':
        return <ScreenerView onSelectStock={handleSelectStock} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <DisclaimerBanner />
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <MarketStatusBar />

      <main className="flex-1 overflow-hidden p-4">
        {renderCurrentPage()}
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
