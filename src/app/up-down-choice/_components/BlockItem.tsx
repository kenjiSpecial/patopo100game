import React from 'react';
import { Block } from '../types';
import { BLOCK_SIZE, ZONE_HEIGHT } from '../constants';

type Props = {
  block: Block;
};

export const BlockItem: React.FC<Props> = ({ block }) => {
  const top = `${Math.round(block.y)}%`;

  // リスク演出：判定ラインに近づくと赤みが増し、振動する
  const isNearDanger = block.status === 'falling' && block.y > 100 - ZONE_HEIGHT - 15; // 判定ライン手前15%から
  const dangerLevel = isNearDanger ? (block.y - (100 - ZONE_HEIGHT - 15)) / 15 : 0; // 0.0 ~ 1.0

  const dangerStyle = isNearDanger ? {
    boxShadow: `0 0 ${dangerLevel * 30}px rgba(255, 0, 0, ${dangerLevel})`,
    borderColor: `rgba(255, ${255 * (1 - dangerLevel)}, ${255 * (1 - dangerLevel)}, 1)`,
    transform: `translateX(calc(-50% + ${(Math.random() - 0.5) * dangerLevel * 5}px))` // 軽微な振動
  } : {};

  // 判定時の拡大アニメーション用のクラス
  const resultAnimationClass = block.status === 'success'
    ? 'animate-pop-success'
    : block.status === 'miss'
      ? 'animate-pop-miss'
      : '';

  return (
    <div
      className={`absolute flex items-center justify-center rounded-xl transition-all duration-100 border-4
        ${block.status === 'miss' ? `bg-red-600 border-red-400 opacity-50 ${resultAnimationClass}` :
          block.status === 'success' ? `bg-green-500 border-green-300 opacity-0 ${resultAnimationClass}` :
          'bg-white text-slate-900'}
      `}
      style={{
        left: block.x === 0 ? '50%' : block.x < 0 ? '25%' : '75%',
        top: top,
        width: `${BLOCK_SIZE}%`,
        height: 'auto',
        aspectRatio: '1/1',
        transform: 'translateX(-50%)',
        zIndex: 10,
        ...dangerStyle
      }}
    >
      <span className={`text-3xl font-black font-mono tracking-tight ${isNearDanger ? 'text-red-600' : ''}`}>
        {block.value}
      </span>

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
      <style jsx>{`
        @keyframes pop-success {
          0% { transform: translateX(-50%) scale(1); opacity: 1; }
          50% { transform: translateX(-50%) scale(1.4); opacity: 0.8; }
          100% { transform: translateX(-50%) scale(2.0); opacity: 0; }
        }
        @keyframes pop-miss {
          0% { transform: translateX(-50%) scale(1); opacity: 1; }
          20% { transform: translateX(-50%) scale(1.2); opacity: 1; }
          100% { transform: translateX(-50%) scale(0.8); opacity: 0.5; }
        }
        .animate-pop-success {
          animation: pop-success 0.3s ease-out forwards;
        }
        .animate-pop-miss {
          animation: pop-miss 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
