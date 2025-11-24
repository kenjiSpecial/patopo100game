import * as PIXI from 'pixi.js';
import { Background } from './Background';
import { Car } from './Car';
import { ObstacleManager } from './ObstacleManager';
import { CoinManager } from './CoinManager';
import { GameState } from '../types';

export class RaceGame {
  public app: PIXI.Application;
  private background!: Background;
  private car!: Car;
  private obstacleManager!: ObstacleManager;
  private coinManager!: CoinManager;

  private gameState: GameState = 'title';
  private scrollSpeed: number = 0;
  private carY: number;
  private carWidth = 60;
  private carHeight = 100;

  // Callbacks for React UI
  private onGameOver: () => void;
  private onScoreUpdate: (points: number) => void;

  private isInitialized = false;
  private isDestroyed = false;
  private speedTimer = 0;

  constructor(
    canvasContainer: HTMLElement,
    width: number,
    height: number,
    onGameOver: () => void,
    onScoreUpdate: (points: number) => void
  ) {
    this.app = new PIXI.Application();
    this.onGameOver = onGameOver;
    this.onScoreUpdate = onScoreUpdate;
    this.carY = height * 0.8;

    // Init asynchronously
    this.init(canvasContainer, width, height);
  }

  private async init(container: HTMLElement, width: number, height: number) {
    await this.app.init({
        width,
        height,
        backgroundColor: 0x333333,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true,
    });

    // Check if destroy was called during async init
    if (this.isDestroyed || !this.app.renderer) return;

    container.appendChild(this.app.canvas);

    // Initialize components
    this.background = new Background(width, height);
    this.app.stage.addChild(this.background.container);

    this.obstacleManager = new ObstacleManager();
    this.app.stage.addChild(this.obstacleManager.container);

    this.coinManager = new CoinManager();
    this.app.stage.addChild(this.coinManager.container);

    this.car = new Car(width / 2, this.carY, this.carWidth, this.carHeight, width);
    this.app.stage.addChild(this.car.container);

    this.isInitialized = true;

    // Start Loop
    this.app.ticker.add((ticker) => {
        this.update(ticker.deltaTime, ticker.elapsedMS);
    });
  }

  public startGame() {
    if (!this.isInitialized) return;
    this.gameState = 'playing';
    this.scrollSpeed = 3000; // Initial speed back to 300
    this.speedTimer = 0;
    this.obstacleManager.reset();
    this.coinManager.reset();
    // Reset car position if needed
    this.car.x = this.app.screen.width / 2;
    this.car.container.x = this.app.screen.width / 2;
  }

  public setGameOver() {
      this.gameState = 'gameover';
      this.scrollSpeed = 0;
      // We don't call onGameOver callback here to avoid infinite loops if called from outside,
      // but internal triggers will call it.
  }

  private handleCollision() {
      this.gameState = 'gameover';
      this.scrollSpeed = 0;
      this.onGameOver();
  }

  private handleCoinCollect() {
      this.onScoreUpdate(1);
  }

  private update(delta: number, elapsedMS: number) {
    if (this.isDestroyed || !this.isInitialized || !this.background) return;


    this.background.update(delta, this.scrollSpeed);
    this.car.update(delta, this.gameState);

    this.obstacleManager.update(
        delta,
        this.gameState,
        this.scrollSpeed,
        this.app.screen.width,
        this.app.screen.height,
        this.car.x,
        this.carY,
        this.carWidth,
        this.carHeight,
        () => this.handleCollision()
    );

    this.coinManager.update(
        delta,
        this.gameState,
        this.scrollSpeed,
        this.app.screen.width,
        this.app.screen.height,
        this.car.x,
        this.carY,
        this.carWidth,
        this.carHeight,
        () => this.handleCoinCollect()
    );
  }

  public resize(width: number, height: number) {
      if (!this.app.renderer) return;
      this.app.renderer.resize(width, height);

      if (this.background) this.background.resize(width, height);
      if (this.car) {
          this.car.resize(width);
          // Re-center car Y if height changed drastically?
          // For now keep relative or fixed. Fixed Y is simpler for collision.
      }
      // Obstacles/Coins might need cleanup if screen shrinks too much, but they just despawn naturally.
  }

  public destroy() {
      this.isDestroyed = true;
      // Stop the ticker to prevent update loop from running

      // try {
      //   this.app.destroy(true, { children: true, texture: true });
      // } catch (e) {
      //   console.warn('Error destroying Pixi application:', e);
      // }
      // if (this.car) {
      //   this.car.destroy();
      // }
  }
}

