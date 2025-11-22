"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ゲームの状態定義
type GameState = "idle" | "waiting" | "active" | "success" | "failure";

export default function LightStopGame() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [message, setMessage] = useState("画面をタップしてスタート");
  const [reactionTime, setReactionTime] = useState<number | null>(null);

  // タイマーID管理
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // 反応速度計測用
  const startTimeRef = useRef<number>(0);
  // AudioContext管理
  const audioContextRef = useRef<AudioContext | null>(null);

  // サウンド再生機能
  const playSound = (type: "success" | "failure" | "start") => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    // ブラウザの自動再生ポリシー対策（サスペンド状態なら再開）
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // 高い音
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === "failure") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, ctx.currentTime); // 低い音
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "start") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    }
  };

  // ゲーム開始（待機状態へ）
  const startGame = useCallback(() => {
    if (gameState === "waiting") return;

    playSound("start"); // スタート音

    setGameState("waiting");
    setMessage("ライトが緑になったらタップ！");
    setReactionTime(null);

    // 既存のタイマーがあればクリア
    if (timerRef.current) clearTimeout(timerRef.current);

    // 1秒〜3秒のランダムな遅延
    const delay = Math.floor(Math.random() * 2000) + 1000;

    timerRef.current = setTimeout(() => {
      setGameState("active");
      startTimeRef.current = Date.now();
      setMessage("今だ！");
    }, delay);
  }, [gameState]);

  // タップ/クリック時の処理
  const handleInteraction = () => {
    if (gameState === "idle" || gameState === "success" || gameState === "failure") {
      // リトライまたは初回スタート
      if (gameState === "failure") {
        setScore(0); // 失敗したらスコアリセット
      }
      startGame();
      return;
    }

    if (gameState === "waiting") {
      // フライング（失敗）
      if (timerRef.current) clearTimeout(timerRef.current);
      playSound("failure");
      setGameState("failure");
      setMessage("早すぎます！ (タップしてリトライ)");
      return;
    }

    if (gameState === "active") {
      // 成功
      const endTime = Date.now();
      const timeDiff = endTime - startTimeRef.current;

      playSound("success");
      setReactionTime(timeDiff);
      setScore((prev) => {
        const newScore = prev + 1;
        if (newScore > highScore) setHighScore(newScore);
        return newScore;
      });
      setGameState("success");
      setMessage(`成功！ ${timeDiff}ms (タップして次へ)`);
    }
  };

  // キーボード操作対応 (スペースキー)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault(); // スクロール防止
        handleInteraction();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]); // gameStateが変わるたびにハンドラ再登録は少し非効率だが、ロジックはシンプルに保つ

  // 背景色とライトの色の決定
  const getLightColor = () => {
    switch (gameState) {
      case "waiting": return "bg-red-500"; // 待機中は赤（またはグレー）
      case "active": return "bg-green-500 shadow-[0_0_50px_rgba(34,197,94,0.8)] scale-110"; // 緑で発光
      case "success": return "bg-green-500"; // 成功後も緑維持
      case "failure": return "bg-gray-800"; // 失敗時は暗く
      default: return "bg-gray-400"; // アイドル時
    }
  };

  const getContainerStyle = () => {
      // 状態に応じて背景を少し変える演出
      if (gameState === "failure") return "bg-red-950/30";
      if (gameState === "success") return "bg-green-950/30";
      return "bg-gray-900";
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-between p-4 select-none transition-colors duration-300 ${getContainerStyle()} text-white touch-manipulation`}
      onPointerDown={handleInteraction} // スマホのタップ遅延対策としてonPointerDownを使用
    >
      {/* ヘッダー: スコア */}
      <div className="w-full max-w-md flex justify-between items-end mt-4 px-4">
        <div className="text-sm text-gray-400">
          <div>HIGH SCORE</div>
          <div className="text-2xl font-bold font-mono">{highScore}</div>
        </div>
        <div className="text-center">
            <h1 className="text-lg font-bold tracking-wider mb-1">LIGHT STOP</h1>
            <div className="text-xs text-gray-500">REFLEX GAME</div>
        </div>
        <div className="text-sm text-gray-400 text-right">
          <div>SCORE</div>
          <div className="text-4xl font-bold font-mono text-white">{score}</div>
        </div>
      </div>

      {/* メイン: ライト */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative">

        {/* ゲージ風の装飾（回転アニメーション） */}
        {gameState === "waiting" && (
          <div className="absolute w-64 h-64 rounded-full border-4 border-t-transparent border-gray-600 animate-spin opacity-50" />
        )}

        {/* 中央のライト */}
        <div
          className={`w-48 h-48 rounded-full transition-all duration-100 flex items-center justify-center ${getLightColor()}`}
        >
            {gameState === "idle" && <span className="text-black font-bold text-xl opacity-50">START</span>}
            {gameState === "failure" && <span className="text-white font-bold text-4xl">×</span>}
            {gameState === "success" && <span className="text-white font-bold text-2xl font-mono">{reactionTime}ms</span>}
        </div>

        {/* メッセージ */}
        <div className="mt-12 text-xl font-medium text-center h-8">
            {message}
        </div>
      </div>

      {/* フッター: 説明 */}
      <div className="mb-8 text-gray-500 text-sm text-center">
        <p>PC: スペースキー / スマホ: 画面タップ</p>
      </div>
    </div>
  );
}

