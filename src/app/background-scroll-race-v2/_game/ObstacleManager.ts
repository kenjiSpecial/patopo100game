import * as PIXI from 'pixi.js';
import { Obstacle, GameState } from '../types';

export class ObstacleManager {
  public container: PIXI.Container;
  private obstacles: Obstacle[] = [];
  private obstacleGraphics: Map<string, PIXI.Graphics> = new Map();
  private lastSpawnTime = 0;

  constructor() {
    this.container = new PIXI.Container();
  }

  public reset() {
    this.obstacles = [];
    this.container.removeChildren();
    this.obstacleGraphics.clear();
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
    onCollision: () => void
  ) {
    if (gameState !== 'playing') return;

    const now = Date.now();
    if (now - this.lastSpawnTime > 450) { // Increased to 10x (4500 / 10)
      this.spawnObstacle(screenWidth, screenHeight, now);
      this.lastSpawnTime = now;
    }

    // Move and Check Collision
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.y += (scrollSpeed + obs.speedOffset) * (1/60); // Move down

      // Update graphic position
      const g = this.obstacleGraphics.get(obs.id);
      if (g) {
          g.y = obs.y;
      }

      // Remove if off screen bottom
      if (obs.y > screenHeight + 100) {
          this.removeObstacle(i);
          continue;
      }

      // Collision
      const carLeft = carX - carWidth / 2 + 10;
      const carRight = carX + carWidth / 2 - 10;
      const carTop = carY - carHeight / 2 + 10;
      const carBottom = carY + carHeight / 2 - 10;

      const obsLeft = obs.x - obs.width / 2;
      const obsRight = obs.x + obs.width / 2;
      const obsTop = obs.y - obs.height / 2;
      const obsBottom = obs.y + obs.height / 2;

      if (
          carRight > obsLeft &&
          carLeft < obsRight &&
          carBottom > obsTop &&
          carTop < obsBottom
        ) {
          onCollision();
        }
    }
  }

  private spawnObstacle(screenWidth: number, screenHeight: number, now: number) {
      const laneCount = 3;
      const roadWidth = Math.min(screenWidth, 600);
      const sideWidth = (screenWidth - roadWidth) / 2;
      const laneWidth = roadWidth / laneCount;
      const lane = Math.floor(Math.random() * laneCount);
      const x = sideWidth + lane * laneWidth + laneWidth / 2;

      const newObstacle: Obstacle = {
        id: `obs-${now}`,
        type: 'cone',
        x: x,
        y: -100, // Start above screen
        width: 50,
        height: 50,
        speedOffset: 0,
      };

      this.obstacles.push(newObstacle);

      const g = new PIXI.Graphics();
      g.x = x;
      g.y = newObstacle.y;

      // Draw Cone
      g.poly([
        0, -newObstacle.height/2,
        newObstacle.width/2, newObstacle.height/2,
        -newObstacle.width/2, newObstacle.height/2
      ]);
      g.fill(0xFFA500);

      this.container.addChild(g);
      this.obstacleGraphics.set(newObstacle.id, g);
  }

  private removeObstacle(index: number) {
      const obs = this.obstacles[index];
      const g = this.obstacleGraphics.get(obs.id);
      if (g) {
          this.container.removeChild(g);
          g.destroy();
          this.obstacleGraphics.delete(obs.id);
      }
      this.obstacles.splice(index, 1);
  }
}

