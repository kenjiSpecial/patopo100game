import React from 'react';
import { EnemyState, PlayerAction, ScorePopup } from '../types';

interface GameAreaProps {
  enemyState: EnemyState;
  playerAction: PlayerAction;
  hitStop: boolean;
  popups: ScorePopup[];
  onDodge: (direction: 'left' | 'right') => void;
}

export const GameArea: React.FC<GameAreaProps> = ({ enemyState, playerAction, hitStop, popups, onDodge }) => {

  // 敵のパンチアニメーション計算
  const getEnemyHandStyle = (side: 'left' | 'right') => {
    const isAttackingSide = enemyState.action === side;
    const phase = enemyState.phase;

    let transform = 'translateY(0) scale(1)';
    let color = 'bg-red-700';
    let glow = '';

    if (isAttackingSide) {
      if (phase === 'telegraph') {
        // 予備動作: 大きく引く & 光る
        transform = 'translateY(-20px) scale(1.2) rotate(10deg)';
        if (side === 'left') transform = 'translateY(-20px) scale(1.2) rotate(-10deg)';
        color = 'bg-orange-500';
        glow = 'shadow-[0_0_30px_rgba(249,115,22,0.8)]';
      } else if (phase === 'attack') {
        // 攻撃: 大きく前に出る
        transform = 'translateY(150px) scale(2.5)';
        color = 'bg-red-600';
      }
    }

    return `${color} ${transform} ${glow}`;
  };

  // プレイヤーの位置計算
  const getPlayerTransform = () => {
    switch (playerAction) {
      case 'dodgeLeft': return '-translate-x-24 rotate-[-15deg]';
      case 'dodgeRight': return 'translate-x-24 rotate-[15deg]';
      case 'hit': return 'scale-90 rotate-[5deg] opacity-50'; // 被弾
      default: return 'translate-x-0';
    }
  };

  return (
    <div className={`relative w-full h-full bg-gray-900 overflow-hidden flex items-center justify-center perspective-1000 transition-all duration-75 ${hitStop ? 'grayscale contrast-150' : ''}`}>
      <style jsx>{`
         @keyframes timing-shrink {
           0% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
           20% { opacity: 1; }
           100% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
         }
         @keyframes popup-float {
            0% { transform: translate(-50%, -50%) translateY(0) scale(0.5); opacity: 0; }
            20% { transform: translate(-50%, -50%) translateY(-40px) scale(1.2); opacity: 1; }
            80% { transform: translate(-50%, -50%) translateY(-60px) scale(1.0); opacity: 1; }
            100% { transform: translate(-50%, -50%) translateY(-80px) scale(1.0); opacity: 0; }
        }
       `}</style>

      {/* Floor/Background Grid */}
      <div className="absolute inset-0 opacity-20"
           style={{
             backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .3) 25%, rgba(255, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .3) 75%, rgba(255, 255, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .3) 25%, rgba(255, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .3) 75%, rgba(255, 255, 255, .3) 76%, transparent 77%, transparent)',
             backgroundSize: '50px 50px',
             transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(2)'
           }}
      />

      {/* Score Popups */}
      {popups.map(popup => (
           <div
             key={popup.id}
             className="absolute z-50 flex flex-col items-center pointer-events-none"
             style={{
                 left: '50%',
                 top: '40%',
                 animation: 'popup-float 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
             }}
           >
               <span className={`text-5xl font-black italic tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] whitespace-nowrap ${
                   popup.rank === 'PERFECT' ? 'text-yellow-300 scale-125 stroke-black' :
                   popup.rank === 'GOOD' ? 'text-green-400' :
                   popup.rank === 'EARLY' ? 'text-blue-300' : 'text-gray-400'
               }`}>
                   {popup.text}
               </span>
               <span className="text-white font-bold text-3xl mt-2 drop-shadow-md">+{popup.score}</span>
           </div>
      ))}

      {/* Enemy */}
      <div className="relative z-10 flex flex-col items-center transition-transform duration-100 mb-32">
        {/* Timing Bar (Center Indicator) */}
        {enemyState.phase === 'telegraph' && (
            <div className="absolute -top-20 w-64 h-4 bg-gray-700 rounded-full overflow-hidden border border-gray-500 shadow-lg">
                {/* Zones */}
                <div className="absolute top-0 left-[70%] w-[30%] h-full bg-green-900/50" /> {/* Dodge Zone */}
                <div className="absolute top-0 right-0 w-[5%] h-full bg-red-900/50" /> {/* Hit Zone (Too Late) */}

                {/* Moving Bar */}
                <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-red-500"
                    style={{
                        width: '100%',
                        animation: `fill-bar ${enemyState.duration}ms linear forwards`,
                        transformOrigin: 'left'
                    }}
                />
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white drop-shadow-md tracking-widest">TIMING</span>
                </div>
            </div>
        )}

        {/* Enemy Head */}
        <div className="w-24 h-24 bg-gray-800 rounded-full mb-4 relative shadow-2xl border-4 border-gray-700">
           <div className={`absolute top-8 left-4 w-4 h-4 rounded-full transition-colors duration-200 ${enemyState.phase === 'telegraph' ? 'bg-red-500 animate-ping' : 'bg-red-900'}`}/>
           <div className={`absolute top-8 right-4 w-4 h-4 rounded-full transition-colors duration-200 ${enemyState.phase === 'telegraph' ? 'bg-red-500 animate-ping' : 'bg-red-900'}`}/>
           {/* Mouth */}
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/50 rounded-full"/>
        </div>

        {/* Enemy Body */}
        <div className="w-48 h-56 bg-gray-700 rounded-3xl relative shadow-xl flex justify-between p-2">
            {/* Enemy Left Arm (Screen Left -> Right Punch) */}
            <div className={`absolute -left-12 top-10 w-20 h-20 rounded-full transition-all duration-200 border-4 border-black/30 z-20 ${getEnemyHandStyle('right')}`}>
               <div className="absolute inset-0 flex items-center justify-center text-white font-bold opacity-50">R</div>
               {/* Timing Circle */}
               {enemyState.phase === 'telegraph' && enemyState.action === 'right' && (
                   <>
                       {/* Attack Direction Arrow */}
                       <div className="absolute top-1/2 -left-20 -translate-y-1/2 text-4xl animate-pulse text-red-500 font-black drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                           ⬅️
                       </div>
                       {/* Target Ring (Just Timing) */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] rounded-full border-4 border-white/50 border-dashed animate-spin-slow opacity-80 pointer-events-none" />
                       {/* Shrinking Ring */}
                       <div
                           className="absolute top-1/2 left-1/2 w-[300%] h-[300%] rounded-full border-8 border-yellow-400 pointer-events-none shadow-[0_0_20px_rgba(250,204,21,0.6)]"
                           style={{ animation: `timing-shrink ${enemyState.duration}ms linear forwards` }}
                       />
                   </>
               )}
            </div>

            {/* Enemy Right Arm (Screen Right -> Left Punch) */}
            <div className={`absolute -right-12 top-10 w-20 h-20 rounded-full transition-all duration-200 border-4 border-black/30 z-20 ${getEnemyHandStyle('left')}`}>
               <div className="absolute inset-0 flex items-center justify-center text-white font-bold opacity-50">L</div>
               {/* Timing Circle */}
               {enemyState.phase === 'telegraph' && enemyState.action === 'left' && (
                   <>
                       {/* Attack Direction Arrow */}
                       <div className="absolute top-1/2 -right-20 -translate-y-1/2 text-4xl animate-pulse text-red-500 font-black drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                           ➡️
                       </div>
                       {/* Target Ring (Just Timing) */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] rounded-full border-4 border-white/50 border-dashed animate-spin-slow opacity-80 pointer-events-none" />
                       {/* Shrinking Ring */}
                       <div
                           className="absolute top-1/2 left-1/2 w-[300%] h-[300%] rounded-full border-8 border-yellow-400 pointer-events-none shadow-[0_0_20px_rgba(250,204,21,0.6)]"
                           style={{ animation: `timing-shrink ${enemyState.duration}ms linear forwards` }}
                       />
                   </>
               )}
            </div>
        </div>
      </div>

      {/* Player (Self) - Higher z-index to be in front of enemy */}
      <div
        className={`absolute bottom-0 transition-all duration-200 ease-out z-30 ${getPlayerTransform()}`}
      >
         {/* Player Back View */}
         <div className="w-64 h-48 bg-blue-900 rounded-t-[3rem] shadow-2xl border-t-4 border-blue-400/30 relative">
            {/* Head hint */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-24 h-24 bg-blue-800 rounded-full border-4 border-blue-900 shadow-lg"></div>

            {/* Gloves (always guarding) */}
            <div className="absolute -top-10 -left-10 w-20 h-24 bg-blue-600 rounded-2xl border-4 border-blue-800 shadow-lg transform -rotate-12"></div>
            <div className="absolute -top-10 -right-10 w-20 h-24 bg-blue-600 rounded-2xl border-4 border-blue-800 shadow-lg transform rotate-12"></div>
         </div>
      </div>

      {/* Hit Flash Effect */}
      {playerAction === 'hit' && (
        <div className="absolute inset-0 bg-red-500/30 animate-pulse z-50 pointer-events-none mix-blend-overlay" />
      )}

      {/* Hit Stop Flash (White out or Invert) */}
      {hitStop && (
          <div className="absolute inset-0 bg-white/20 z-50 pointer-events-none mix-blend-difference" />
      )}

      {/* Control Hints / Buttons for Touch - Always visible guides */}
      <div className="absolute inset-0 flex flex-col justify-end pb-8 z-50 pointer-events-none">
        <div className="flex w-full px-8">
            {/* Left Zone Guide */}
            <div
              className="flex-1 flex items-end justify-start transition-all duration-200 pointer-events-auto cursor-pointer active:scale-95"
              onClick={() => onDodge('left')}
            >
               <div className={`p-6 rounded-full backdrop-blur border transition-all duration-200 ${
                 enemyState.phase === 'telegraph' && enemyState.action === 'left'
                    ? 'bg-green-500/50 border-green-400 scale-110 shadow-[0_0_50px_rgba(34,197,94,0.8)] animate-bounce'
                    : 'bg-white/10 border-white/20'
               }`}
               >
                 <span className="text-4xl filter drop-shadow-md">⬅️</span>
                 <span className="hidden md:inline ml-2 font-bold text-white uppercase">Left</span>
               </div>
            </div>

            {/* Right Zone Guide */}
            <div
              className="flex-1 flex items-end justify-end transition-all duration-200 pointer-events-auto cursor-pointer active:scale-95"
              onClick={() => onDodge('right')}
            >
                <div className={`p-6 rounded-full backdrop-blur border transition-all duration-200 ${
                    enemyState.phase === 'telegraph' && enemyState.action === 'right'
                        ? 'bg-green-500/50 border-green-400 scale-110 shadow-[0_0_50px_rgba(34,197,94,0.8)] animate-bounce'
                        : 'bg-white/10 border-white/20'
                }`}
                >
                 <span className="hidden md:inline mr-2 font-bold text-white uppercase">Right</span>
                 <span className="text-4xl filter drop-shadow-md">➡️</span>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};
