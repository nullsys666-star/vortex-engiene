import { InputKey } from './types';

export class Input {
  private static keys: Map<string, boolean> = new Map();
  private static keysPressed: Set<string> = new Set();
  private static mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private static mouseButtons: Map<number, boolean> = new Map();

  public static initialize(canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => {
      if (!this.keys.get(e.key)) {
        this.keysPressed.add(e.key);
      }
      this.keys.set(e.key, true);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.set(e.key, false);
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mousePosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    });

    canvas.addEventListener('mousedown', (e) => {
      this.mouseButtons.set(e.button, true);
    });

    canvas.addEventListener('mouseup', (e) => {
      this.mouseButtons.set(e.button, false);
    });
  }

  public static getKey(key: string | InputKey): boolean {
    return this.keys.get(key) || false;
  }

  public static getKeyDown(key: string | InputKey): boolean {
    const pressed = this.keysPressed.has(key);
    return pressed;
  }

  public static getMouseButton(button: number): boolean {
    return this.mouseButtons.get(button) || false;
  }

  public static getMousePosition() {
    return this.mousePosition;
  }

  public static clearFrameState() {
    this.keysPressed.clear();
  }
}
