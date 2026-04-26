import type { MapStatic } from "../World/MapStatic";
import { Entity } from "./Entity";

export enum ItemType {
  HEAL, // health + 1;
  LIFE, //maxHealth + 1;
  POWER, //invencible for 10 seconds+ killEnemy if touch
  SCORE, // score + 1;
  EXIT, // leva o player para a próxima fase (tem mais inimigos)
}

export class Item extends Entity {
  public type: ItemType;
  public collected: boolean = false;

  private static icons = {
    [ItemType.HEAL]: "❤️",
    [ItemType.LIFE]: "💎",
    [ItemType.POWER]: "⚡",
    [ItemType.SCORE]: "🪙",
    [ItemType.EXIT]: "🚪",
  };  

  constructor(col: number, row: number, map: MapStatic, type: ItemType) {
    super(col, row, map, type.toString());
    this.type = type;
  }

public draw(ctx: CanvasRenderingContext2D) {
    if (this.collected) return;

    ctx.save();
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Desenha o ícone no centro do tile
    ctx.fillText(
      Item.icons[this.type],
      this.renderPos.x + this.size.width / 2,
      this.renderPos.y + this.size.height / 2
    );
    ctx.restore();
  }
}
