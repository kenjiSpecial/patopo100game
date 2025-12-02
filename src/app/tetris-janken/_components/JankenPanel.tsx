import React from 'react';
import { JankenState, JankenHand } from '../types';

interface JankenPanelProps {
  jankenState: JankenState;
  onPlayHand: (hand: JankenHand) => void;
}

const HAND_ICONS: Record<string, string> = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
};

export const JankenPanel: React.FC<JankenPanelProps> = ({ jankenState, onPlayHand }) => {
  const {
    phase,
    countdownValue,
    cpuHand,
    playerHand,
    result,
    history
  } = jankenState;

  const winRate = history.total > 0 ? Math.round((history.wins / history.total) * 100) : 0;
  const isWinRateGood = winRate > 50;

  // Determine status message
  let statusMessage = "待機中...";
  let statusColor = "text-gray-400";

  if (phase === 'countdown') {
      statusMessage = countdownValue.toString();
      statusColor = "text-yellow-400 text-4xl sm:text-5xl font-bold animate-pulse";
  } else if (phase === 'input') {
      statusMessage = "PON!";
      statusColor = "text-red-500 text-3xl sm:text-4xl font-bold animate-bounce";
  } else if (phase === 'result') {
      if (result === 'win') { statusMessage = "WIN!"; statusColor = "text-yellow-400"; }
      else if (result === 'lose') { statusMessage = "LOSE"; statusColor = "text-red-500"; }
      else if (result === 'draw') { statusMessage = "DRAW"; statusColor = "text-gray-300"; }
      else if (result === 'timeout') { statusMessage = "TIMEOUT"; statusColor = "text-red-600 text-xl"; }
  }

  return (
    <div className="w-full bg-gray-800 p-2 sm:p-4 rounded-t-xl border-t-4 border-blue-500 flex flex-col items-center gap-1 sm:gap-2 relative">

      {/* History Log (Absolute or Floating) */}
      <div className="absolute -top-24 right-2 w-24 bg-gray-900/80 rounded p-1 text-[10px] pointer-events-none flex flex-col gap-1 border border-gray-700">
         <div className="text-center text-gray-400 border-b border-gray-700 pb-1">History</div>
         {history.logs.length === 0 && <div className="text-center text-gray-600">-</div>}
         {history.logs.map((log) => (
             <div key={log.id} className="flex justify-between px-1">
                 <span>{log.playerHand ? HAND_ICONS[log.playerHand] : '❌'}</span>
                 <span className={
                     log.result === 'win' ? 'text-yellow-400' :
                     log.result === 'lose' || log.result === 'timeout' ? 'text-red-400' : 'text-gray-400'
                 }>
                     {log.result === 'win' ? 'Win' : log.result === 'draw' ? 'Draw' : 'Lose'}
                 </span>
                 <span>{log.cpuHand ? HAND_ICONS[log.cpuHand] : '?'}</span>
             </div>
         ))}
      </div>

      {/* Info Bar */}
      <div className="flex w-full justify-between items-end px-2 text-xs sm:text-sm text-gray-400 mb-1">
        <div>
           Win Rate: <span className={isWinRateGood ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{winRate}%</span>
           <span className="text-[10px] sm:text-xs ml-1">({history.wins}W {history.loses}L)</span>
        </div>
        <div>
            Next: {isWinRateGood ? <span className="text-green-400">GOOD</span> : <span className="text-red-400">BAD</span>}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex justify-between w-full items-center px-2 sm:px-4 h-16 sm:h-24">
        {/* CPU */}
        <div className="text-center w-16 sm:w-20">
          <div className="text-[10px] sm:text-xs text-gray-400 mb-1">CPU</div>
          <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl sm:text-4xl border-4 transition-colors
             ${result === 'win' ? 'border-red-500 opacity-60' : result === 'lose' ? 'border-yellow-500' : 'border-gray-600'}
          `}>
            {phase === 'result' && cpuHand ? HAND_ICONS[cpuHand] : (phase === 'input' ? '?' : '🤖')}
          </div>
        </div>

        {/* Center Status */}
        <div className={`text-center font-bold min-w-[80px] sm:min-w-[100px] h-12 sm:h-16 flex items-center justify-center ${statusColor}`}>
            {statusMessage}
        </div>

        {/* Player Result Display */}
        <div className="text-center w-16 sm:w-20">
            <div className="text-[10px] sm:text-xs text-gray-400 mb-1">YOU</div>
             <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl sm:text-4xl border-4 transition-colors
                 ${result === 'win' ? 'border-yellow-400' : result === 'lose' ? 'border-red-500 opacity-60' : 'border-gray-600'}
             `}>
                {playerHand ? HAND_ICONS[playerHand] : '👤'}
             </div>
        </div>
      </div>

      {/* Input Buttons */}
      <div className={`flex gap-2 sm:gap-4 mt-1 sm:mt-2 transition-opacity duration-100 ${phase === 'input' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        {(['rock', 'paper', 'scissors'] as JankenHand[]).map((hand) => (
          <button
            key={hand}
            onClick={() => onPlayHand(hand)}
            disabled={phase !== 'input'}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-transform rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-lg border-b-4 border-blue-800 disabled:cursor-not-allowed"
          >
            {HAND_ICONS[hand!]}
          </button>
        ))}
      </div>
    </div>
  );
};
