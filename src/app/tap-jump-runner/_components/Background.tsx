import React from 'react';

interface BackgroundProps {
  distance: number;
}

export const Background: React.FC<BackgroundProps> = ({ distance }) => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0 bg-sky-300">

      {/* Main Loop Background - Parallax 0.01 (Very Slow) */}
      <div
        className="absolute bottom-0 left-0 w-[200%] h-full flex"
        style={{ transform: `translateX(-${(distance * 0.01) % 50}%)` }}
      >
          {/* Image 1 */}
          <div
            className="w-1/2 h-full bg-repeat-x bg-cover bg-bottom"
            style={{ backgroundImage: "url('/bg-loop.jpeg')" }}
          />
          {/* Image 2 (Clone) */}
          <div
            className="w-1/2 h-full bg-repeat-x bg-cover bg-bottom"
            style={{ backgroundImage: "url('/bg-loop.jpeg')" }}
          />
      </div>

      {/* Ground - Solid Gray Road */}
      <div className="absolute bottom-0 w-full h-[50px] bg-gray-600 border-t-4 border-gray-700 z-10">
         {/* Road markings */}
         <div
            className="absolute top-1/2 -translate-y-1/2 w-[200%] h-2 bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,#fff_40px,#fff_80px)]"
            style={{ transform: `translateX(-${distance % 80}px)` }}
         />
      </div>
    </div>
  );
};
