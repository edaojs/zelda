import { Player } from "../Entities/Player";
import { Enemy } from "../Entities/Enemy";
import { Entity } from "../Entities/Entity";
import { Item } from "../Entities/Item";
import { ItemType } from "../Entities/Item";
import type { MapStatic } from "../World/MapStatic";

export class EntityManager {
  public player: Player;
  public enemies: Enemy[];
  public items: Item[];
  private score: number;
  private requestNextLevel: boolean;

  constructor(player: Player, enemies: Enemy[], score: number = 0) {
    this.player = player;
    this.enemies = enemies;
    this.score = score;
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

  }

  private generateItems(map: MapStatic) {
    const playerStart = this.player.gridPos;
    const itemFactor = 8;
    const numberOfItems = map.level * itemFactor;
    let i = 0;
    // 1. Gerar os itens comuns usando Pesos (Probabilidade)
    while(i < numberOfItems) {
      const col = Math.floor(Math.random() * map.fullLevel.layers[1].width);
      const row = Math.floor(Math.random() * map.fullLevel.layers[1].height);

      if(this.items.some(item => item.gridPos.col === col && item.gridPos.row === row)) continue;

      if (map.isFloor(col,row)) {
        console.log("IS FLOOOOOR!!!!");
        //check if theres an item on this postion already
        let type: ItemType = ItemType.SCORE;

        if(i%itemFactor == 0) {
          type = ItemType.POWER;
        } else if (i%itemFactor < 6) {
          type = ItemType.SCORE; // 70% chance
        } else if (i%itemFactor  < 8) {
          type = ItemType.HEAL; // 20% chance
        }

        this.items.push(new Item(col, row, map, type));
        i++;
      }
    }

    // 2. Gerar exatamente 1 LIFE em qualquer lugar livre
    this.spawnUniqueItem(map, ItemType.LIFE);

    // 3. Gerar exatamente 1 EXIT bem longe do player
    this.spawnFarItem(map, ItemType.EXIT, playerStart, 15); // Mínimo 15 tiles de distância
  }

  private spawnUniqueItem(map: MapStatic, type: ItemType) {
    let placed = false;
    while (!placed) {
      const col = Math.floor(Math.random() * map.fullLevel.width);
      const row = Math.floor(Math.random() * map.fullLevel.height);
      if (map.wallGrid[row]?.[col] === 0) {
        this.items.push(new Item(col, row, map, type));
        placed = true;
      }
    }
  }

  private spawnFarItem(
    map: MapStatic,
    type: ItemType,
    playerPos: { col: number; row: number },
    minDist: number,
  ) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 500) {
      const col = Math.floor(Math.random() * map.fullLevel.width);
      const row = Math.floor(Math.random() * map.fullLevel.height);

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
