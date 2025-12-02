import { useState, useEffect, useCallback, useRef } from 'react';
import { JankenHand, JankenResult, JankenState, JankenHistory, JankenLog } from '../types';

const HANDS: JankenHand[] = ['rock', 'paper', 'scissors'];
const COUNTDOWN_DURATION = 1000; // 1 second per count
const INPUT_DURATION = 1000; // 1 second to react
const RESULT_DURATION = 1500; // Show result for 1.5 seconds

export const useJankenGame = (gameStatus: 'idle' | 'playing' | 'gameover') => {
  const [state, setState] = useState<JankenState>({
    phase: 'idle',
    countdownValue: 0,
    cpuHand: null,
    playerHand: null,
    result: 'none',
    history: { wins: 0, loses: 0, draws: 0, total: 0, logs: [] },
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseRef = useRef(state.phase);

  // Keep ref in sync
  useEffect(() => {
    phaseRef.current = state.phase;
  }, [state.phase]);

  // Clear timer helper
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // CPU Hand Generator
  const generateCpuHand = () => HANDS[Math.floor(Math.random() * HANDS.length)];

  // Logic for game flow
  const startGameLoop = useCallback(() => {
    if (gameStatus !== 'playing') return;

    // Reset for new round
    setState(prev => ({
      ...prev,
      phase: 'countdown',
      countdownValue: 3,
      cpuHand: generateCpuHand(), // Pre-generate but hide
      playerHand: null,
      result: 'none',
    }));

    // Countdown logic
    let count = 3;
    const runCountdown = () => {
      timerRef.current = setTimeout(() => {
        count--;
        if (count > 0) {
          setState(prev => ({ ...prev, countdownValue: count }));
          runCountdown();
        } else {
          // Start Input Phase
          setState(prev => ({ ...prev, countdownValue: 0, phase: 'input' }));

          // Set timeout for input
          timerRef.current = setTimeout(() => {
             // Timeout reached
             handleTimeout();
          }, INPUT_DURATION);
        }
      }, 1000);
    };
    runCountdown();

  }, [gameStatus]);

  // Timeout Handler
  const handleTimeout = () => {
    setState(prev => {
      const newLog: JankenLog = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2),
          result: 'timeout',
          playerHand: null,
          cpuHand: prev.cpuHand,
          timestamp: Date.now()
      };
      const newHistory = {
          ...prev.history,
          loses: prev.history.loses + 1,
          total: prev.history.total + 1,
          logs: [newLog, ...prev.history.logs].slice(0, 5) // Keep last 5
      };
      return {
        ...prev,
        phase: 'result',
        result: 'timeout',
        history: newHistory
      };
    });

    // Next round after delay
    timerRef.current = setTimeout(() => {
       startGameLoop();
    }, RESULT_DURATION);
  };

  // Handle Player Input
  const playHand = useCallback((hand: JankenHand) => {
    if (phaseRef.current !== 'input') return; // Only accept during input phase
    clearTimer(); // Cancel timeout

    setState(prev => {
      if (!prev.cpuHand) return prev; // Should not happen

      let result: JankenResult = 'none';
      const cpu = prev.cpuHand;

      if (hand === cpu) {
        result = 'draw';
      } else if (
        (hand === 'rock' && cpu === 'scissors') ||
        (hand === 'paper' && cpu === 'rock') ||
        (hand === 'scissors' && cpu === 'paper')
      ) {
        result = 'win';
      } else {
        result = 'lose';
      }

      const newLog: JankenLog = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2),
          result,
          playerHand: hand,
          cpuHand: cpu,
          timestamp: Date.now()
      };

      const newHistory = {
        ...prev.history,
        total: prev.history.total + 1,
        wins: result === 'win' ? prev.history.wins + 1 : prev.history.wins,
        loses: result === 'lose' ? prev.history.loses + 1 : prev.history.loses,
        draws: result === 'draw' ? prev.history.draws + 1 : prev.history.draws,
        logs: [newLog, ...prev.history.logs].slice(0, 5) // Keep last 5
      };

      return {
        ...prev,
        playerHand: hand,
        phase: 'result',
        result,
        history: newHistory
      };
    });

    // Next round after delay
    timerRef.current = setTimeout(() => {
      startGameLoop();
    }, RESULT_DURATION);

  }, [startGameLoop]);

  // Reset / Start monitoring
  useEffect(() => {
    if (gameStatus === 'playing') {
      // If not already running loop (check phase is idle)
      if (phaseRef.current === 'idle') {
         startGameLoop();
      }
    } else {
      clearTimer();
      setState(prev => ({
        ...prev,
        phase: 'idle',
        cpuHand: null,
        playerHand: null,
        result: 'none',
        history: { wins: 0, loses: 0, draws: 0, total: 0, logs: [] }
      }));
    }
    return () => clearTimer();
  }, [gameStatus, startGameLoop]);

  const resetHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: { wins: 0, loses: 0, draws: 0, total: 0, logs: [] }
    }));
  }, []);

  return {
    jankenState: state,
    playHand,
    resetHistory
  };
};
