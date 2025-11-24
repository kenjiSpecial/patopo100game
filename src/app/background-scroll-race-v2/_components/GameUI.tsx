import { GameState, GameScore } from '../types';

interface GameUIProps {
  gameState: GameState;
  score: GameScore;
  onStart: () => void;
  onRetry: () => void;
}

export const GameUI = ({ gameState, score, onStart, onRetry }: GameUIProps) => {
  if (gameState === 'playing') {
    return (
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none">
        <div className="bg-black/50 text-white px-4 py-2 rounded-lg font-bold text-xl border border-white/20">
          COINS: {score.coins}
        </div>
        {/* Distance could be added if calculated in GameLogic */}
      </div>
    );
  }

  if (gameState === 'title') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-10">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-600 mb-8 tracking-tighter drop-shadow-lg text-center">
          SCROLL RACE
        </h1>
        <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-md border border-white/10 flex flex-col items-center gap-6 max-w-sm w-full mx-4">
           <p className="text-gray-300 text-center mb-4">
             Swipe or use Arrow keys to dodge obstacles and collect coins!
           </p>
           <button
            onClick={onStart}
            className="w-full py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-full text-xl shadow-lg transform transition hover:scale-105 active:scale-95"
          >
            TAP TO START
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-sm z-10">
        <h2 className="text-6xl font-black text-white mb-2 drop-shadow-xl">GAME OVER</h2>

        <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-md border border-white/10 flex flex-col items-center gap-6 w-full max-w-sm mx-4 mt-8">
          <div className="text-center w-full">
            <div className="text-gray-300 text-sm uppercase tracking-widest mb-1">Score</div>
            <div className="text-5xl font-bold text-yellow-400">{score.coins * 100}</div>
          </div>

          <div className="w-full h-px bg-white/20"></div>

          <div className="flex justify-between w-full text-white/80">
             <span>Coins:</span>
             <span className="font-bold text-white">{score.coins}</span>
          </div>

          <button
            onClick={onRetry}
            className="w-full py-4 px-8 bg-white text-red-600 font-black rounded-full text-xl shadow-lg transform transition hover:scale-105 active:scale-95 mt-4"
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

  return null;
};


