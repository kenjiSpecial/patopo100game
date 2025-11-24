import * as PIXI from 'pixi.js';

export class Background {
  public container: PIXI.Container;
  private graphics: PIXI.Graphics;
  private width: number;
  private height: number;
  private offset: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.container = new PIXI.Container();
    this.graphics = new PIXI.Graphics();
    this.container.addChild(this.graphics);
    this.draw();
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.draw();
  }

  public update(delta: number, scrollSpeed: number) {
    if (scrollSpeed > 0) {
      // delta is frame count basically, but let's assume standard usage
      // normalized delta is passed usually
      this.offset = (this.offset + scrollSpeed * (1 / 60)) % 100;
      this.draw(); // Re-draw to animate dashed lines. Optimization: Use TilingSprite for texture instead of redraw.
                   // For now, redraw is fine for simple graphics.
    }
  }

  private draw() {
    const g = this.graphics;
    g.clear();

    // Road background
    g.rect(0, 0, this.width, this.height);
    g.fill(0x333333);

    // Side grass
    const roadWidth = Math.min(this.width, 600);
    const sideWidth = (this.width - roadWidth) / 2;

    if (sideWidth > 0) {
        g.rect(0, 0, sideWidth, this.height);
        g.rect(this.width - sideWidth, 0, sideWidth, this.height);
        g.fill(0x228B22);

        // Curb lines
        g.moveTo(sideWidth, 0);
        g.lineTo(sideWidth, this.height);
        g.moveTo(this.width - sideWidth, 0);
        g.lineTo(this.width - sideWidth, this.height);
        g.stroke({ width: 4, color: 0xFFFFFF });
    }

    // Lane markers
    const laneCount = 3;
    const laneWidth = roadWidth / laneCount;

    const dashHeight = 40;
    const gapHeight = 40;
    const totalDash = dashHeight + gapHeight;
    const pixelOffset = (this.offset / 100) * totalDash;

    for (let i = 1; i < laneCount; i++) {
        const x = sideWidth + i * laneWidth;

        for (let y = -totalDash + pixelOffset; y < this.height; y += totalDash) {
            if (y + dashHeight > 0) {
                 g.moveTo(x, y);
                 g.lineTo(x, Math.min(y + dashHeight, this.height));
                 g.stroke({ width: 4, color: 0xFFFFFF });
            }
        }
    }
  }
}



