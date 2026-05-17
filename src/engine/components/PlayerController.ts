import { Component } from '../Component';
import { ComponentUpdate, InputKey } from '../types';
import { Input } from '../Input';

export class PlayerController extends Component {
  public speed: number = 300;
  public rotationSpeed: number = Math.PI * 2; // radians per second

  public update(dt: number): void {
    // Rotation
    if (Input.getKey(InputKey.Left) || Input.getKey(InputKey.KeyA)) {
      this.entity.rotation -= this.rotationSpeed * dt;
    }
    if (Input.getKey(InputKey.Right) || Input.getKey(InputKey.KeyD)) {
      this.entity.rotation += this.rotationSpeed * dt;
    }

    // Movement (Forward based on rotation)
    if (Input.getKey(InputKey.Up) || Input.getKey(InputKey.KeyW)) {
      this.entity.position.x += Math.cos(this.entity.rotation - Math.PI / 2) * this.speed * dt;
      this.entity.position.y += Math.sin(this.entity.rotation - Math.PI / 2) * this.speed * dt;
    }
    if (Input.getKey(InputKey.Down) || Input.getKey(InputKey.KeyS)) {
      this.entity.position.x -= Math.cos(this.entity.rotation - Math.PI / 2) * this.speed * dt;
      this.entity.position.y -= Math.sin(this.entity.rotation - Math.PI / 2) * this.speed * dt;
    }
  }
}
