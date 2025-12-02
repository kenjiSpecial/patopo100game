import React from 'react';
import { BoardState, Block, CellValue, BlockType } from '../types';
import { BLOCK_COLORS } from '../constants';

interface TetrisBoardProps {
  board: BoardState;
  currentBlock: Block | null;
}

export const TetrisBoard: React.FC<TetrisBoardProps> = ({ board, currentBlock }) => {
  return (
    <div className="bg-gray-900 p-1 sm:p-2 rounded-lg border-4 border-gray-700 inline-block h-full flex items-center justify-center aspect-[1/2] max-h-full">
      <div className="grid grid-rows-[repeat(20,1fr)] grid-cols-[repeat(10,1fr)] gap-px bg-gray-800 w-full h-full">
        {board.map((row, y) => (
            <React.Fragment key={y}>
            {row.map((cell, x) => {
              let cellColor = 'bg-gray-800';

              // Check static board
              if (cell !== 0) {
                cellColor = 'bg-gray-500';
              }

              // Check current block
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
                  cellColor = BLOCK_COLORS[type];
                }
              }

              return (
                <div
                  key={`${x}-${y}`}
                  className={`w-full h-full ${cellColor} border border-gray-900/10`}
                />
              );
            })}
            </React.Fragment>
        ))}
      </div>
    </div>
  );
};
