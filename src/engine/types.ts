export interface Vector2 {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ComponentUpdate = (dt: number) => void;
export type ComponentRender = (ctx: CanvasRenderingContext2D) => void;

export enum InputKey {
  Up = 'ArrowUp',
  Down = 'ArrowDown',
  Left = 'ArrowLeft',
  Right = 'ArrowRight',
  Space = ' ',
  Enter = 'Enter',
  KeyW = 'w',
  KeyA = 'a',
  KeyS = 's',
  KeyD = 'd',
}
