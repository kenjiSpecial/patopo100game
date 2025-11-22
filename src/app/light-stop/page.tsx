"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ゲームの状態定義
type GameState = "idle" | "waiting" | "active" | "success" | "failure";

// アニメーション用のスタイル定義
const animations = `
  @keyframes heartbeat {
    0% { transform: scale(1); }
    5% { transform: scale(1.05); }
    10% { transform: scale(1); }
    15% { transform: scale(1.05); }
    50% { transform: scale(1); }
    100% { transform: scale(1); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  @keyframes flash {
    0% { opacity: 0.8; }
    100% { opacity: 0; }
  }
`;

export default function LightStopGame() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0); // 連続成功回数
  const [highScore, setHighScore] = useState(0); // 最大連続成功回数
  const [bestTime, setBestTime] = useState<number | null>(null); // 最速タイム（反応速度の最小値）
  const [message, setMessage] = useState("画面をタップしてスタート");
  const [reactionTime, setReactionTime] = useState<number | null>(null); // 現在の反応速度

  // タイマーID管理
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // 反応速度計測用
  const startTimeRef = useRef<number>(0);
  // AudioContext管理
  const audioContextRef = useRef<AudioContext | null>(null);
  // 待機音（ドローン）用のオシレーター
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);

  // サウンド再生機能
  const playSound = (type: "success" | "failure" | "start" | "drone_start" | "drone_stop") => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    // ブラウザの自動再生ポリシー対策（サスペンド状態なら再開）
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // ドローン音（待機中の緊張感音）の制御
    if (type === "drone_start") {
      if (droneOscRef.current) return; // 既に鳴っていたら無視

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle"; // 柔らかいが少し倍音がある音
      osc.frequency.setValueAtTime(60, ctx.currentTime); // 低音

      // 鼓動のような揺らぎを与える
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 2; // 2Hz (心拍程度)
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 20;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1); // フェードイン

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      droneOscRef.current = osc;
      droneGainRef.current = gain;
      return;
    }

    if (type === "drone_stop") {
      if (droneOscRef.current && droneGainRef.current) {
        const osc = droneOscRef.current;
        const gain = droneGainRef.current;

        // フェードアウトして停止
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

        setTimeout(() => {
            try {
                osc.stop();
                osc.disconnect();
                gain.disconnect();
            } catch (e) {
                // すでに停止している場合は無視
            }
        }, 150);

        droneOscRef.current = null;
        droneGainRef.current = null;
      }
      return;
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
      osc.frequency.setValueAtTime(100, ctx.currentTime); // さらに低く不快な音
      osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
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

    playSound("start");
    playSound("drone_start"); // ドローン音開始

    setGameState("waiting");
    setMessage("..."); // 集中させるためにテキストを消すかシンプルに
    setReactionTime(null);

    // 既存のタイマーがあればクリア
    if (timerRef.current) clearTimeout(timerRef.current);

    // 1秒〜4秒のランダムな遅延 (少し幅を広げて予測しづらくする)
    const delay = Math.floor(Math.random() * 3000) + 1000;

    timerRef.current = setTimeout(() => {
      setGameState("active");
      startTimeRef.current = Date.now();
      setMessage("TAP!");
      playSound("drone_stop"); // ドローン音停止
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
      playSound("drone_stop"); // ドローン音停止
      setGameState("failure");
      setMessage("TOO EARLY!");
      return;
    }

    if (gameState === "active") {
      // 成功
      const endTime = Date.now();
      const timeDiff = endTime - startTimeRef.current;

      playSound("success");
      setReactionTime(timeDiff);

      // 最速タイムの更新（より速い反応速度を記録）
      setBestTime((prev) => {
        if (prev === null || timeDiff < prev) {
          return timeDiff;
        }
        return prev;
      });

      // 連続成功回数の更新
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

  // 背景色とライトの色の決定（背景色のみに使用）
  const getContainerStyle = () => {
      // 状態に応じて背景を少し変える演出
      if (gameState === "failure") return "bg-red-950/50 animate-[shake_0.4s_ease-in-out]";
      if (gameState === "success") return "bg-green-950/50";
      if (gameState === "waiting") return "bg-gray-900";
      return "bg-gray-900";
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-between p-4 select-none transition-colors duration-300 ${getContainerStyle()} text-white touch-manipulation overflow-hidden relative`}
      onPointerDown={handleInteraction} // スマホのタップ遅延対策としてonPointerDownを使用
    >
      <style>{animations}</style>

      {/* フラッシュエフェクト */}
      {gameState === "success" && (
        <div className="absolute inset-0 bg-white pointer-events-none animate-[flash_0.3s_ease-out_forwards] z-50 opacity-0" />
      )}

      {/* 待機中の背景鼓動エフェクト */}
      {gameState === "waiting" && (
        <div className="absolute inset-0 bg-black/20 pointer-events-none animate-[pulse_0.5s_ease-in-out_infinite]" />
      )}

      {/* ヘッダー: スコアとタイム */}
      <div className="w-full max-w-2xl mt-4 px-4">
        {/* タイトル */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-wider mb-1">LIGHT STOP</h1>
          <div className="text-xs text-gray-500">REFLEX GAME</div>
        </div>

        {/* スコア表示エリア */}
        <div className="grid grid-cols-2 gap-4">
          {/* 左側: 連続成功回数 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">連続成功回数</div>
            <div className="text-3xl font-bold font-mono text-white mb-2">{score}</div>
            <div className="text-xs text-gray-500">
              <span className="text-gray-400">最高記録: </span>
              <span className="font-mono">{highScore}回</span>
            </div>
          </div>

          {/* 右側: 反応速度 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">反応速度</div>
            {reactionTime !== null ? (
              <>
                <div className="text-3xl font-bold font-mono text-green-400 mb-2">{reactionTime}ms</div>
                <div className="text-xs text-gray-500">
                  <span className="text-gray-400">最速タイム: </span>
                  <span className="font-mono text-yellow-400">
                    {bestTime !== null ? `${bestTime}ms` : "---"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold font-mono text-gray-600 mb-2">---</div>
                <div className="text-xs text-gray-500">
                  <span className="text-gray-400">最速タイム: </span>
                  <span className="font-mono text-yellow-400">
                    {bestTime !== null ? `${bestTime}ms` : "---"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* メイン: ライト */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative">

        {/* ゲージ風の装飾（回転アニメーション） */}
        {gameState === "waiting" && (
          <div className="absolute w-80 h-80 rounded-full border-4 border-t-transparent border-gray-600 animate-spin opacity-20 pointer-events-none" />
        )}

        {/* 信号機コンテナ */}
        <div className="bg-gray-900 p-6 rounded-[3rem] border-4 border-gray-700 shadow-2xl flex flex-col gap-6 relative z-10">

          {/* 赤ライト (上) */}
          <div
            className={`w-32 h-32 rounded-full transition-all duration-100 flex items-center justify-center border-4 border-black/30
              ${gameState === "waiting" || gameState === "idle" || gameState === "failure"
                ? "bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.6)]"
                : "bg-red-900/30 opacity-50"
              }
              ${gameState === "waiting" ? "animate-[heartbeat_1s_ease-in-out_infinite]" : ""}
            `}
          >
            {(gameState === "failure" || gameState === "waiting") && (
               <div className={`absolute inset-0 rounded-full bg-red-500/20 ${gameState === "waiting" ? "animate-ping" : ""}`} />
            )}
             {gameState === "failure" && <span className="text-white font-bold text-4xl z-10">×</span>}
          </div>

          {/* 緑ライト (下) */}
          <div
            className={`w-32 h-32 rounded-full transition-all duration-100 flex items-center justify-center border-4 border-black/30
              ${gameState === "active" || gameState === "success"
                ? "bg-green-500 shadow-[0_0_60px_rgba(34,197,94,0.9)] scale-105"
                : "bg-green-900/30 opacity-50"
              }
            `}
          >
             {gameState === "success" && <span className="text-white font-bold text-xl font-mono z-10">{reactionTime}ms</span>}
             {gameState === "idle" && <span className="text-white/50 font-bold text-sm">START</span>}
          </div>

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

