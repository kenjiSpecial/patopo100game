import React from 'react';

interface ControlPanelProps {
  onLeft: () => void;
  onRight: () => void;
  onRotate: () => void;
  onDown: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onLeft, onRight, onRotate, onDown }) => {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 py-2 shrink-0">
       <button
          onClick={onRotate}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-600 rounded-full shadow-lg active:scale-95 flex items-center justify-center font-bold text-white border-b-4 border-purple-800 text-xl sm:text-2xl"
       >
         ↻
       </button>

       <div className="flex gap-2 sm:gap-4">
          <button
             onClick={onLeft}
             className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-700 rounded-lg shadow-lg active:scale-95 flex items-center justify-center text-xl sm:text-2xl text-white border-b-4 border-gray-900"
          >
            ←
          </button>
           <button
             onClick={onDown}
             className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-700 rounded-lg shadow-lg active:scale-95 flex items-center justify-center text-xl sm:text-2xl text-white border-b-4 border-gray-900"
          >
            ↓
          </button>
          <button
             onClick={onRight}
             className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-700 rounded-lg shadow-lg active:scale-95 flex items-center justify-center text-xl sm:text-2xl text-white border-b-4 border-gray-900"
          >
            →
          </button>
       </div>
    </div>
  );
};
