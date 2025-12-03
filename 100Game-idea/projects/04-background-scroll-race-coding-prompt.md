# 背景スクロールレースゲーム - コーディング実装プロンプト

## プロジェクト概要

**ゲーム名**: 背景スクロールレースゲーム
**ジャンル**: レース・アクションゲーム
**ターゲット**: スマホ（モバイルブラウザ）
**技術スタック**: Next.js（TypeScript）、Cloudflareデプロイ

---

## ゲームコンセプト

- **車の位置は画面中央で固定**し、**背景がスクロール**して動くことでレース感を演出
- 左右にスワイプ/タップで車を左右に移動
- 障害物やコインを避けながら進む
- 走行距離やコイン獲得数をスコアに
- シンプルな操作で「スピード感」「反射神経」を楽しむミニゲーム

---

## 技術仕様

### フレームワーク・環境
- **フレームワーク**: Next.js（TypeScript）
- **ゲームライブラリ**: pixi-react（ReactコンポーネントとしてPixiJSを使用）
- **デプロイ先**: Cloudflare
- **表現**: pixi-reactを使用した2Dレンダリング（スプライト、コンテナ、パーティクル）
- **ゲームディレクトリ名**: `background-scroll-race`
- **ページ構成**: `app/background-scroll-race/page.tsx` に1画面完結のゲームページ
- **依存パッケージ**: `@pixi/react` と `pixi.js` をインストール必要

### 状態管理
- `useState` / `useEffect` で以下を管理:
  - 車の位置（X座標）
  - 障害物の配列（位置、種類）
  - コインの配列（位置）
  - スコア（走行距離、コイン数）
  - スクロール速度
  - ゲーム状態（タイトル/ゲーム中/ゲームオーバー）

### 操作実装
- **PC**: 左右矢印キー or マウスクリックで車を左右に移動
- **スマホ**: `onTouchStart` / `onTouchMove` / `onTouchEnd` でスワイプ操作を実装
- 車の移動範囲は画面幅の範囲内で制限

---

## ゲームルール

### 基本ルール
1. 画面中央に車が固定表示される
2. 背景が下方向にスクロールして動き、レース感を演出
3. 画面下から障害物（他の車、コーン、マンホールなど）が上方向に出現
4. プレイヤーは左右にスワイプ/タップして車を左右に移動し、障害物を避ける
5. 障害物に衝突するとゲームオーバー
6. コインやアイテムを取得するとスコアが加算される
7. 時間経過とともにスクロール速度が徐々に上がる

### スコア計算
- **スコア = 走行距離（メートル）+ コイン獲得数 × 10**
- 走行距離は時間経過とスクロール速度から計算

### ゲームオーバー条件
- 障害物に衝突した時点でゲーム終了
- 最高スコアを競う

---

## 実装の優先順位

### Phase 1: コア機能（必須）
1. **pixi-react Stage の初期化**
   - `Stage` コンポーネントを使用してPixiJSアプリケーションを初期化
   - 画面サイズに応じてリサイズ対応（`width`, `height` props）
   - `useTick` hook でゲームループを実装

2. **背景スクロールの実装**
   - 背景スプライト（道路画像）を `Container` コンポーネントで管理
   - `useTick` hook の `deltaTime` を使用して背景を下方向にスクロール（`sprite.y += scrollSpeed * deltaTime`）
   - スクロール速度は時間経過とともに段階的に増加
   - 背景が画面外に出たら、上に戻してループさせる（シームレススクロール）

3. **車の左右移動**
   - 車のスプライトを `Sprite` コンポーネントで画面中央（Y座標固定）に配置
   - 左右スワイプ/タップ/キー入力でX座標を変更（`x` prop を更新）
   - 画面幅の範囲内で移動を制限

4. **障害物の生成と移動**
   - 障害物スプライトを `Container` コンポーネントで管理
   - 一定間隔で障害物を生成（画面下から出現）
   - `useTick` hook で障害物を上方向に移動（`sprite.y -= scrollSpeed * deltaTime`）
   - 画面外（上方向）に出たら配列から削除（Reactの状態管理）

5. **衝突判定**
   - 車と障害物の矩形衝突判定を実装（`getBounds()` を使用、`useRef` でスプライト参照を取得）
   - `useTick` hook の各フレームでチェック（60fps）

5. **コインの生成と取得**
   - 一定間隔でコインを生成
   - 車とコインの衝突判定で取得
   - 取得時にスコア加算

6. **スコア表示**
   - 画面左上に「距離: XXXm」
   - 画面右上に「コイン: XX」

7. **ゲームオーバー画面**
   - 衝突時にゲームオーバー状態に遷移
   - スコアを大きく表示
   - リトライボタンで再開

### Phase 2: 演出（重要）
8. **ヒットストップ演出**
   - コイン取得時: 画面全体を0.1〜0.15秒停止 → スローから通常速度に復帰
   - 障害物ギリギリ回避時: 0.05〜0.1秒の短いヒットストップ
   - 衝突時: 0.2〜0.3秒のヒットストップ

9. **視線誘導演出**
   - 障害物が近づくにつれて、わずかに拡大・強調表示（`sprite.scale.set(1.0 → 1.1)`）
   - コインが回転・光るアニメーション（`ticker` で `sprite.rotation` を更新、または `AnimatedSprite` を使用）

10. **リスクとリターンの演出**
    - 障害物接近時: 画面の端が赤くフラッシュ（`Graphics` で半透明の赤い矩形を描画）
    - 衝突直前0.5秒前から画面がわずかに震える（`Application.stage.position` を `ticker` で揺らす）
    - コイン取得時: 光るエフェクト＋スコア加算のアニメーション（`Text` の `scale` や `alpha` をアニメーション）
    - 距離達成時（100m、500m、1000mなど）: 画面全体が一瞬光る（`Graphics` で白い矩形を描画して `alpha` をアニメーション）＋「○○m達成！」バナー表示（`Text` スプライト）

11. **ナチュラル・チュートリアル**
    - 最初の数秒間、左右にスワイプ/タップすると、車が移動する方向に矢印や光るエフェクトを表示
    - 障害物が画面下から出現する際、わずかに影や予告エフェクトを表示

12. **衝突エフェクト**
    - 衝突時に火花・煙のパーティクルエフェクト（PixiJSの `ParticleContainer` または `@pixi/particles` を使用）
    - 車が一瞬赤くフラッシュ（`sprite.tint` を赤に変更して `ticker` で元に戻す）

### Phase 3: サウンド・最終調整
13. **サウンド追加**
    - BGM: テンポが上がっていくレース系のループ音楽
    - SE: コイン取得（チリン）、衝突（クラッシュ音）、距離達成（ファンファーレ）

14. **タイトル画面**
    - ゲーム開始前のタイトル画面
    - 「TAP TO START」ボタン

15. **最終調整**
    - 難易度調整（障害物の生成頻度、スクロール速度の増加率）
    - パフォーマンス最適化

---

## 実装の詳細仕様

### pixi-react Stage の初期化
```typescript
import { Stage, Container, Sprite, useTick } from '@pixi/react';
import { useRef, useState } from 'react';

export default function BackgroundScrollRace() {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  return (
    <Stage
      width={width}
      height={height}
      options={{
        backgroundColor: 0x1a1a2e,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      }}
    >
      {/* ゲームコンテンツ */}
    </Stage>
  );
}
```

### 背景スクロール
```typescript
import { Container, Sprite, useTick } from '@pixi/react';
import { useRef, useState } from 'react';

function Background() {
  const backgroundRef = useRef<PIXI.Sprite>(null);
  const [scrollSpeed, setScrollSpeed] = useState(100);

  useTick((delta) => {
    if (backgroundRef.current) {
      const deltaTime = delta / 60; // 正規化されたデルタタイム
      backgroundRef.current.y += scrollSpeed * deltaTime;

      // 画面外に出たら上に戻す（シームレススクロール）
      if (backgroundRef.current.y > window.innerHeight) {
        backgroundRef.current.y = -backgroundRef.current.height;
      }
    }
  });

  return (
    <Container>
      <Sprite
        ref={backgroundRef}
        image="road-texture.png"
        x={0}
        y={0}
      />
    </Container>
  );
}
// スクロール速度は時間経過とともに増加（例: 初期100px/s → 最大500px/s）
```

### 車の位置管理
```typescript
import { Sprite } from '@pixi/react';
import { useState, useEffect } from 'react';

function Car() {
  const [carX, setCarX] = useState(window.innerWidth / 2);
  const carY = window.innerHeight * 0.7; // 画面中央より下（Y座標固定）

  // 左右移動
  const moveCar = (direction: 'left' | 'right') => {
    const moveSpeed = 5;
    setCarX((prevX) => {
      if (direction === 'left') {
        return Math.max(50, prevX - moveSpeed);
      } else {
        return Math.min(window.innerWidth - 50, prevX + moveSpeed);
      }
    });
  };

  // キーボード・タッチイベントの処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') moveCar('left');
      if (e.key === 'ArrowRight') moveCar('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Sprite
      image="car.png"
      anchor={0.5} // アンカーを中央に設定
      x={carX}
      y={carY}
    />
  );
}
```

### 障害物・コインの生成
```typescript
import { Container, Sprite, useTick } from '@pixi/react';
import { useState, useEffect, useRef } from 'react';

interface Obstacle {
  id: string;
  type: 'car' | 'cone' | 'barrier' | 'manhole' | 'oil' | 'crack' | 'hazard' | 'train';
  x: number;
  y: number;
}

interface Coin {
  id: string;
  x: number;
  y: number;
}

function Obstacles() {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [scrollSpeed, setScrollSpeed] = useState(100);
  const lastObstacleTimeRef = useRef(0);

  // 一定間隔（例: 1.5秒）で障害物を生成
  useTick(() => {
    const currentTime = Date.now();
    if (currentTime - lastObstacleTimeRef.current > 1500) {
      const newObstacle: Obstacle = {
        id: `obstacle-${Date.now()}`,
        type: 'cone',
        x: getRandomLanePosition(), // ランダムなレーン位置（左、中央、右）
        y: window.innerHeight, // 画面下から出現
      };
      setObstacles((prev) => [...prev, newObstacle]);
      lastObstacleTimeRef.current = currentTime;
    }

    // 障害物を上方向に移動
    setObstacles((prev) =>
      prev
        .map((obstacle) => ({
          ...obstacle,
          y: obstacle.y - scrollSpeed * (1 / 60), // 60fps想定
        }))
        .filter((obstacle) => obstacle.y > -100) // 画面外に出たら削除
    );
  });

  return (
    <Container>
      {obstacles.map((obstacle) => (
        <Sprite
          key={obstacle.id}
          image={`${obstacle.type}.png`}
          x={obstacle.x}
          y={obstacle.y}
        />
      ))}
    </Container>
  );
}
```

### 衝突判定
```typescript
import { useTick } from '@pixi/react';
import { useRef } from 'react';
import * as PIXI from 'pixi.js';

function Game() {
  const carRef = useRef<PIXI.Sprite>(null);
  const obstaclesRef = useRef<PIXI.Container>(null);

  // 矩形衝突判定（PixiJSの getBounds() を使用）
  const checkCollision = (carSprite: PIXI.Sprite, obstacleSprite: PIXI.Sprite): boolean => {
    const carBounds = carSprite.getBounds();
    const obstacleBounds = obstacleSprite.getBounds();

    // 許容誤差を考慮（例: 10pxのマージン）
    const margin = 10;

    return (
      carBounds.x + margin < obstacleBounds.x + obstacleBounds.width - margin &&
      carBounds.x + carBounds.width - margin > obstacleBounds.x + margin &&
      carBounds.y + margin < obstacleBounds.y + obstacleBounds.height - margin &&
      carBounds.y + carBounds.height - margin > obstacleBounds.y + margin
    );
  };

  // useTick で衝突判定を実行
  useTick(() => {
    if (carRef.current && obstaclesRef.current) {
      obstaclesRef.current.children.forEach((obstacle) => {
        if (checkCollision(carRef.current!, obstacle as PIXI.Sprite)) {
          // 衝突処理
          handleCollision();
        }
      });
    }
  });

  return (
    <>
      <Sprite ref={carRef} image="car.png" />
      <Container ref={obstaclesRef}>
        {/* 障害物 */}
      </Container>
    </>
  );
}
```

### ヒットストップ実装
```typescript
import { useTick } from '@pixi/react';
import { useState, useRef } from 'react';

function Game() {
  const [isHitStop, setIsHitStop] = useState(false);
  const hitStopStartTimeRef = useRef(0);
  const [scrollSpeed, setScrollSpeed] = useState(100);

  // コイン取得時
  const triggerHitStop = (duration: number) => {
    setIsHitStop(true);
    hitStopStartTimeRef.current = Date.now();
    // 背景スクロール速度を0にする
    setScrollSpeed(0);
  };

  // useTick でヒットストップを管理
  useTick(() => {
    if (isHitStop) {
      const elapsed = Date.now() - hitStopStartTimeRef.current;
      if (elapsed >= 150) { // 0.15秒
        setIsHitStop(false);
        // 通常速度に復帰
        setScrollSpeed(100);
      } else {
        // ヒットストップ中は背景スクロールを停止
        return;
      }
    }

    // 通常のゲームロジック
    if (!isHitStop) {
      // 背景スクロール、障害物移動など
    }
  });

  return (
    <>
      {/* ゲームコンテンツ */}
    </>
  );
}
```

---

## UI/UX要件

### 画面構成
1. **タイトル画面**
   - ゲームタイトル「BACKGROUND SCROLL RACE」
   - 「TAP TO START」ボタン

2. **ゲーム中画面**
   - 背景（スクロールする道路）
   - 車（画面中央固定）
   - 障害物・コイン（動的に生成・移動）
   - UI: 距離表示（左上）、コイン数表示（右上）

3. **ゲームオーバー画面**
   - 「GAME OVER」テキスト
   - スコア表示（距離、コイン数）
   - 「RETRY」ボタン

### レスポンシブ対応
- モバイルファーストで設計
- 画面サイズに応じて車・障害物のサイズを調整
- タッチ操作を優先、PCはキーボード操作も対応

---

## 演出の実装詳細

### ヒットストップ
- `useTick` hook 内で `isHitStop` フラグをチェックし、ヒットストップ中は背景・障害物の移動を停止
- 背景スクロール速度を0にする（`setScrollSpeed(0)`）
- `Date.now()` で経過時間を計測し、指定時間後に復帰

### 視線誘導
- 障害物の `scale` prop を距離に応じて変更（`useTick` で更新）
- コインの `rotation` prop を `useTick` で更新して回転アニメーション（または `AnimatedSprite` コンポーネントを使用）

### リスク表示
- 障害物が近づいた時（距離 < 200px）、`Graphics` コンポーネントで半透明の赤い矩形を画面端に描画
- 衝突直前（距離 < 100px）、`Stage` の `position` を `useTick` でランダムに揺らす（または専用のContainerで実装）

### パーティクルエフェクト
- コイン取得時: `ParticleContainer` コンポーネントまたは `@pixi/particles` で星や光のパーティクルを車の位置から放射状に表示
- 衝突時: 火花や煙のパーティクルを衝突位置から表示（`ParticleContainer` コンポーネントを使用）

---

## パフォーマンス最適化

- 画面外に出た障害物・コインは即座に配列から削除（Reactの状態管理）
- 衝突判定は必要最小限の頻度で実行（`useTick` の各フレーム = 60fps）
- PixiJSは自動的にWebGL/CanvasでGPU加速を活用
- 画像は適切なサイズに最適化（`Texture` のキャッシュを活用）
- `ParticleContainer` コンポーネントを使用してパーティクルの描画を最適化
- 不要なスプライトは配列から削除してReactが自動的にアンマウント
- `useMemo` や `useCallback` を適切に使用して再レンダリングを最適化

---

## デバッグ・テスト項目

- [ ] 車の左右移動がスムーズに動作するか
- [ ] 背景スクロールが途切れないか
- [ ] 衝突判定が正確か（誤検知・見逃しがないか）
- [ ] コイン取得が正常に動作するか
- [ ] スコア計算が正確か
- [ ] ゲームオーバー後のリトライが正常に動作するか
- [ ] モバイル・PC両方で操作が可能か
- [ ] ヒットストップが適切なタイミングで発動するか
- [ ] 演出が重すぎず、パフォーマンスに影響しないか

---

## 参考実装イメージ

### 基本的な構造
```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { Stage, Container, Sprite, useTick } from '@pixi/react';
import * as PIXI from 'pixi.js';

export default function BackgroundScrollRace() {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const [gameState, setGameState] = useState<'title' | 'playing' | 'gameover'>('title');
  const [scrollSpeed, setScrollSpeed] = useState(100);
  const [score, setScore] = useState({ distance: 0, coins: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Stage
      width={width}
      height={height}
      options={{
        backgroundColor: 0x1a1a2e,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      }}
    >
      <Container>
        {/* 背景 */}
        <Background scrollSpeed={scrollSpeed} />

        {/* 車 */}
        <Car />

        {/* 障害物 */}
        <Obstacles scrollSpeed={scrollSpeed} />

        {/* コイン */}
        <Coins scrollSpeed={scrollSpeed} />
      </Container>
    </Stage>
  );
}

// 背景コンポーネント
function Background({ scrollSpeed }: { scrollSpeed: number }) {
  const backgroundRef = useRef<PIXI.Sprite>(null);

  useTick((delta) => {
    if (backgroundRef.current) {
      const deltaTime = delta / 60;
      backgroundRef.current.y += scrollSpeed * deltaTime;
      if (backgroundRef.current.y > window.innerHeight) {
        backgroundRef.current.y = -backgroundRef.current.height;
      }
    }
  });

  return (
    <Sprite
      ref={backgroundRef}
      image="road-texture.png"
      x={0}
      y={0}
    />
  );
}

// 車コンポーネント
function Car() {
  const [carX, setCarX] = useState(window.innerWidth / 2);
  const carY = window.innerHeight * 0.7;

  // キーボード・タッチイベント処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setCarX((x) => Math.max(50, x - 5));
      if (e.key === 'ArrowRight') setCarX((x) => Math.min(window.innerWidth - 50, x + 5));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Sprite
      image="car.png"
      anchor={0.5}
      x={carX}
      y={carY}
    />
  );
}
```

---

## 注意事項

- **まずはPhase 1（コア機能）を完成させる**ことを優先
- 演出は後から追加可能なので、まずはゲームとして成立する状態を目指す
- パフォーマンスを意識し、過度な演出は避ける
- モバイルでの動作を最優先に考慮

---

## 質問・不明点がある場合

実装中に不明点や技術的な判断が必要な場合は、以下の優先順位で判断してください：
1. シンプルで実装しやすい方法を選択
2. パフォーマンスを優先
3. モバイルでの動作を優先
4. 必要に応じて企画書を参照

