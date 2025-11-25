import React from 'react';
import { PlayerState } from '../types';

interface PlayerProps {
  player: PlayerState;
}

export const Player: React.FC<PlayerProps> = ({ player }) => {
  // Calculate rotation based on jump count or state
  // e.g. flip more on double jump
  const rotation = player.isJumping ? -20 - (player.jumpCount * 15) : 0;

  return (
    <div
      className="absolute z-30 left-[50px] w-[40px] h-[40px] bg-rose-500 rounded-lg shadow-lg transition-transform"
      style={{
        bottom: `${player.y + 50}px`, // +50 for ground offset
        transform: `rotate(${rotation}deg) scale(${player.isJumping ? 0.9 : 1})`,
      }}
    >
      {/* Eyes */}
      <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full overflow-hidden">
        <div className="absolute right-0 top-1 w-1 h-1 bg-black rounded-full" />
      </div>
      {/* Double Jump Indicator (optional) */}
      {player.jumpCount > 0 && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-full h-1 bg-white/50 rounded-full blur-sm animate-ping" />
      )}
    </div>
  );
};
