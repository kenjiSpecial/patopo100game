'use client';

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { TetrominoFactory } from '../_game/TetrominoFactory';
import { TETROMINO_TYPES, GAME_WIDTH, BLOCK_SIZE, CATEGORY_WALL, CATEGORY_BLOCK, CATEGORY_CURRENT, TetrominoType } from '../constants';
import { useSound } from '../_hooks/useSound';

export default function PullTetrisGame() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const currentBodyRef = useRef<Matter.Body | null>(null);
  // We need to track the "selected" body among available current bodies
  const [availableBodies, setAvailableBodies] = useState<number[]>([]); // Store IDs
  const selectedBodyIdRef = useRef<number | null>(null);

  const sleepTrackerRef = useRef<Record<number, number>>({});
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [gameHeight, setGameHeight] = useState(640);

  const { playSound } = useSound();

  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [nextType, setNextType] = useState<TetrominoType>('I');

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [applicationPoint, setApplicationPoint] = useState<{ x: number; y: number } | null>(null);

  const gameStateRef = useRef({
    isDragging: false,
    isGameOver: false,
    nextType: 'T' as TetrominoType,
  });

  // Initialize random next type
  useEffect(() => {
     const type = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
     setNextType(type);
     gameStateRef.current.nextType = type;

     // Set height
     const updateHeight = () => {
         const h = window.innerHeight;
         setGameHeight(h);
         // We might need to update wall/ground positions if resized dynamically,
         // but for mobile 100svh usually implies a stable height after load.
         // For robustness on desktop resize, we'd need to recreate world or move bodies.
         // For this MVP, reloading on resize is acceptable or just keeping initial height.
         // Let's keep it simple for now.
     };

     updateHeight();
     window.addEventListener('resize', updateHeight);
     return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const resetGame = () => {
    if (!engineRef.current) return;

    Matter.World.clear(engineRef.current.world, false);
    Matter.Engine.clear(engineRef.current);

    const world = engineRef.current.world;
    const wallOptions = {
      isStatic: true,
      render: { fillStyle: '#475569' },
      collisionFilter: { category: CATEGORY_WALL }
    };
    const ground = Matter.Bodies.rectangle(GAME_WIDTH / 2, gameHeight + 10, GAME_WIDTH, 40, wallOptions);
    const leftWall = Matter.Bodies.rectangle(-10, gameHeight / 2, 20, gameHeight, wallOptions);
    const rightWall = Matter.Bodies.rectangle(GAME_WIDTH + 10, gameHeight / 2, 20, gameHeight, wallOptions);
    Matter.World.add(world, [ground, leftWall, rightWall]);

    setScore(0);
    setIsGameOver(false);
    gameStateRef.current.isGameOver = false;
    currentBodyRef.current = null;
    selectedBodyIdRef.current = null;
    setAvailableBodies([]);
    sleepTrackerRef.current = {};

    spawnTetrominos(engineRef.current);
  };

  const spawnTetrominos = (engine: Matter.Engine) => {
    if (gameStateRef.current.isGameOver) return;

    if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
    }

    // Spawn 1 to 4 bodies
    const count = Math.floor(Math.random() * 4) + 1;
    const newIds: number[] = [];

    // Spread calculation
    // We need to make sure they don't overlap.
    // Max width of a piece is ~4 blocks (120px) for I, but usually ~90px.
    // If we have 4 pieces in 360px, that's 90px each. That's tight.
    // Let's adjust position based on index to guarantee no overlap.

    // Define slots:
    // 1 piece: center
    // 2 pieces: 1/3, 2/3
    // 3 pieces: 1/4, 2/4, 3/4
    // 4 pieces: 1/5, 2/5, 3/5, 4/5

    // Also add slight Y jitter to prevent side-by-side friction if they expand?
    // Or make Y staggered significantly.

    for (let i = 0; i < count; i++) {
        const type = (i === 0) ? gameStateRef.current.nextType : TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];

        const segmentWidth = GAME_WIDTH / count;
        // Center of the segment
        const x = segmentWidth * i + segmentWidth / 2;

        // Stagger Y more to avoid any rotation overlap
        // e.g. 100, 160, 100, 160
        const y = 100 + (i % 2) * 70;

        const body = TetrominoFactory.create(type, x, y);
        Matter.Body.setStatic(body, true);
        Matter.World.add(engine.world, body);
        sleepTrackerRef.current[body.id] = 0;
        newIds.push(body.id);
    }

    setAvailableBodies(newIds);

    const next = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
    setNextType(next);
    gameStateRef.current.nextType = next;
  };

  const decomposeBody = (body: Matter.Body, engine: Matter.Engine) => {
    const parts = body.parts;
    const newBodies: Matter.Body[] = [];

    for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        const newBody = Matter.Bodies.rectangle(part.position.x, part.position.y, BLOCK_SIZE, BLOCK_SIZE, {
            render: { fillStyle: part.render.fillStyle },
            isStatic: true,
            label: 'settled-mino',
            collisionFilter: {
                category: CATEGORY_BLOCK
            }
        });
        newBodies.push(newBody);
    }
    Matter.World.remove(engine.world, body);
    Matter.World.add(engine.world, newBodies);
  };

  const checkLines = (engine: Matter.Engine) => {
    const bodies = Matter.Composite.allBodies(engine.world).filter(b => b.label === 'settled-mino');
    const rows: Record<number, Matter.Body[]> = {};

    bodies.forEach(b => {
        const rowIndex = Math.round(b.position.y / BLOCK_SIZE);
        if (!rows[rowIndex]) rows[rowIndex] = [];
        rows[rowIndex].push(b);
    });

    const cols = GAME_WIDTH / BLOCK_SIZE;
    let linesCleared = 0;
    let clearedY: number[] = [];

    for (const [rowIndexStr, rowBodies] of Object.entries(rows)) {
        if (rowBodies.length >= cols) {
            linesCleared++;
            const rowIndex = parseInt(rowIndexStr);
            clearedY.push(rowIndex * BLOCK_SIZE);
            rowBodies.forEach(b => Matter.World.remove(engine.world, b));
        }
    }

    if (linesCleared > 0) {
        playSound('clear');
        setScore(s => s + linesCleared * 100);
        const lowestY = Math.max(...clearedY);
        const remainingBodies = Matter.Composite.allBodies(engine.world).filter(b => b.label === 'settled-mino');
        remainingBodies.forEach(b => {
            if (b.position.y < lowestY) {
                Matter.Body.setStatic(b, false);
                Matter.Body.setVelocity(b, { x: 0, y: 0.1 });
            }
        });
    }
  };

  const snapAndLock = (body: Matter.Body, engine: Matter.Engine) => {
    playSound('snap');

    if (body.label.startsWith('tetromino')) {
         const currentAngle = body.angle;
         const normalizedAngle = Math.round(currentAngle / (Math.PI / 2)) * (Math.PI / 2);
         Matter.Body.setAngle(body, normalizedAngle);
    } else {
        Matter.Body.setAngle(body, 0);
    }

    const bounds = body.bounds;
    const width = bounds.max.x - bounds.min.x;
    const height = bounds.max.y - bounds.min.y;
    const widthBlocks = Math.round(width / BLOCK_SIZE);
    const heightBlocks = Math.round(height / BLOCK_SIZE);
    const isWidthOdd = widthBlocks % 2 !== 0;
    const isHeightOdd = heightBlocks % 2 !== 0;

    let snapX = body.position.x;
    snapX = isWidthOdd
        ? Math.floor(snapX / BLOCK_SIZE) * BLOCK_SIZE + BLOCK_SIZE / 2
        : Math.round(snapX / BLOCK_SIZE) * BLOCK_SIZE;

    let snapY = body.position.y;
    snapY = isHeightOdd
        ? Math.floor(snapY / BLOCK_SIZE) * BLOCK_SIZE + BLOCK_SIZE / 2
        : Math.round(snapY / BLOCK_SIZE) * BLOCK_SIZE;

    Matter.Body.setPosition(body, { x: snapX, y: snapY });
    Matter.Body.setVelocity(body, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(body, 0);
    Matter.Body.setStatic(body, true);

    if (body.bounds.min.y < 60) {
        // Allow some buffer, maybe check if it's STUCK near top, not just briefly there?
        // But snap happens when stopped. So if stopped near top -> game over.
        // Let's be a bit more lenient? Or consistent with standard tetris (if spawn area blocked)
        // For now, if snap Y is very small.
    }

    if (body.label.startsWith('tetromino')) {
        decomposeBody(body, engine);
        checkLines(engine);

        // Check if spawn point is blocked AFTER decompose
        // Simple game over check: if any block is above a certain line (e.g. y < 100)
        const highBlocks = Matter.Composite.allBodies(engine.world).filter(b => b.label === 'settled-mino' && b.position.y < 120);
        if (highBlocks.length > 0) {
             playSound('gameover');
             setIsGameOver(true);
             gameStateRef.current.isGameOver = true;
             return;
        }

        // Remove this body from available set?
        // Actually, we handle turns differently now.
        // If all available bodies are settled or gone, spawn new ones?
        // Or just spawn one by one?
        // User request: "1-4 pieces lined up, able to fire".
        // So we shoot ONE, then what?
        // Assuming we shoot any of them.

        // If we shot one, it's no longer "current" in the sense of selectable.
        // But others are still there.

        // Logic: If there are NO MORE static bodies in the spawn area, spawn new batch.
        // Or better: ALWAYS spawn a new one to replace the one shot?
        // User request: "もう発射したら次のやつがすぐ出るように、次の手取りミノが出るようにする。 とりあえずテンポを良くする。"
        // So when one is shot, we should refill?
        // "複数出た場合、1回の操作で画面上に1回出てるやつが一気に出るようにする" -> Wait, "一気に出る" means spawn multiple at start? Yes.
        // "もう発射したら次のやつがすぐ出る" -> refill one by one? or refill batch when empty?

        // Interpretation:
        // 1. Spawn multiple at start.
        // 2. Player shoots one.
        // 3. As soon as it's shot (and processed), maybe spawn a replacement or just wait until all are gone?
        // "1回の操作で画面上に1回出てるやつが一気に出る" -> sounds like initial spawn.
        // "発射したら次のやつがすぐ出る" -> Replenish immediately?

        // Let's try: When a piece is shot (snap or fall out), check if we need to refill to keep it exciting.
        // But if we keep refilling 1 by 1, it might get crowded or lose the "batch" feel.
        // Let's stick to: Refill when ALL from current batch are gone.
        // BUT make it faster.

        // Re-reading: "1回の操作で画面上に1回出てるやつが一気に出る" might mean "When I shoot, ALL of them launch"?
        // No, "複数出た場合" implies multiple appear.
        // "発射したら次のやつがすぐ出る" -> likely means "Don't wait for 0 pieces".

        // Let's try this: Maintain a certain number of pieces?
        // Or just: If count < MAX, spawn one?

        // Let's go with: When a piece snaps/leaves, IMMEDIATELY spawn a new batch if empty,
        // OR if we want high tempo, spawn a new single piece to replace the used one?

        // User said: "1-4 pieces lined up".
        // Let's keep the batch logic but make the refill instant when the LAST one is used.
        // Currently it waits for snap/out.

        // AND, if the user wants "next tetromino immediately", maybe we spawn a new one as soon as one leaves the spawn zone?
        // Let's try spawning a NEW single piece if the count in spawn zone drops below, say, 3?
        // No, that might overlap.

        // Simplest interpretation for "Tempo":
        // As soon as one is shot, spawn a replacement if there's room?
        // Let's stick to batch refill for now but remove delays.

        const remainingTetrominos = Matter.Composite.allBodies(engine.world).filter(b =>
            b.label.startsWith('tetromino') && b.isStatic && b.position.y < 300
        );

        if (remainingTetrominos.length === 0) {
            // Instant refill
            spawnTetrominos(engine);
        }

        currentBodyRef.current = null;
        selectedBodyIdRef.current = null;
    } else if (body.label === 'settled-mino') {
        checkLines(engine);
    }
  };

  const handleDragTimeout = () => {
    if (!currentBodyRef.current || !gameStateRef.current.isDragging) return;

    const body = currentBodyRef.current;
    Matter.Body.setStatic(body, false);
    Matter.Body.setVelocity(body, { x: 0, y: 0 });

    setIsDragging(false);
    gameStateRef.current.isDragging = false;
    setDragStart(null);
    setDragCurrent(null);
    setApplicationPoint(null);

    // Check if we need to spawn more (if this was the last one)
    // Similar logic to snapAndLock but this one just falls.
    // It will eventually snap or fall out.

    if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isGameOver) return;
    if (!engineRef.current || !sceneRef.current) return;

    const rect = sceneRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find which body is clicked
    const bodies = Matter.Query.point(Matter.Composite.allBodies(engineRef.current.world), { x, y });

    // Filter for selectable tetrominos (must be static and in spawn area/category)
    const clickedBody = bodies.find(b => b.label.startsWith('tetromino') && b.isStatic);

    if (!clickedBody) return;

    currentBodyRef.current = clickedBody;
    selectedBodyIdRef.current = clickedBody.id;

    let appPoint = { x: clickedBody.position.x, y: clickedBody.position.y };
    // If we clicked specifically on a part, use that? Matter.Query.point returns parts usually if compound?
    // Actually Matter.Query.point returns bodies. If compound, it might return the parent or part depending on config.
    // With Matter.js default, it usually hits the parent for compound bodies in standard query?
    // No, raycasting/point query often returns parts.
    // But let's use the mouse position as application point for intuitive push.
    appPoint = { x, y };

    setIsDragging(true);
    setDragStart({ x, y });
    setDragCurrent({ x, y });
    setApplicationPoint(appPoint);
    gameStateRef.current.isDragging = true;

    if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
    dragTimeoutRef.current = setTimeout(handleDragTimeout, 1000);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragCurrent({ x, y });
  };

  const handlePointerUp = () => {
    if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
    }

    if (!isDragging || !currentBodyRef.current || !dragStart || !dragCurrent || !applicationPoint || !engineRef.current) {
        setIsDragging(false);
        gameStateRef.current.isDragging = false;
        return;
    }

    playSound('shoot');

    // Push logic (Reverse of Pull)
    // dx/dy is (Current - Start)
    const dx = dragCurrent.x - dragStart.x;
    const dy = dragCurrent.y - dragStart.y;
    const forceMagnitude = 0.0010;
    const force = { x: dx * forceMagnitude, y: dy * forceMagnitude };

    const body = currentBodyRef.current;
    Matter.Body.setStatic(body, false);
    Matter.Body.applyForce(body, applicationPoint, force);

    setIsDragging(false);
    gameStateRef.current.isDragging = false;
    setDragStart(null);
    setDragCurrent(null);
    setApplicationPoint(null);
  };

  useEffect(() => {
    if (!sceneRef.current) return;
    const h = window.innerHeight;

    const engine = Matter.Engine.create();
    const world = engine.world;
    engineRef.current = engine;

    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: GAME_WIDTH,
        height: h,
        wireframes: false,
        background: '#1e293b',
      },
    });
    renderRef.current = render;

    const wallOptions = {
      isStatic: true,
      render: { fillStyle: '#475569' },
      collisionFilter: { category: CATEGORY_WALL }
    };
    const ground = Matter.Bodies.rectangle(GAME_WIDTH / 2, h + 10, GAME_WIDTH, 40, wallOptions);
    const leftWall = Matter.Bodies.rectangle(-10, h / 2, 20, h, wallOptions);
    const rightWall = Matter.Bodies.rectangle(GAME_WIDTH + 10, h / 2, 20, h, wallOptions);
    Matter.World.add(world, [ground, leftWall, rightWall]);

    spawnTetrominos(engine);

    Matter.Events.on(engine, 'beforeUpdate', () => {
        if (gameStateRef.current.isDragging || gameStateRef.current.isGameOver) return;

        const bodies = Matter.Composite.allBodies(engine.world);

        bodies.forEach(body => {
            if (body.isStatic) return;
            if (body.label === 'sub-part') return;

            const speed = body.speed;
            const angularSpeed = body.angularSpeed;

            if (speed < 0.15 && angularSpeed < 0.05) {
                sleepTrackerRef.current[body.id] = (sleepTrackerRef.current[body.id] || 0) + 1;
            } else {
                sleepTrackerRef.current[body.id] = 0;
            }

            if (sleepTrackerRef.current[body.id] > 40) {
                snapAndLock(body, engine);
                delete sleepTrackerRef.current[body.id];
            }

            if (body.position.y > h + 100) {
                Matter.World.remove(engine.world, body);

                // If the falling body was the current one (drag timeout case or shot out of bounds)
                // We need to check if we should spawn next batch
                // Use immediate check
                 const remainingTetrominos = Matter.Composite.allBodies(engine.world).filter(b =>
                    b.label.startsWith('tetromino') && b.isStatic && b.position.y < 300
                );
                if (remainingTetrominos.length === 0 && !gameStateRef.current.isGameOver) {
                     spawnTetrominos(engine);
                }
            }
        });
    });

    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      if (render.canvas) render.canvas.remove();
      engineRef.current = null;
      if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center w-full h-[100svh] justify-center bg-slate-900 overflow-hidden">
       <div className="absolute top-4 left-1/2 -translate-x-1/2 flex justify-between w-[360px] z-10 pointer-events-none text-white">
         <div className="text-xl font-bold">Score: {score}</div>
         <div className="text-sm">Next: {nextType}</div>
       </div>

       <div
        ref={sceneRef}
        className="relative touch-none cursor-crosshair shadow-lg overflow-hidden"
        style={{ width: GAME_WIDTH, height: gameHeight }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {isDragging && dragStart && dragCurrent && applicationPoint && (
            <svg className="absolute top-0 left-0 pointer-events-none" width={GAME_WIDTH} height={gameHeight}>
                {/* Drag vector (visualize drag) */}
                <line
                    x1={dragStart.x}
                    y1={dragStart.y}
                    x2={dragCurrent.x}
                    y2={dragCurrent.y}
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                />
                {/* Trajectory Prediction (Push direction = drag direction) */}
                 <line
                    x1={applicationPoint.x}
                    y1={applicationPoint.y}
                    x2={applicationPoint.x + (dragCurrent.x - dragStart.x)}
                    y2={applicationPoint.y + (dragCurrent.y - dragStart.y)}
                    stroke="yellow"
                    strokeWidth="3"
                />
                <circle cx={applicationPoint.x} cy={applicationPoint.y} r="4" fill="red" />
            </svg>
        )}

        {isGameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 pointer-events-auto">
                <h2 className="text-4xl font-bold text-red-500 mb-4">GAME OVER</h2>
                <p className="text-2xl text-white mb-8">Score: {score}</p>
                <button
                    onClick={resetGame}
                    className="px-6 py-3 bg-blue-600 text-white rounded-full text-xl hover:bg-blue-500 transition"
                >
                    Try Again
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
