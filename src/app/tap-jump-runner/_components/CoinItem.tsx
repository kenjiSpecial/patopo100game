import React from 'react';
import { Coin } from '../types';

interface CoinItemProps {
  coin: Coin;
}

export const CoinItem: React.FC<CoinItemProps> = ({ coin }) => {
  if (coin.collected) return null;

  return (
    <div
      className="absolute rounded-full bg-yellow-400 border-4 border-yellow-600 shadow-[0_0_10px_rgba(250,204,21,0.8)] flex items-center justify-center animate-pulse"
      style={{
        left: `${coin.x}px`,
        bottom: `${coin.y + 50}px`,
        width: `${coin.width}px`,
        height: `${coin.height}px`,
      }}
    >
      <div className="text-yellow-700 font-bold text-xs">$</div>
    </div>
  );
};

