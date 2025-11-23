"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

interface DoorProps {
  position: [number, number, number];
  onClick: () => void;
  isOpen: boolean;
  label: string;
  result?: 'safe' | 'out' | null;
  disabled: boolean;
}

export default function Door3D({ position, onClick, isOpen, label, result, disabled }: DoorProps) {
  const doorPanelRef = useRef<THREE.Group>(null);
  // テキストコンポーネントへの参照（SafeとOutで分ける）
  const safeTextRef = useRef<any>(null);
  const outTextRef = useRef<any>(null);

  // テクスチャの読み込み
  const textureUrl = label === "A" ? "/door-A.jpeg" : "/door-B.jpeg";
  const doorTexture = useTexture(textureUrl);

  // GSAPアニメーション
  useEffect(() => {
    const targetRef = result === 'safe' ? safeTextRef.current : outTextRef.current;
    const otherRef = result === 'safe' ? outTextRef.current : safeTextRef.current;

    // 使われていない方のテキストは非表示にしておく
    if (otherRef) {
        otherRef.fillOpacity = 0;
        otherRef.outlineOpacity = 0;
    }

    if (!targetRef) return;

    // アニメーションのクリーンアップ
    gsap.killTweensOf(targetRef);

    if (isOpen) {
      // ドアが開くときは、少し遅れてフェードイン
      // 初期状態を確実にセット
      targetRef.fillOpacity = 0;
      targetRef.outlineOpacity = 0;

      gsap.to(targetRef, {
        fillOpacity: 1,
        outlineOpacity: 1,
        duration: 0.5,
        delay: 0.2, // ドアが開き始めてから少し待つ
        ease: "power2.out"
      });
    } else {
      // 閉じる（リセット）ときは即座に非表示
      targetRef.fillOpacity = 0;
      targetRef.outlineOpacity = 0;
    }
  }, [isOpen, result]);

  // ドアの開閉アニメーション
  useFrame((state, delta) => {
    if (!doorPanelRef.current) return;

    // 開く角度の目標値 (ラジアン)
    // 開くときは90度(Math.PI / 2)回転
    const targetRotation = isOpen ? -Math.PI / 2 : 0;

    // 現在の角度から目標角度へ近づける (Lerp)
    const step = 5 * delta;
    doorPanelRef.current.rotation.y = THREE.MathUtils.lerp(
      doorPanelRef.current.rotation.y,
      targetRotation,
      step
    );
  });

  const handlePointerOver = () => {
    if (disabled) return;
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    document.body.style.cursor = "auto";
  };

  // ドアの色: 赤と青の派手な色
  const isLeft = position[0] < 0;
  const frameColor = "#fbbf24"; // 金色フレーム

  // 結果表示の色（ドアの奥に見える色）
  const resultColor = result === 'safe' ? '#FFD700' : '#1a1a1a'; // Safe=Gold, Out=Dark

  return (
    <group position={position}>
      {/* ドア枠 - 少し太くして存在感を出す */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[1.5, 2.3, 0.15]} />
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 装飾：枠の上のネオン的な発行体 */}
      <mesh position={[0, 2.4, 0]}>
        <boxGeometry args={[1.4, 0.2, 0.1]} />
        <meshStandardMaterial color={isLeft ? "#ff4444" : "#4444ff"} emissive={isLeft ? "#ff0000" : "#0000ff"} emissiveIntensity={2} />
      </mesh>

      {/* ドアの中身（開いたときに見える部分） */}
      <mesh position={[0, 1.1, -0.05]}>
        <planeGeometry args={[1.28, 2.08]} />
        <meshBasicMaterial color={resultColor} />

        {/* SAFEテキスト */}
          <Text
            ref={safeTextRef}
            position={[0, 0, 0.2]}
            fontSize={0.5}
            color="black"
            outlineWidth={0.02}
            outlineColor="white"
            fillOpacity={0} // 初期値0
            outlineOpacity={0}
          >
            SAFE
          </Text>

        {/* OUTテキスト */}
          <Text
            ref={outTextRef}
            position={[0, 0, 0.2]}
            fontSize={0.5}
            color="red"
            outlineWidth={0.02}
            outlineColor="white"
            fillOpacity={0}
            outlineOpacity={0}
          >
            OUT
          </Text>
      </mesh>

      {/* 回転するドア板（左端をヒンジにして開閉） */}
      <group ref={doorPanelRef} position={[-0.65, 1.1, 0.05]}>
        <mesh
          position={[0.65, 0, 0]} // ヒンジからの相対位置でドア全体を配置
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onClick();
          }}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <boxGeometry args={[1.3, 2.1, 0.08]} />

          {/* テクスチャを適用 */}
          <meshStandardMaterial map={doorTexture} metalness={0.3} roughness={0.4} />

          {/* ドアノブ */}
          <mesh position={[0.5, 0, 0.08]}>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial color="gold" metalness={1} roughness={0.1} />
          </mesh>
        </mesh>
      </group>
    </group>
  );
}
