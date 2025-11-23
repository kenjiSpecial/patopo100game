import React from 'react';
import { GameState, Block } from '../types';
import { BlockItem } from './BlockItem';

type Props = {
  gameState: GameState;
  blocks: Block[];
  gameAreaRef: React.RefObject<HTMLDivElement | null>;
};

export const GameArea: React.FC<Props> = ({ gameState, blocks, gameAreaRef }) => {
  return (
    <div ref={gameAreaRef} className="relative w-full h-screen max-w-md mx-auto bg-slate-800/40 shadow-2xl border-x border-slate-700/50 overflow-hidden backdrop-blur-sm z-10">

      {/* ゾーン背景 */}
      <div className={`absolute bottom-0 left-0 w-1/2 h-[15%] border-t-4 border-blue-500/50 flex items-end justify-center pb-4 transition-colors duration-300 ${gameState === 'playing' ? 'bg-blue-900/20' : 'bg-blue-900/10'}`}>
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
          <span className="text-blue-300 font-bold text-2xl tracking-widest drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">EVEN</span>
      </div>
      <div className={`absolute bottom-0 right-0 w-1/2 h-[15%] border-t-4 border-red-500/50 flex items-end justify-center pb-4 transition-colors duration-300 ${gameState === 'playing' ? 'bg-red-900/20' : 'bg-red-900/10'}`}>
          <div className="absolute inset-0 bg-red-500/5 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <span className="text-red-300 font-bold text-2xl tracking-widest drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">ODD</span>
      </div>

      {/* センターガイド */}
      <div className="absolute top-0 bottom-[15%] left-1/2 w-0.5 bg-slate-600/30 pointer-events-none dashed-line"></div>

      {/* ブロック描画 */}
      {blocks.map(block => (
        <BlockItem key={block.id} block={block} />
      ))}

      {/* PC操作ガイド */}
      {gameState === 'playing' && (
        <div className="absolute bottom-2 inset-x-0 flex justify-between px-8 text-white/40 text-xs pointer-events-none font-mono uppercase tracking-widest">
            <span>← Even</span>
            <span>Odd →</span>
        </div>
      )}
    </div>
  );
};

