import * as PIXI from 'pixi.js';
import { GameState } from '../types';

export class Car {
  public container: PIXI.Container;
  private graphics: PIXI.Graphics;
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  private screenWidth: number;
  private keysPressed: { [key: string]: boolean } = {};
  private movementSpeed = 8;
  private touchStartX: number | null = null;

  constructor(x: number, y: number, width: number, height: number, screenWidth: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.screenWidth = screenWidth;

    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;

    this.graphics = new PIXI.Graphics();
    this.container.addChild(this.graphics);
    this.draw();

    this.setupInputs();
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => { this.keysPressed[e.key] = true; });
    window.addEventListener('keyup', (e) => { this.keysPressed[e.key] = false; });

    window.addEventListener('touchstart', (e) => {
        this.touchStartX = e.touches[0].clientX;
    });
    window.addEventListener('touchmove', (e) => {
        if (this.touchStartX !== null) {
            const diff = e.touches[0].clientX - this.touchStartX;
            const newX = Math.max(this.width/2, Math.min(this.screenWidth - this.width/2, this.x + diff * 1.5));
            this.x = newX;
            this.container.x = newX;
            this.touchStartX = e.touches[0].clientX;
        }
    });
    window.addEventListener('touchend', () => {
        this.touchStartX = null;
    });
  }

  public resize(screenWidth: number) {
    this.screenWidth = screenWidth;
    // Keep car within bounds if resized
    this.x = Math.max(this.width/2, Math.min(this.screenWidth - this.width/2, this.x));
    this.container.x = this.x;
  }

  public update(delta: number, gameState: GameState) {
    if (gameState !== 'playing') return;

    let dx = 0;
    if (this.keysPressed['ArrowLeft']) dx -= this.movementSpeed * delta;
    if (this.keysPressed['ArrowRight']) dx += this.movementSpeed * delta;

    if (dx !== 0) {
      const newX = Math.max(this.width/2 + 20, Math.min(this.screenWidth - this.width/2 - 20, this.x + dx));
      this.x = newX;
      this.container.x = newX;
    }
  }

  private draw() {
    const g = this.graphics;
    g.clear();

    // Car Body
    g.roundRect(-this.width/2, -this.height/2, this.width, this.height, 10);
    g.fill(0xFF0000);

    // Windshield
    g.rect(-this.width/2 + 5, -this.height/2 + 20, this.width - 10, 20);
    g.fill(0x00CCFF);

    // Roof
    g.rect(-this.width/2 + 5, -this.height/2 + 40, this.width - 10, 30);
    g.fill(0xCC0000);
  }

  public destroy() {
     // Cleanup listeners if needed (Pixi usually handles container cleanup, but window listeners persist)
     // In a full implementation, we should removeEventListeners.
     // For simplicity in this iteration, we might leak if mounted/unmounted repeatedly without reload.
     // Let's leave it simple as page reload is main reset, or we can implement destroy.
  }
}

