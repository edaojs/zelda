import { Player } from "../Entities/Player";
import { Enemy } from "../Entities/Enemy";
import { Entity } from "../Entities/Entity";
import { Item } from "../Entities/Item";
import { ItemType } from "../Entities/Item";
import type { Map } from "../World/Map";

export class EntityManager {
  public player: Player;
  public enemies: Enemy[];
  public items: Item[];
  private score: number;
  private requestNextLevel: boolean;

  constructor(player: Player, enemies: Enemy[]) {
    this.player = player;
    this.enemies = enemies;
    this.score = 0;
    this.items = [];
    this.requestNextLevel = false;
    this.generateItems(player.getMap());
  }

  public update(delta: number) {
    this.player.update(delta);

    // 1. Colisão com Itens
    this.items.forEach((item) => {
      if (!item.collected && this.isColliding(this.player, item)) {
        this.applyItemEffect(item);
      }
    });

    // 2. Colisão com Inimigos
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.updateEnemy(delta, this.player);

      if (this.isColliding(this.player, enemy)) {
        if (this.player.isPowerModeActive()) {
          // MATA O INIMIGO (Remove do array)
          this.enemies.splice(i, 1);
          this.score += 50;
        } else {
          this.player.takeDamage();
          this.resolveOverlap(enemy);
        }
      }
    }
  }

  private isColliding(a: Entity, b: Entity): boolean {
    return a.gridPos.col === b.gridPos.col && a.gridPos.row === b.gridPos.row;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.player.draw(ctx);
    this.enemies.forEach((e) => e.draw(ctx));
    this.items.forEach((e) => e.draw(ctx));
  }

  private applyItemEffect(item: Item) {
    item.collected = true;

    switch (item.type) {
      case ItemType.HEAL:
        this.player.heal();
        break;
      case ItemType.LIFE:
        this.player.addMaxLife();
        break;
      case ItemType.POWER:
        this.player.activatePowerMode(10);
        break;
      case ItemType.SCORE:
        this.score += 100;
        break;
      case ItemType.EXIT:
        this.requestNextLevel = true;
        break;
    }
  }

  private resolveOverlap(enemy: Enemy) {
    const diffCol = this.player.gridPos.col - enemy.lastGridPos.col;
    const diffRow = this.player.gridPos.row - enemy.lastGridPos.row;

    if (diffCol === 0 && diffRow === 0) {
      this.player.move(0, 1);
    } else {
      this.player.move(diffCol, diffRow);
    }

    enemy.gridPos.col = enemy.lastGridPos.col;
    enemy.gridPos.row = enemy.lastGridPos.row;
  }

  public resetForNextLevel(player: Player, enemies: Enemy[]) {
    this.enemies = enemies;
    this.player = player;
    this.items = [];
    this.requestNextLevel = false;
    this.generateItems(player.getMap());
  }

  // Systems/EntityManager.ts

  private generateItems(map: Map) {
    const playerStart = this.player.gridPos;

    // 1. Gerar os itens comuns usando Pesos (Probabilidade)
    for (let i = 0; i < 60; i++) {
      // Reduzi para 60 para não poluir demais
      const col = Math.floor(Math.random() * map.widthInTiles);
      const row = Math.floor(Math.random() * map.heightInTiles);

      if (map.wallGrid[row]?.[col] === 0) {
        const rand = Math.random();
        let type: ItemType;

        if (rand < 0.7) {
          type = ItemType.EXIT; // 70% chance
        } else if (rand < 0.9) {
          type = ItemType.HEAL; // 20% chance
        } else {
          type = ItemType.POWER; // 10% chance
        }

        this.items.push(new Item(col, row, map, type));
      }
    }

    // 2. Gerar exatamente 1 LIFE em qualquer lugar livre
    this.spawnUniqueItem(map, ItemType.LIFE);

    // 3. Gerar exatamente 1 EXIT bem longe do player
    this.spawnFarItem(map, ItemType.EXIT, playerStart, 15); // Mínimo 15 tiles de distância
  }

  private spawnUniqueItem(map: Map, type: ItemType) {
    let placed = false;
    while (!placed) {
      const col = Math.floor(Math.random() * map.widthInTiles);
      const row = Math.floor(Math.random() * map.heightInTiles);
      if (map.wallGrid[row]?.[col] === 0) {
        this.items.push(new Item(col, row, map, type));
        placed = true;
      }
    }
  }

  private spawnFarItem(
    map: Map,
    type: ItemType,
    playerPos: { col: number; row: number },
    minDist: number,
  ) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 500) {
      const col = Math.floor(Math.random() * map.widthInTiles);
      const row = Math.floor(Math.random() * map.heightInTiles);

      // Distância de Manhattan (soma das diferenças de col e row)
      const dist =
        Math.abs(col - playerPos.col) + Math.abs(row - playerPos.row);

      if (map.wallGrid[row]?.[col] === 0 && dist > minDist) {
        this.items.push(new Item(col, row, map, type));
        placed = true;
      }
      attempts++;
    }
  }

  public getRequestNextLevel(): boolean {
    return this.requestNextLevel;
  }

  public getScore(): number {
    return this.score;
  }
}
