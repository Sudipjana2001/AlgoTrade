"""
Signal Generation Service
Generates BUY/SELL/HOLD trading signals based on technical indicators.
"""
from typing import Dict, List, Optional, Literal
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

SignalType = Literal['BUY', 'SELL', 'HOLD']


class SignalGenerator:
    """
    Main signal generation class implementing multiple strategies.
    """
    
    def __init__(self):
        self.strategies = {
            'rsi_macd': self._rsi_macd_strategy,
            'bb_volume': self._bollinger_volume_strategy,
            'ema_crossover': self._ema_crossover_strategy,
            'vwap_reversal': self._vwap_reversal_strategy,
        }
    
    def generate_signal(
        self, 
        symbol: str,
        current_price: float,
        indicators: Dict,
        strategy: str = 'combined',
        config: Optional[Dict] = None
    ) -> Dict:
        """
        Generate a trading signal for a stock based on technical indicators.
        
        Returns a dictionary with:
        - signal: 'BUY', 'SELL', or 'HOLD'
        - confidence: 0-100
        - entry_price: float
        - stop_loss: float
        - target: float
        - risk_reward: float
        - reasoning: str
        """
        if strategy == 'combined':
            return self._combined_strategy(symbol, current_price, indicators, config)
        elif strategy in self.strategies:
            return self.strategies[strategy](symbol, current_price, indicators, config)
        else:
            logger.warning(f"Unknown strategy: {strategy}, using combined")
            return self._combined_strategy(symbol, current_price, indicators, config)
    
    def _combined_strategy(self, symbol: str, current_price: float, indicators: Dict, config: Optional[Dict] = None) -> Dict:
        """
        Combined strategy using all indicators with weighted scoring.
        """
        # Calculate individual strategy scores
        rsi_macd_signal = self._rsi_macd_strategy(symbol, current_price, indicators, config)
        bb_volume_signal = self._bollinger_volume_strategy(symbol, current_price, indicators, config)
        ema_signal = self._ema_crossover_strategy(symbol, current_price, indicators, config)
        vwap_signal = self._vwap_reversal_strategy(symbol, current_price, indicators, config)
        
        # Aggregate signals with weights
        signals = [
            (rsi_macd_signal, 0.35),  # Highest weight - momentum indicators
            (bb_volume_signal, 0.25),  # Volatility + volume
            (ema_signal, 0.25),        # Trend
            (vwap_signal, 0.15),       # Institutional activity
        ]
        
        # Calculate weighted confidence for each signal type
        buy_score = sum(sig['confidence'] * weight for sig, weight in signals if sig['signal'] == 'BUY')
        sell_score = sum(sig['confidence'] * weight for sig, weight in signals if sig['signal'] == 'SELL')
        hold_score = sum(sig['confidence'] * weight for sig, weight in signals if sig['signal'] == 'HOLD')
        
        # Determine final signal
        max_score = max(buy_score, sell_score, hold_score)
        
        if max_score < 40:  # Too weak, hold
            final_signal = 'HOLD'
            final_confidence = int(hold_score if hold_score > 0 else 30)
        elif buy_score == max_score:
            final_signal = 'BUY'
            final_confidence = int(min(buy_score, 100))
        elif sell_score == max_score:
            final_signal = 'SELL'
            final_confidence = int(min(sell_score, 100))
        else:
            final_signal = 'HOLD'
            final_confidence = int(max_score)
        
        # Calculate entry, stop loss, target
        entry, stop_loss, target = self._calculate_prices(
            current_price, 
            final_signal, 
            indicators.get('atr', current_price * 0.02)
        )
        
        risk_reward = self._calculate_risk_reward(entry, stop_loss, target, final_signal)
        
        # Generate reasoning
        reasoning = self._generate_reasoning(final_signal, indicators, current_price)
        
        return {
            'symbol': symbol,
            'signal': final_signal,
            'confidence': final_confidence,
            'entry_price': round(entry, 2),
            'stop_loss': round(stop_loss, 2),
            'target': round(target, 2),
            'risk_reward': round(risk_reward, 2),
            'reasoning': reasoning,
            'timestamp': datetime.now().isoformat(),
            'timeframe': '1d',
        }
    
    def _rsi_macd_strategy(self, symbol: str, current_price: float, indicators: Dict, config: Optional[Dict] = None) -> Dict:
        """
        RSI + MACD momentum strategy.
        """
        # Load params
        params = config.get('rsi_macd', {}) if config else {}
        rsi_period = params.get('rsi_period', 14) 
        rsi_overbought = params.get('rsi_overbought', 70)
        rsi_oversold = params.get('rsi_oversold', 30)

        rsi = indicators.get('rsi', 50)
        macd = indicators.get('macd', {})
        macd_histogram = macd.get('histogram', 0)
        volume_spike = indicators.get('volumeSpike', False)
        
        confidence = 50  # Base confidence
        
        # RSI contribution
        if rsi < rsi_oversold:  # Oversold
            signal = 'BUY'
            confidence += 20
        elif rsi < (rsi_oversold + 10):
            signal = 'BUY'
            confidence += 10
        elif rsi > rsi_overbought:  # Overbought
            signal = 'SELL'
            confidence += 20
        elif rsi > (rsi_overbought - 10):
            signal = 'SELL'
            confidence += 10
        else:
            signal = 'HOLD'
            confidence = 40
        
        # MACD contribution
        if macd_histogram > 0 and signal == 'BUY':
            confidence += 15
        elif macd_histogram < 0 and signal == 'SELL':
            confidence += 15
        elif abs(macd_histogram) < 1:
            confidence = max(confidence - 10, 30)
        
        # Volume spike bonus
        if volume_spike and signal in ['BUY', 'SELL']:
            confidence += 10
        
        confidence = min(confidence, 100)
        
        entry, stop_loss, target = self._calculate_prices(
            current_price, signal, indicators.get('atr', current_price * 0.02)
        )
        
        return {
            'symbol': symbol,
            'signal': signal,
            'confidence': confidence,
            'entry_price': entry,
            'stop_loss': stop_loss,
            'target': target,
            'risk_reward': self._calculate_risk_reward(entry, stop_loss, target, signal),
            'timestamp': datetime.now().isoformat(),
        }
    
    def _bollinger_volume_strategy(self, symbol: str, current_price: float, indicators: Dict, config: Optional[Dict] = None) -> Dict:
        """
        Bollinger Bands + Volume spike strategy.
        """
        bb = indicators.get('bollingerBands', {})
        upper = bb.get('upper', current_price * 1.02)
        lower = bb.get('lower', current_price * 0.98)
        middle = bb.get('middle', current_price)
        volume_spike = indicators.get('volumeSpike', False)
        
        confidence = 50
        
        # Price position relative to Bollinger Bands
        if current_price <= lower:  # At or below lower band
            signal = 'BUY'
            confidence += 20
        elif current_price < middle:
            signal = 'BUY'
            confidence += 5
        elif current_price >= upper:  # At or above upper band
            signal = 'SELL'
            confidence += 20
        elif current_price > middle:
            signal = 'SELL'
            confidence += 5
        else:
            signal = 'HOLD'
            confidence = 40
        
        # Volume spike confirmation
        if volume_spike and signal != 'HOLD':
            confidence += 15
        
        confidence = min(confidence, 100)
        
        entry, stop_loss, target = self._calculate_prices(
            current_price, signal, indicators.get('atr', current_price * 0.02)
        )
        
        return {
            'symbol': symbol,
            'signal': signal,
            'confidence': confidence,
            'entry_price': entry,
            'stop_loss': stop_loss,
            'target': target,
            'risk_reward': self._calculate_risk_reward(entry, stop_loss, target, signal),
            'timestamp': datetime.now().isoformat(),
        }
    
    def _ema_crossover_strategy(self, symbol: str, current_price: float, indicators: Dict, config: Optional[Dict] = None) -> Dict:
        """
        EMA 20/50 crossover strategy.
        """
        ema20 = indicators.get('ema20', current_price)
        ema50 = indicators.get('ema50', current_price)
        
        confidence = 50
        
        # Determine trend
        if ema20 > ema50 and current_price > ema20:  # Strong uptrend
            signal = 'BUY'
            confidence += 20
        elif ema20 > ema50:  # Uptrend
            signal = 'BUY'
            confidence += 10
        elif ema20 < ema50 and current_price < ema20:  # Strong downtrend
            signal = 'SELL'
            confidence += 20
        elif ema20 < ema50:  # Downtrend
            signal = 'SELL'
            confidence += 10
        else:
            signal = 'HOLD'
            confidence = 45
        
        # Distance from EMAs
        ema_diff = abs(ema20 - ema50) / ema50 * 100
        if ema_diff > 2:  # Strong separation
            confidence += 10
        elif ema_diff < 0.5:  # Very close, potential crossover
            confidence = max(confidence - 15, 30)
        
        confidence = min(confidence, 100)
        
        entry, stop_loss, target = self._calculate_prices(
            current_price, signal, indicators.get('atr', current_price * 0.02)
        )
        
        return {
            'symbol': symbol,
            'signal': signal,
            'confidence': confidence,
            'entry_price': entry,
            'stop_loss': stop_loss,
            'target': target,
            'risk_reward': self._calculate_risk_reward(entry, stop_loss, target, signal),
            'timestamp': datetime.now().isoformat(),
        }
    
    def _vwap_reversal_strategy(self, symbol: str, current_price: float, indicators: Dict, config: Optional[Dict] = None) -> Dict:
        """
        VWAP-based reversal strategy.
        """
        vwap = indicators.get('vwap', current_price)
        rsi = indicators.get('rsi', 50)
        
        confidence = 50
        
        # Price relative to VWAP
        price_diff = (current_price - vwap) / vwap * 100
        
        if price_diff < -2 and rsi < 45:  # Below VWAP with low RSI
            signal = 'BUY'
            confidence += 20
        elif current_price < vwap:
            signal = 'BUY'
            confidence += 8
        elif price_diff > 2 and rsi > 55:  # Above VWAP with high RSI
            signal = 'SELL'
            confidence += 20
        elif current_price > vwap:
            signal = 'SELL'
            confidence += 8
        else:
            signal = 'HOLD'
            confidence = 40
        
        confidence = min(confidence, 100)
        
        entry, stop_loss, target = self._calculate_prices(
            current_price, signal, indicators.get('atr', current_price * 0.02)
        )
        
        return {
            'symbol': symbol,
            'signal': signal,
            'confidence': confidence,
            'entry_price': entry,
            'stop_loss': stop_loss,
            'target': target,
            'risk_reward': self._calculate_risk_reward(entry, stop_loss, target, signal),
            'timestamp': datetime.now().isoformat(),
        }
    
    def _calculate_prices(self, current_price: float, signal: SignalType, atr: float) -> tuple:
        """
        Calculate entry, stop loss, and target prices based on ATR.
        """
        if signal == 'BUY':
            entry = current_price
            stop_loss = entry - (2 * atr)
            target = entry + (3 * atr)
        elif signal == 'SELL':
            entry = current_price
            stop_loss = entry + (2 * atr)
            target = entry - (3 * atr)
        else:  # HOLD
            entry = current_price
            stop_loss = current_price - (1.5 * atr)
            target = current_price + (1.5 * atr)
        
        return entry, stop_loss, target
    
    def _calculate_risk_reward(self, entry: float, stop_loss: float, target: float, signal: SignalType) -> float:
        """
        Calculate risk/reward ratio.
        """
        if signal == 'BUY':
            risk = entry - stop_loss
            reward = target - entry
        elif signal == 'SELL':
            risk = stop_loss - entry
            reward = entry - target
        else:  # HOLD
            return 1.0
        
        if risk <= 0:
            return 0.0
        
        return reward / risk
    
    def _generate_reasoning(self, signal: SignalType, indicators: Dict, current_price: float) -> str:
        """
        Generate human-readable reasoning for the signal.
        """
        reasons = []
        
        rsi = indicators.get('rsi', 50)
        macd = indicators.get('macd', {})
        macd_histogram = macd.get('histogram', 0)
        vwap = indicators.get('vwap', current_price)
        volume_spike = indicators.get('volumeSpike', False)
        bb = indicators.get('bollingerBands', {})
        
        if signal == 'BUY':
            if rsi < 40:
                reasons.append(f"Oversold RSI ({rsi:.1f})")
            if macd_histogram > 0:
                reasons.append("Bullish MACD momentum")
            if current_price < vwap:
                reasons.append("Price below VWAP (support)")
            if current_price <= bb.get('lower', current_price):
                reasons.append("At lower Bollinger Band")
            if volume_spike:
                reasons.append("High volume confirms buying")
        
        elif signal == 'SELL':
            if rsi > 60:
                reasons.append(f"Overbought RSI ({rsi:.1f})")
            if macd_histogram < 0:
                reasons.append("Bearish MACD momentum")
            if current_price > vwap:
                reasons.append("Price above VWAP (resistance)")
            if current_price >= bb.get('upper', current_price):
                reasons.append("At upper Bollinger Band")
            if volume_spike:
                reasons.append("High volume confirms selling")
        
        else:  # HOLD
            reasons.append("Conflicting indicators")
            reasons.append("Wait for clearer signal")
        
        return ". ".join(reasons) if reasons else "Neutral market conditions."


# Singleton instance
_signal_generator = SignalGenerator()


def generate_signal(symbol: str, current_price: float, indicators: Dict, strategy: str = 'combined', config: Optional[Dict] = None) -> Dict:
    """
    Convenience function to generate signals.
    """
    return _signal_generator.generate_signal(symbol, current_price, indicators, strategy, config)
