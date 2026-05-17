import { ComponentUpdate, ComponentRender } from './types';
import { Entity } from './Entity';

export abstract class Component {
  public entity!: Entity;
  public enabled: boolean = true;

  public update(dt: number): void {}
  public render?(ctx: CanvasRenderingContext2D): void;

  public awake?(): void;
  public start?(): void;
  public onDestroy?(): void;
}
