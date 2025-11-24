import * as PIXI from 'pixi.js';
import { Coin, GameState } from '../types';

export class CoinManager {
  public container: PIXI.Container;
  private coins: Coin[] = [];
  private coinGraphics: Map<string, PIXI.Graphics> = new Map();
  private lastSpawnTime = 0;

  constructor() {
    this.container = new PIXI.Container();
  }

  public reset() {
    this.coins = [];
    this.container.removeChildren();
    this.coinGraphics.clear();
    this.lastSpawnTime = 0;
  }

  public update(
    delta: number,
    gameState: GameState,
    scrollSpeed: number,
    screenWidth: number,
    screenHeight: number,
    carX: number,
    carY: number,
    carWidth: number,
    carHeight: number,
    onCollect: () => void
  ) {
    if (gameState !== 'playing') return;

    const now = Date.now();
    if (now - this.lastSpawnTime > 800) {
      if (Math.random() > 0.3) {
        this.spawnCoin(screenWidth, screenHeight, now);
      }
      this.lastSpawnTime = now;
    }

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.y += scrollSpeed * (1/60); // Move down

      const g = this.coinGraphics.get(coin.id);
      if (g) {
          g.y = coin.y;
      }

      if (coin.y > screenHeight + 50) {
          this.removeCoin(i);
          continue;
      }

      // Collision
      const carLeft = carX - carWidth / 2;
      const carRight = carX + carWidth / 2;
      const carTop = carY - carHeight / 2;
      const carBottom = carY + carHeight / 2;

      const coinLeft = coin.x - coin.width / 2;
      const coinRight = coin.x + coin.width / 2;
      const coinTop = coin.y - coin.height / 2;
      const coinBottom = coin.y + coin.height / 2;

      if (
          carRight > coinLeft &&
          carLeft < coinRight &&
          carBottom > coinTop &&
          carTop < coinBottom
        ) {
            onCollect();
            this.removeCoin(i);
        }
    }
  }

  private spawnCoin(screenWidth: number, screenHeight: number, now: number) {
      const laneCount = 3;
      const roadWidth = Math.min(screenWidth, 600);
      const sideWidth = (screenWidth - roadWidth) / 2;
      const laneWidth = roadWidth / laneCount;
      const lane = Math.floor(Math.random() * laneCount);
      const x = sideWidth + lane * laneWidth + laneWidth / 2;

      const newCoin: Coin = {
        id: `coin-${now}-${Math.random()}`,
        x: x,
        y: -50, // Start above screen
        width: 30,
        height: 30,
      };

      this.coins.push(newCoin);

      const g = new PIXI.Graphics();
      g.x = x;
      g.y = newCoin.y;

      // Gold Coin
      g.circle(0, 0, 15);
      g.fill(0xFFD700);

      // Shine
      g.circle(-5, -5, 5);
      g.fill({ color: 0xFFFFFF, alpha: 0.5 });

      this.container.addChild(g);
      this.coinGraphics.set(newCoin.id, g);
  }

  private removeCoin(index: number) {
      const coin = this.coins[index];
      const g = this.coinGraphics.get(coin.id);
      if (g) {
          this.container.removeChild(g);
          g.destroy();
          this.coinGraphics.delete(coin.id);
      }
      this.coins.splice(index, 1);
  }
}

