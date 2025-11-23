import React from 'react';
import { Block } from '../types';
import { BLOCK_SIZE } from '../constants';

type Props = {
  block: Block;
};

export const BlockItem: React.FC<Props> = ({ block }) => {
  const top =`${Math.round(block.y)}%`;

  return (
    <div
      className={`absolute flex items-center justify-center rounded-xl shadow-lg transition-all duration-100 border-4
        ${block.status === 'miss' ? 'bg-red-600 border-red-400 scale-95 opacity-50' :
          block.status === 'success' ? 'bg-green-500 border-green-300 scale-125 opacity-0 translate-y-4' :
          'bg-white border-slate-200 text-slate-900 shadow-[0_5px_15px_rgba(0,0,0,0.3)]'}
      `}
      style={{
        left: block.x === 0 ? '50%' : block.x < 0 ? '25%' : '75%',
        top: top,
        width: `${BLOCK_SIZE}%`,
        height: 'auto',
        aspectRatio: '1/1',
        transform: 'translateX(-50%)',
        opacity: block.status === 'success' ? 0 : block.y > 100 ? 0 : 1,
        zIndex: 10
      }}
    >
      <span className="text-3xl font-black font-mono tracking-tight">{block.value}</span>

      {/* トレイル（簡易） */}
       {block.status === 'falling' && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-full h-full bg-white/30 blur-sm rounded-xl -z-10 scale-90"></div>
       )}

      {/* 結果テキスト */}
      {block.status !== 'falling' && (
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap font-black text-3xl animate-bounce z-20`}
          style={{
            color: block.status === 'success' ? '#4ade80' : '#ef4444',
            textShadow: '0 0 20px currentColor',
            transform: 'translateX(-50%) scale(1.5)'
          }}
        >
          {block.status === 'success' ? 'PERFECT!' : 'MISS!'}
        </div>
      )}
    </div>
  );
};

