import React from 'react';
import { Obstacle } from '../types';

interface ObstacleItemProps {
  obstacle: Obstacle;
}

export const ObstacleItem: React.FC<ObstacleItemProps> = ({ obstacle }) => {
  if (obstacle.type === 'pit') {
    return (
      <div
        className="absolute z-20 bg-gradient-to-b from-sky-200 to-sky-400" // Match background color to look like hole
        style={{
          left: `${obstacle.x}px`,
          bottom: `0px`,
          width: `${obstacle.width}px`,
          height: `50px`, // Height of ground
        }}
      >
         {/* Inner shadow to fake depth */}
         <div className="w-full h-full shadow-[inset_0_10px_10px_rgba(0,0,0,0.3)]" />
      </div>
    );
  }

  return (
    <div
      className={`absolute z-10 bg-slate-800 border-2 border-slate-600 shadow-md ${obstacle.type === 'flying' ? 'rounded-full' : 'rounded-t-lg'}`}
      style={{
        left: `${obstacle.x}px`,
        bottom: `${(obstacle.type === 'flying' ? 100 : 0) + 50}px`, // +50 for ground
        width: `${obstacle.width}px`,
        height: `${obstacle.height}px`,
      }}
    >
       {/* Warning stripes */}
       <div className="w-full h-full opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#000_5px,#000_10px)]" />
    </div>
  );
};
