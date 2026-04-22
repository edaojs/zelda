//import { Global } from "../Global";
import { Global } from "../Global";
import { pathfind } from "../utils/pathFind";
import type { Map } from "../World/Map";
import { Entity } from "./Entity";
import type { Player } from "./Player";

export class Enemy extends Entity {
  private moveTimer: number = 0;
  private moveDelay: number = 0.5;
  private currentDir: { dCol: number; dRow: number } = { dCol: 0, dRow: 0 };
  public lastGridPos: { col: number; row: number } = { col: 0, row: 0 };
  constructor(map: Map, name: string) {
    const ePos = map.getEnemyInitialPos();
    super(ePos.col, ePos.row, map, name);
    this.moveTimer = 0;
  }

  private walk() {
    const directions = [
      { dCol: 0, dRow: -1 }, // Cima
      { dCol: 0, dRow: 1 }, // Baixo
      { dCol: -1, dRow: 0 }, // Esquerda
      { dCol: 1, dRow: 0 }, // Direita
    ];

    const randomIndex = Math.floor(Math.random() * directions.length);
    this.currentDir = directions[randomIndex];
    this.move(this.currentDir.dCol, this.currentDir.dRow);
  }

  private handleLogic(delta: number, player: Player) {
    this.moveTimer -= delta;

    if (this.moveTimer <= 0) {
      const diffX = player.gridPos.col - this.gridPos.col;
      const diffY = player.gridPos.row - this.gridPos.row;
      const dist = Math.hypot(diffX, diffY);
      if (dist > Global.ENEMY_VISION) this.walk();
      else {
        const nextStep = pathfind(
          this.gridPos,
          player.gridPos,
          this.map.wallGrid,
        );

        if (nextStep) {
          this.move(nextStep.dCol, nextStep.dRow);
        }
      }

      this.moveTimer = this.moveDelay;
    }
  }

  public updateEnemy(delta: number, player: Player) {
    this.handleLogic(delta, player);
    super.update(delta);
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "red";
    super.draw(ctx);
  }

  public static generateEnemies(level: number, map: Map) {
    const qty = level * 8
    console.log('qtd enemies', qty);
    const enemies: Enemy[] = [];
    for (let i = 0; i < qty; i++) {
      enemies.push(new Enemy(map, (i + 1).toString() ));
    }
    return enemies;
  }
}
