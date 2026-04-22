import { Entity } from "./Entity";
import { Input } from "../Systems/Input";
import type { Map } from "../World/Map";

export class Player extends Entity {
  public input: Input;
  private moveTimer = 0;
  private moveDelay = 0.15;
  private health: number;
  private maxHealth: number;
  private invincibilityTimer: number;
  private powerModeTimer: number;
  private readonly I_FRAME_DURATION: number = 1.5;

  constructor(input: Input, map: Map, name: string) {
    const pPos = map.getPlayerInitialPos();
    super(pPos.col, pPos.row, map, name);
    this.input = input;
    this.health = 3;
    this.maxHealth = 3;
    this.invincibilityTimer = 0;
    this.powerModeTimer = 0;
  }

  public heal() {
    this.health < this.maxHealth && this.health++;
  }

  public addMaxLife() {
    this.maxHealth++;
    while(this.health < this.maxHealth) this.health++;
  }  

  public fullHeal() {
    this.health = this.maxHealth;
  }


  public activatePowerMode(duration: number) {
    this.powerModeTimer = duration;
  }

  public isPowerModeActive(): boolean {
    return this.powerModeTimer > 0;
  }

  private walk(delta: number) {
    this.moveTimer -= delta;
    if (this.moveTimer > 0) return;

    let dCol = 0;
    let dRow = 0;

    if (this.input.isPressed("ArrowLeft")) dCol = -1;
    else if (this.input.isPressed("ArrowRight")) dCol = 1;
    else if (this.input.isPressed("ArrowUp")) dRow = -1;
    else if (this.input.isPressed("ArrowDown")) dRow = 1;

    if (dCol !== 0 || dRow !== 0) {
      this.move(dCol, dRow);
      this.moveTimer = this.moveDelay; // Reseta o delay
    }
  }

  update(delta: number) {
    this.walk(delta);
    super.update(delta);
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= delta;
    }
    if (this.powerModeTimer > 0) this.powerModeTimer -= delta;    
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if ((this.invincibilityTimer > 0 || this.powerModeTimer > 0) && Math.floor(Date.now() / 100) % 2 === 0) {
      return; // Pula o desenho para criar efeito de piscar
    }
    ctx.fillStyle = this.isPowerModeActive() ? "gold" : "blue";
    super.draw(ctx);
  }

  public takeDamage() {
    if (this.invincibilityTimer <= 0) {
      this.health--;
      this.invincibilityTimer = this.I_FRAME_DURATION;
      console.log("Vida restante:", this.health);
    }
  }

  public getHealth() {
    return this.health;
  }

  public getMaxHealth() {
    return this.maxHealth;
  }
}
