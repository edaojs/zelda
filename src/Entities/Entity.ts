import { Global } from "../Global";
import type { MapStatic } from "../World/MapStatic";

export abstract class Entity {
  public gridPos: { col: number; row: number }; // Posição na grade (0, 1, 2...)
  public size: { width: number; height: number };
  protected map: MapStatic;
  protected renderPos: { x: number; y: number };
  protected lerpSpeed: number = 15; // Velocidade da suavização
  public lastGridPos: { col: number; row: number } = { col: 0, row: 0 };
  private name: string;

  constructor(col: number, row: number, map: MapStatic, name: string) {
    this.gridPos = { col, row };
    this.renderPos = {
      x: col * Global.TILE_SIZE,
      y: row * Global.TILE_SIZE,
    };
    this.map = map;
    this.name = name;
    this.size = { width: Global.TILE_SIZE, height: Global.TILE_SIZE };
  }

  get x() {
    return this.gridPos.col * Global.TILE_SIZE;
  }
  get y() {
    return this.gridPos.row * Global.TILE_SIZE;
  }

  protected canMoveTo(col: number, row: number): boolean {
    const tile = this.map.wallGrid[row]?.[col];
    return tile === 0; // Só move se for chão
  }

  public move(dCol: number, dRow: number) {

    this.lastGridPos.col = this.gridPos.col;
    this.lastGridPos.row = this.gridPos.row;

    const nextCol = this.gridPos.col + dCol;
    const nextRow = this.gridPos.row + dRow;

    if (this.canMoveTo(nextCol, nextRow)) {
      this.gridPos.col = nextCol;
      this.gridPos.row = nextRow;
    }
  }

  update(delta: number) {
    const targetX = this.gridPos.col * Global.TILE_SIZE;
    const targetY = this.gridPos.row * Global.TILE_SIZE;

    this.renderPos.x += (targetX - this.renderPos.x) * this.lerpSpeed * delta;
    this.renderPos.y += (targetY - this.renderPos.y) * this.lerpSpeed * delta;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.fillRect(
      this.renderPos.x,
      this.renderPos.y,
      this.size.width,
      this.size.height,
    );

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"; // Ajuda a centralizar verticalmente
    ctx.font = `${Global.TILE_SIZE / 3}px Arial`; // 30px pode ser muito grande para um tile

    // O pulo do gato: somar a posição de renderização ao deslocamento central
    ctx.fillText(
      this.name,
      this.renderPos.x + this.size.width / 2,
      this.renderPos.y + this.size.height / 2,
    );

  }

  public getMap() {
    return this.map;
  }

  public setMap(map: MapStatic) {
    this.map = map
  }
}
