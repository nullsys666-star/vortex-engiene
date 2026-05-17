import { Component } from '../Component';
import { ComponentUpdate, ComponentRender } from '../types';

export class SpriteRenderer extends Component {
  public image: HTMLImageElement | null = null;
  public color: string = 'white';
  public opacity: number = 1;

  constructor(imageOrColor: string | HTMLImageElement) {
    super();
    if (typeof imageOrColor === 'string') {
      this.color = imageOrColor;
    } else {
      this.image = imageOrColor;
      this.entity.size = { width: this.image.width, height: this.image.height };
    }
  }

  public update(dt: number): void {
    // Basic sprite update logic if any
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.globalAlpha = this.opacity;
    if (this.image) {
      ctx.drawImage(
        this.image,
        -this.entity.size.width / 2,
        -this.entity.size.height / 2,
        this.entity.size.width,
        this.entity.size.height
      );
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(
        -this.entity.size.width / 2,
        -this.entity.size.height / 2,
        this.entity.size.width,
        this.entity.size.height
      );
    }
    ctx.globalAlpha = 1;
  }
}
