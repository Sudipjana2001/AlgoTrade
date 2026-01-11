"""
Backtesting Engine for Trading Strategies
Simulates trading strategies on historical data and calculates performance metrics
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from services.data_provider import DataProvider
from services.signal_service import SignalService


class Trade:
    """Represents a single trade"""
    def __init__(self, entry_date, entry_price, exit_date=None, exit_price=None, 
                 position_type="LONG", quantity=0, stop_loss=0, target=0):
        self.entry_date = entry_date
        self.entry_price = entry_price
        self.exit_date = exit_date
        self.exit_price = exit_price
        self.position_type = position_type
        self.quantity = quantity
        self.stop_loss = stop_loss
        self.target = target
        self.pnl = 0
        self.pnl_pct = 0
        self.status = "OPEN"  # OPEN, WIN, LOSS
    
    def close(self, exit_date, exit_price):
        """Close the trade"""
        self.exit_date = exit_date
        self.exit_price = exit_price
        
        if self.position_type == "LONG":
            self.pnl = (exit_price - self.entry_price) * self.quantity
            self.pnl_pct = ((exit_price - self.entry_price) / self.entry_price) * 100
        else:  # SHORT
            self.pnl = (self.entry_price - exit_price) * self.quantity
            self.pnl_pct = ((self.entry_price - exit_price) / self.entry_price) * 100
        
        self.status = "WIN" if self.pnl > 0 else "LOSS"
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "entry_date": self.entry_date.isoformat() if isinstance(self.entry_date, datetime) else self.entry_date,
            "entry_price": float(self.entry_price),
            "exit_date": self.exit_date.isoformat() if isinstance(self.exit_date, datetime) else self.exit_date,
            "exit_price": float(self.exit_price) if self.exit_price else None,
            "position_type": self.position_type,
            "quantity": float(self.quantity),
            "stop_loss": float(self.stop_loss),
            "target": float(self.target),
            "pnl": float(self.pnl),
            "pnl_pct": float(self.pnl_pct),
            "status": self.status
        }


class BacktestEngine:
    """Main backtesting engine"""
    
    def __init__(self, symbol: str, strategy_name: str, start_date: str, 
                 end_date: str, initial_capital: float = 100000):
        self.symbol = symbol
        self.strategy_name = strategy_name
        self.start_date = start_date
        self.end_date = end_date
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        
        self.data_provider = DataProvider()
        self.signal_service = SignalService()
        
        self.trades: List[Trade] = []
        self.equity_curve: List[Dict] = []
        self.current_position: Optional[Trade] = None
    
    def run(self) -> Dict[str, Any]:
        """Execute the backtest"""
        try:
            # Fetch historical data
            historical_data = self.data_provider.get_ohlcv_data(
                self.symbol,
                period="1y",  # Adjust based on date range
                interval="1d"
            )
            
            if not historical_data or len(historical_data) == 0:
                return {
                    "status": "failed",
                    "error": "No historical data available"
                }
            
            # Convert to DataFrame for easier processing
            df = pd.DataFrame(historical_data)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            # Filter by date range
            start_dt = pd.to_datetime(self.start_date)
            end_dt = pd.to_datetime(self.end_date)
            df = df[(df['timestamp'] >= start_dt) & (df['timestamp'] <= end_dt)]
            
            if len(df) == 0:
                return {
                    "status": "failed",
                    "error": "No data in specified date range"
                }
            
            # Simulate trading day by day
            for idx, row in df.iterrows():
                self._process_day(row)
            
            # Close any open position at the end
            if self.current_position:
                last_row = df.iloc[-1]
                self.current_position.close(last_row['timestamp'], last_row['close'])
                self.trades.append(self.current_position)
                self.current_position = None
            
            # Calculate performance metrics
            metrics = self._calculate_metrics()
            
            return {
                "status": "completed",
                "metrics": metrics,
                "trades": [trade.to_dict() for trade in self.trades],
                "equity_curve": self.equity_curve
            }
            
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e)
            }
    
    def _process_day(self, row):
        """Process a single trading day"""
        current_date = row['timestamp']
        current_price = row['close']
        
        # Add to equity curve
        portfolio_value = self.current_capital
        if self.current_position:
            # Calculate unrealized P&L
            if self.current_position.position_type == "LONG":
                unrealized_pnl = (current_price - self.current_position.entry_price) * self.current_position.quantity
            else:
                unrealized_pnl = (self.current_position.entry_price - current_price) * self.current_position.quantity
            portfolio_value += unrealized_pnl
        
        self.equity_curve.append({
            "date": current_date.isoformat() if isinstance(current_date, datetime) else current_date,
            "value": float(portfolio_value)
        })
        
        # Check if we need to exit current position
        if self.current_position:
            should_exit = False
            
            # Check stop loss
            if self.current_position.position_type == "LONG":
                if current_price <= self.current_position.stop_loss:
                    should_exit = True
                elif current_price >= self.current_position.target:
                    should_exit = True
            
            if should_exit:
                self.current_position.close(current_date, current_price)
                self.current_capital += self.current_position.pnl
                self.trades.append(self.current_position)
                self.current_position = None
        
        # Generate signal for this day (if no position)
        if not self.current_position:
            signal = self._generate_signal_for_day(row)
            
            if signal and signal.get('type') in ['BUY', 'SELL']:
                # Enter position
                position_type = "LONG" if signal['type'] == 'BUY' else "SHORT"
                
                # Calculate position size (simple: use 95% of capital)
                quantity = (self.current_capital * 0.95) / current_price
                
                self.current_position = Trade(
                    entry_date=current_date,
                    entry_price=current_price,
                    position_type=position_type,
                    quantity=quantity,
                    stop_loss=signal.get('stop_loss', current_price * 0.97),
                    target=signal.get('target', current_price * 1.03)
                )
    
    def _generate_signal_for_day(self, row) -> Optional[Dict]:
        """Generate trading signal for a specific day using strategy"""
        # This is a simplified version - in reality, we'd need historical data
        # up to this point to calculate indicators properly
        
        # For now, use a simple RSI-based strategy as example
        # In production, this should use the actual strategy from signal_service
        
        try:
            # Create a mock data structure with enough history
            # This is a placeholder - real implementation would maintain rolling window
            
            if self.strategy_name == "RSI+MACD":
                # Simple RSI logic (placeholder)
                close_price = row['close']
                
                # Generate buy signal if price is "low" (simplified)
                # Real implementation would calculate actual RSI
                return {
                    'type': 'BUY',
                    'stop_loss': close_price * 0.97,
                    'target': close_price * 1.05,
                    'confidence': 0.7
                }
            
            return None
            
        except Exception as e:
            return None
    
    def _calculate_metrics(self) -> Dict[str, Any]:
        """Calculate performance metrics"""
        if len(self.trades) == 0:
            return self._empty_metrics()
        
        # Basic metrics
        winning_trades = [t for t in self.trades if t.status == "WIN"]
        losing_trades = [t for t in self.trades if t.status == "LOSS"]
        
        total_trades = len(self.trades)
        winning_count = len(winning_trades)
        losing_count = len(losing_trades)
        
        win_rate = (winning_count / total_trades * 100) if total_trades > 0 else 0
        
        # P&L metrics
        total_pnl = sum(t.pnl for t in self.trades)
        final_capital = self.initial_capital + total_pnl
        total_return_pct = (total_pnl / self.initial_capital) * 100
        
        avg_win = np.mean([t.pnl for t in winning_trades]) if winning_trades else 0
        avg_loss = np.mean([t.pnl for t in losing_trades]) if losing_trades else 0
        
        # Profit factor
        gross_profit = sum(t.pnl for t in winning_trades)
        gross_loss = abs(sum(t.pnl for t in losing_trades))
        profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else 0
        
        # Maximum drawdown
        max_drawdown, max_drawdown_pct = self._calculate_max_drawdown()
        
        # Sharpe ratio (simplified)
        sharpe_ratio = self._calculate_sharpe_ratio()
        
        return {
            "total_return": float(total_pnl),
            "total_return_pct": float(total_return_pct),
            "win_rate": float(win_rate),
            "profit_factor": float(profit_factor),
            "sharpe_ratio": float(sharpe_ratio),
            "max_drawdown": float(max_drawdown),
            "max_drawdown_pct": float(max_drawdown_pct),
            "total_trades": total_trades,
            "winning_trades": winning_count,
            "losing_trades": losing_count,
            "avg_win": float(avg_win),
            "avg_loss": float(avg_loss),
            "final_capital": float(final_capital)
        }
    
    def _calculate_max_drawdown(self):
        """Calculate maximum drawdown from equity curve"""
        if len(self.equity_curve) == 0:
            return 0, 0
        
        values = [point['value'] for point in self.equity_curve]
        peak = values[0]
        max_dd = 0
        max_dd_pct = 0
        
        for value in values:
            if value > peak:
                peak = value
            dd = peak - value
            dd_pct = (dd / peak) * 100 if peak > 0 else 0
            
            if dd > max_dd:
                max_dd = dd
                max_dd_pct = dd_pct
        
        return max_dd, max_dd_pct
    
    def _calculate_sharpe_ratio(self):
        """Calculate Sharpe ratio"""
        if len(self.trades) < 2:
            return 0
        
        returns = [t.pnl_pct for t in self.trades]
        
        if len(returns) == 0:
            return 0
        
        avg_return = np.mean(returns)
        std_return = np.std(returns)
        
        if std_return == 0:
            return 0
        
        # Annualized Sharpe (assuming 252 trading days)
        sharpe = (avg_return / std_return) * np.sqrt(252)
        
        return sharpe
    
    def _empty_metrics(self):
        """Return empty metrics structure"""
        return {
            "total_return": 0,
            "total_return_pct": 0,
            "win_rate": 0,
            "profit_factor": 0,
            "sharpe_ratio": 0,
            "max_drawdown": 0,
            "max_drawdown_pct": 0,
            "total_trades": 0,
            "winning_trades": 0,
            "losing_trades": 0,
            "avg_win": 0,
            "avg_loss": 0,
            "final_capital": float(self.initial_capital)
        }
