import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, GameScore, PunchType, PlayerAction, EnemyState, ScorePopup, DodgeRank } from '../types';

const INITIAL_HP = 3;
const INITIAL_TELEGRAPH_TIME = 1200; // 少し長くしてタイミングを取りやすく
const MIN_TELEGRAPH_TIME = 500;

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>('title');
  const [hp, setHp] = useState(INITIAL_HP);
  const [score, setScore] = useState<GameScore>({ score: 0, combo: 0, maxCombo: 0, level: 1 });

  const [enemyState, setEnemyState] = useState<EnemyState>({ action: 'none', phase: 'idle', startTime: 0, duration: 0 });
  const [playerAction, setPlayerAction] = useState<PlayerAction>('idle');
  const [hitStop, setHitStop] = useState(false);
  const [popups, setPopups] = useState<ScorePopup[]>([]);

  const lastPunchRef = useRef<PunchType>('none');
  const timeoutIdsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputHandledRef = useRef(false);
  const popupIdRef = useRef(0);

  // タイムアウト管理
  const setGameTimeout = useCallback((callback: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutIdsRef.current.delete(id);
      callback();
    }, ms);
    timeoutIdsRef.current.add(id);
    return id;
  }, []);

  const clearAllTimeouts = useCallback(() => {
    timeoutIdsRef.current.forEach(id => clearTimeout(id));
    timeoutIdsRef.current.clear();
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }
  }, []);

  // アンマウント時にクリア
  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  // 音声再生用
  const playSound = useCallback((type: 'hit' | 'dodge' | 'perfect' | 'telegraph') => {
    // TODO: Implement sound
  }, []);

  const addPopup = useCallback((rank: DodgeRank, point: number) => {
    const id = popupIdRef.current++;
    const text = rank === 'PERFECT' ? 'PERFECT!!' : rank === 'GOOD' ? 'NICE!' : 'EARLY';
    setPopups(prev => [...prev, { id, text, score: point, rank, x: 50, y: 40 }]);
    setGameTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 1000);
  }, [setGameTimeout]);

  const triggerHitStop = useCallback(() => {
    setHitStop(true);
    setGameTimeout(() => setHitStop(false), 150); // 150ms停止演出
  }, [setGameTimeout]);

  const getTelegraphTime = (level: number) => {
    return Math.max(MIN_TELEGRAPH_TIME, INITIAL_TELEGRAPH_TIME - (level - 1) * 80);
  };

  const decideNextPunch = (): PunchType => {
    const last = lastPunchRef.current;
    const rand = Math.random();
    if (last === 'right') return rand < 0.7 ? 'left' : 'right';
    if (last === 'left') return rand < 0.7 ? 'right' : 'left';
    return rand < 0.5 ? 'left' : 'right';
  };

  // startEnemyTurn を useCallback で定義する前に、依存関係を解決するために
  // 一旦 executeAttack と handleDamage を定義するか、useRef で参照できるようにする。
  // ここでは循環参照を避けるため、関数定義の順序を調整し、useCallback の依存配列を整理する。

  const startEnemyTurnRef = useRef<() => void>(() => {});

  const handleDamage = useCallback(() => {
    playSound('hit');
    setPlayerAction('hit');
    setScore(prev => ({ ...prev, combo: 0 }));
    triggerHitStop();

    setHp(prev => {
      const newHp = prev - 1;
      if (newHp <= 0) {
        setGameTimeout(() => setGameState('gameover'), 500);
        return 0;
      }

      // ゲームオーバーでなければ次のターンへ
      setGameTimeout(() => {
           setEnemyState(prev => ({ ...prev, phase: 'cooldown', startTime: Date.now(), duration: 1000 }));
           setGameTimeout(() => startEnemyTurnRef.current(), 1000);
      }, 500);

      return newHp;
    });
  }, [playSound, triggerHitStop, setGameTimeout]);

  const executeAttack = useCallback((punch: PunchType) => {
    if (!inputHandledRef.current) {
        // 未回避 -> 被弾
        handleDamage();
        setEnemyState(prev => ({ ...prev, phase: 'attack', startTime: Date.now(), duration: 300 }));
    } else {
       // すでに回避済み -> 空振りアニメーション
       setEnemyState(prev => ({ ...prev, phase: 'attack', startTime: Date.now(), duration: 300 }));

       // 次のターンへ
       setGameTimeout(() => {
           setEnemyState(prev => ({ ...prev, phase: 'cooldown', startTime: Date.now(), duration: 500 }));
           setGameTimeout(() => startEnemyTurnRef.current(), 500);
       }, 300);
    }
  }, [handleDamage, setGameTimeout]);

  const startEnemyTurn = useCallback(() => {
    // HPチェックは非同期で行われるため、ここでもチェックするが、
    // そもそも handleDamage で next turn を呼ばないように制御しているので
    // ここが呼ばれる＝生存中のはず。念のため。
    // ただし hp state はクロージャで古い可能性があるので、setHp のコールバック以外では信頼しにくい。
    // しかし startEnemyTurn は再生成されるので、依存配列に hp を入れれば最新になる。
    if (hp <= 0) return;

    const nextPunch = decideNextPunch();
    lastPunchRef.current = nextPunch;
    inputHandledRef.current = false;
    setPlayerAction('idle');

    const telegraphTime = getTelegraphTime(score.level);
    const now = Date.now();

    setEnemyState({
      action: nextPunch,
      phase: 'telegraph',
      startTime: now,
      duration: telegraphTime
    });
    playSound('telegraph');

    timerRef.current = setTimeout(() => {
      executeAttack(nextPunch);
    }, telegraphTime);
    // timerRef も timeoutIdsRef に登録して管理したいが、
    // timerRef はキャンセルロジック（回避成功時）で個別に使われているので
    // setGameTimeout を使うように書き換えつつ、戻り値を timerRef に入れる。

  }, [hp, score.level, playSound, executeAttack]);

  // Refに最新の startEnemyTurn を保持
  useEffect(() => {
      startEnemyTurnRef.current = startEnemyTurn;
  }, [startEnemyTurn]);

  // startEnemyTurn の timerRef 部分を書き換え
  // executeAttack への依存があるため、useEffect で上書きした Ref を使う形にするか、
  // executeAttack を依存配列に入れる。今回は入れた。

  // 上書き用: startEnemyTurnの実装を少し修正（timerRef.current に setGameTimeout の戻り値を入れる）
  const startEnemyTurnWithTimer = useCallback(() => {
      if (hp <= 0) return;
      const nextPunch = decideNextPunch();
      lastPunchRef.current = nextPunch;
      inputHandledRef.current = false;
      setPlayerAction('idle');

      const telegraphTime = getTelegraphTime(score.level);
      const now = Date.now();

      setEnemyState({
        action: nextPunch,
        phase: 'telegraph',
        startTime: now,
        duration: telegraphTime
      });
      playSound('telegraph');

      timerRef.current = setGameTimeout(() => {
        executeAttack(nextPunch);
      }, telegraphTime);
  }, [hp, score.level, playSound, executeAttack, setGameTimeout, getTelegraphTime]); // getTelegraphTime は外に出すか useCallback

  // startEnemyTurnRef 更新
  useEffect(() => {
    startEnemyTurnRef.current = startEnemyTurnWithTimer;
  }, [startEnemyTurnWithTimer]);


  const startGame = useCallback(() => {
    clearAllTimeouts(); // 既存の全タイマーをクリア

    setGameState('playing');
    setHp(INITIAL_HP);
    setScore({ score: 0, combo: 0, maxCombo: 0, level: 1 });
    setEnemyState({ action: 'none', phase: 'idle', startTime: 0, duration: 0 });
    setPlayerAction('idle');
    setPopups([]);
    lastPunchRef.current = 'none';
    inputHandledRef.current = false;

    setGameTimeout(() => startEnemyTurnRef.current(), 1000);
  }, [clearAllTimeouts, setGameTimeout]);

  const handleDodge = useCallback((direction: 'left' | 'right') => {
    if (gameState !== 'playing') return;
    if (enemyState.phase !== 'telegraph') return;
    if (inputHandledRef.current) return;

    inputHandledRef.current = true;

    const isCorrect =
        (enemyState.action === 'left' && direction === 'left') ||
        (enemyState.action === 'right' && direction === 'right');

    if (!isCorrect) {
        if (timerRef.current) {
            clearTimeout(timerRef.current); // ここも setGameTimeout に対応させるべきだが、clearTimeout は共通で効く
            timeoutIdsRef.current.delete(timerRef.current); // 管理から削除
        }

        setPlayerAction(direction === 'left' ? 'dodgeLeft' : 'dodgeRight');

        setGameTimeout(() => {
             setEnemyState(prev => ({ ...prev, phase: 'attack', startTime: Date.now(), duration: 300 }));
             handleDamage();
        }, 100);
        return;
    }

    const now = Date.now();
    const elapsed = now - enemyState.startTime;
    const progress = elapsed / enemyState.duration;

    let rank: DodgeRank = 'GOOD';

    if (score.level <= 2) {
        if (progress > 0.5) rank = 'PERFECT';
        else rank = 'GOOD';
    } else {
        if (progress > 0.7) rank = 'PERFECT';
        else if (progress < 0.3) rank = 'EARLY';
    }

    let points = 100;
    if (rank === 'PERFECT') points = 300;
    if (rank === 'EARLY') points = 50;

    setPlayerAction(direction === 'left' ? 'dodgeLeft' : 'dodgeRight');

    if (rank === 'PERFECT') {
        playSound('perfect');
        triggerHitStop();
    } else {
        playSound('dodge');
    }

    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timeoutIdsRef.current.delete(timerRef.current);
    }

    setScore(prev => {
        const newCombo = prev.combo + 1;
        const comboBonus = newCombo * 10;
        const totalPoints = points + comboBonus;

        addPopup(rank, totalPoints);

        return {
            score: prev.score + totalPoints,
            combo: newCombo,
            maxCombo: Math.max(prev.maxCombo, newCombo),
            level: Math.floor((prev.score + totalPoints) / 1000) + 1
        };
    });

    setGameTimeout(() => {
         setEnemyState(prev => ({ ...prev, phase: 'attack', startTime: Date.now(), duration: 300 }));
         setGameTimeout(() => {
             setEnemyState(prev => ({ ...prev, phase: 'cooldown', startTime: Date.now(), duration: 500 }));
             setGameTimeout(() => startEnemyTurnRef.current(), 500);
         }, 300);
    }, 50);

  }, [gameState, enemyState, score.level, playSound, addPopup, triggerHitStop, setGameTimeout, handleDamage]);

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleDodge('left');
      if (e.key === 'ArrowRight') handleDodge('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDodge]);

  return {
    gameState,
    hp,
    score,
    enemyState,
    playerAction,
    hitStop,
    popups,
    startGame,
    handleDodge
  };
};
