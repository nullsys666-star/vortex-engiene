import { Component } from '../Component';
import { ComponentUpdate, ComponentRender } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export class ParticleSystem extends Component {
  private particles: Particle[] = [];
  public color: string = '#ff9900';

  public emit(x: number, y: number, count: number = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 200 + 50;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1.0,
        color: this.color
      });
    }
  }

  public update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Note: Rendering in global space since particles might leave the entity's local space
    // and we want them to stay where they were emitted.
    // However, our Entity.render translates to entity position.
    // To make particles stay in world space, we negate the entity translation.
    ctx.save();
    ctx.translate(-this.entity.position.x, -this.entity.position.y);
    
    for (const p of this.particles) {
      const alpha = p.life / 1.0;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}
