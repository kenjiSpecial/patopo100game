import { useState, useCallback } from 'react';
import { useSound } from './useSound';

export type GameState = 'playing' | 'animating' | 'gameover';
export type DoorResult = 'safe' | 'out';

export const useDoorGame = () => {
  const [floor, setFloor] = useState(0);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [result, setResult] = useState<DoorResult | null>(null);
  const [highScore, setHighScore] = useState(0);
  const { playSound } = useSound();

  const chooseDoor = useCallback((doorIndex: number) => {
    if (gameState !== 'playing') return;

    playSound('door-open');
    setSelectedDoor(doorIndex);
    setGameState('animating');

    // 50%の確率でセーフかアウトか決定
    const isSafe = Math.random() < 0.5;
    const newResult = isSafe ? 'safe' : 'out';
    setResult(newResult);

    // 結果表示のタイミング（ドアが開ききったあたり）
    setTimeout(() => {
        if (isSafe) {
            playSound('safe');
        } else {
            playSound('out');
        }
    }, 800);

    // 結果に応じた処理（少し遅延させてアニメーションを待つ想定）
    setTimeout(() => {
      if (isSafe) {
        setFloor(prev => prev + 1);
        setGameState('playing');
        setSelectedDoor(null);
        setResult(null);
      } else {
        playSound('gameover');
        setGameState('gameover');
        setHighScore(prev => Math.max(prev, floor));
      }
    }, 2000); // アニメーション時間に合わせて調整

  }, [gameState, floor, playSound]);

  const resetGame = useCallback(() => {
    setFloor(0);
    setGameState('playing');
    setSelectedDoor(null);
    setResult(null);
  }, []);

  return {
    floor,
    gameState,
    selectedDoor,
    result,
    highScore,
    chooseDoor,
    resetGame
  };
};

