import { Entity } from './Entity';
import { Input } from './Input';

export class VortexEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private entities: Entity[] = [];
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    Input.initialize(canvas);
  }

  public addEntity(entity: Entity): Entity {
    this.entities.push(entity);
    // Initialize components that have a start method
    entity.components.forEach(c => {
      if (c.start) c.start();
    });
    return entity;
  }

  public removeEntity(entity: Entity) {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      entity.components.forEach(c => {
        if (c.onDestroy) c.onDestroy();
      });
      this.entities.splice(index, 1);
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private loop = () => {
    if (!this.isRunning) return;

    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.update(dt);
    this.render();

    Input.clearFrameState();
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    // We use a separate array to avoid issues when entities are removed during update
    const entitiesToUpdate = [...this.entities];
    for (const entity of entitiesToUpdate) {
      entity.update(dt);
    }
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Dynamic background or grid could be here
    this.renderGrid();

    for (const entity of this.entities) {
      entity.render(this.ctx);
    }
  }

  private renderGrid() {
    const ctx = this.ctx;
    const step = 50;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.5;

    ctx.beginPath();
    for (let x = 0; x <= this.canvas.width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
    }
    for (let y = 0; y <= this.canvas.height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
    }
    ctx.stroke();
  }

  public getEntitiesByTag(tag: string): Entity[] {
    return this.entities.filter(e => e.tags.includes(tag));
  }
}
