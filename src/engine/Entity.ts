import { Vector2, Size, Bounds } from './types';
import { Component } from './Component';

export class Entity {
  public id: string;
  public name: string;
  public position: Vector2 = { x: 0, y: 0 };
  public rotation: number = 0;
  public scale: Vector2 = { x: 1, y: 1 };
  public size: Size = { width: 0, height: 0 };
  public components: Component[] = [];
  public active: boolean = true;
  public tags: string[] = [];

  constructor(name: string = 'New Entity') {
    this.id = Math.random().toString(36).substr(2, 9);
    this.name = name;
  }

  public addComponent<T extends Component>(component: T): T {
    component.entity = this;
    this.components.push(component);
    if (component.awake) component.awake();
    return component;
  }

  public getComponent<T extends Component>(type: any): T | undefined {
    return this.components.find((c) => c instanceof type) as T;
  }

  public removeComponent(component: Component) {
    const index = this.components.indexOf(component);
    if (index !== -1) {
      if (component.onDestroy) component.onDestroy();
      this.components.splice(index, 1);
    }
  }

  public update(dt: number) {
    if (!this.active) return;
    for (const component of this.components) {
      if (component.enabled) {
        component.update(dt);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale.x, this.scale.y);

    for (const component of this.components) {
      if (component.enabled && component.render) {
        component.render(ctx);
      }
    }

    ctx.restore();
  }

  public getBounds(): Bounds {
    return {
      x: this.position.x - (this.size.width * this.scale.x) / 2,
      y: this.position.y - (this.size.height * this.scale.y) / 2,
      width: this.size.width * this.scale.x,
      height: this.size.height * this.scale.y,
    };
  }
}
