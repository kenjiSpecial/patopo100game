"use client";

import { useEffect, useState, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Stars, Sparkles, useTexture } from "@react-three/drei";
import * as THREE from "three";
import Door3D from "./Door3D";
import { GameState, DoorResult } from "../_hooks/useDoorGame";

interface Scene3DProps {
  gameState: GameState;
  selectedDoor: number | null;
  result: DoorResult | null;
  onChooseDoor: (index: number) => void;
}

function BackgroundImage() {
  const texture = useTexture("/donki-bg.png");
  const { viewport, size } = useThree();

  // 画面アスペクト比と画像アスペクト比を考慮してカバーするように調整
  // 画像のアスペクト比は 800:600 (1.33) と仮定
  const imageAspect = 800 / 600;
  const viewportAspect = viewport.width / viewport.height;

  // カメラからの距離
  const distance = 15;

  // 背景の位置 (中央)
  const position: [number, number, number] = [0, 0, -distance];

  // スケール計算: 常に画面を覆うように
  const scaleX = viewportAspect < imageAspect
      ? viewport.height * imageAspect * 2.5  // 縦に合わせて横をトリミング（拡大）
      : viewport.width * 2.5;                // 横に合わせて縦をトリミング（拡大）

  const scaleY = viewportAspect < imageAspect
      ? viewport.height * 2.5
      : viewport.width / imageAspect * 2.5;

  return (
    <mesh position={position} scale={[scaleX, scaleY, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

function CameraController() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0, 0); // 画面中央（上下の中心）を見るように調整
  }, [camera]);
  return null;
}

export default function Scene3D({ gameState, selectedDoor, result, onChooseDoor }: Scene3DProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window === "undefined") return;
      setIsMobile(window.innerWidth < 768);
    };

    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  // カメラ位置調整：上下に並ぶため、全体が収まるように距離と高さを調整
  const cameraPosition = [0, 0, isMobile ? 9 : 8] as [number, number, number];
  // PC(横長)の場合は縦が見切れないようにFOVを調整、スマホ(縦長)は縦に余裕があるのでそのままでOK
  const cameraFov = isMobile ? 50 : 60;

  // ドアの配置位置 (上下に配置)
  // 全体的にもう少し下げるためにオフセットを追加
  const offsetY = -1.5;
  const doorSpacing = 1.4;

  const doorTopY = doorSpacing + offsetY;
  const doorBottomY = -doorSpacing + offsetY;

  // 下のドアの底面に合わせて床を下げる
  const floorY = doorBottomY;

  return (
    <div className="w-full h-full absolute inset-0 bg-[#1a1a2e]">
      <Canvas shadows camera={{ position: cameraPosition, fov: cameraFov }}>
        <Suspense fallback={null}>
          <BackgroundImage />
        </Suspense>
        <CameraController />

        {/* 環境・ライティング */}
        <ambientLight intensity={1.5} />
        <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, 5, -10]} intensity={1} />
        <hemisphereLight intensity={0.5} groundColor="#000000" />

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="city" />

        {/* 演出エフェクト */}
        {result === 'safe' && selectedDoor !== null && (
          <Sparkles
            position={[0, (selectedDoor === 0 ? doorTopY : doorBottomY) + 1, 0]}
            count={50}
            scale={2}
            size={6}
            speed={0.4}
            opacity={1}
            color="yellow"
          />
        )}

        {result === 'out' && selectedDoor !== null && (
           <spotLight
              position={[0, (selectedDoor === 0 ? doorTopY : doorBottomY) + 3, 2]}
              angle={0.5}
              penumbra={0.5}
              intensity={10}
              color="red"
              castShadow
           />
        )}


        {/* 上のドア (Index 0: A) */}
        <Door3D
          position={[0, doorTopY, 0]}
          onClick={() => onChooseDoor(0)}
          isOpen={selectedDoor === 0}
          label="A"
          result={selectedDoor === 0 ? result : null}
          disabled={gameState !== 'playing'}
        />

        {/* 下のドア (Index 1: B) */}
        <Door3D
          position={[0, doorBottomY, 0]}
          onClick={() => onChooseDoor(1)}
          isOpen={selectedDoor === 1}
          label="B"
          result={selectedDoor === 1 ? result : null}
          disabled={gameState !== 'playing'}
        />

      </Canvas>
    </div>
  );
}
