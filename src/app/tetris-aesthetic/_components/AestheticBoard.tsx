import React from 'react';
import { BoardState, Block, BlockType } from '../types';
import { BLOCK_COLORS, BOARD_WIDTH, BOARD_HEIGHT } from '../constants';

interface AestheticBoardProps {
  board: BoardState;
  currentBlock: Block | null;
}

export const AestheticBoard: React.FC<AestheticBoardProps> = ({ board, currentBlock }) => {
  return (
    <div className="relative bg-gray-900 p-2 rounded-lg shadow-2xl border-4 border-gray-700 inline-block">
      {/* Grid Container */}
      <div
        className="grid gap-px bg-gray-800 w-[250px] sm:w-[300px] h-[500px] sm:h-[600px]"
        style={{
          gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
        }}
      >
        {board.map((row, y) => (
          <React.Fragment key={y}>
            {row.map((cell, x) => {
              let cellClass = 'bg-gray-900/50'; // Empty cell

              // Static blocks
              if (cell) {
                cellClass = BLOCK_COLORS[cell] || 'bg-gray-500';
              }

              // Active block
              if (currentBlock) {
                const { shape, position, type } = currentBlock;
                const localY = y - position.y;
                const localX = x - position.x;

                if (
                  localY >= 0 &&
                  localY < shape.length &&
                  localX >= 0 &&
                  localX < shape[0].length &&
                  shape[localY][localX]
                ) {
                  cellClass = BLOCK_COLORS[type];
                }
              }

              return (
                <div
                  key={`${x}-${y}`}
                  className={`w-full h-full ${cellClass} border border-white/5 rounded-[1px] transition-colors duration-100`}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Center Line for Symmetry Guide */}
      <div className="absolute top-2 bottom-2 left-1/2 w-0.5 bg-white/10 pointer-events-none transform -translate-x-1/2 z-10 border-l border-dashed border-white/20" />
    </div>
  );
};

