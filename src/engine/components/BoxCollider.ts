import { Component } from '../Component';
import { ComponentUpdate, ComponentRender, Bounds } from '../types';

export class BoxCollider extends Component {
  public isTrigger: boolean = false;
  public debug: boolean = false;

  public update(dt: number): void {
    // Collision detection is usually managed by a physics system,
    // but for this simple engine, we can check here or provide helper methods.
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.debug) return;
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      -this.entity.size.width / 2,
      -this.entity.size.height / 2,
      this.entity.size.width,
      this.entity.size.height
    );
  }

  public getBounds(): Bounds {
    return this.entity.getBounds();
  }

  public intersects(other: BoxCollider): boolean {
    const a = this.getBounds();
    const b = other.getBounds();

    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
}
