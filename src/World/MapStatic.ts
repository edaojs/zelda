import { Global } from "../Global";
import { convertTo2DArray } from "../utils/arrayToCols";
import { Map } from "./Map";
import { level1 } from "./Level1";

enum Tile {
  Floor = 0,
  Wall = 1,
}

export class MapStatic extends Map {

  public fullLevel: any;
  constructor(level: number) {
    super(level);
    this.tileSize = Global.TILE_SIZE;
    this.widthInTiles = 58;
    this.heightInTiles = 32;
    this.wallGrid = [];
    this.tilesetImage = new Image();
    this.tilesetImage.src = `assets/world/tileset.png`;
    this.fullLevel = level1
    this.wallGrid = convertTo2DArray(this.fullLevel.layers[0].data, this.fullLevel.width)
  }

  public isWall(col: number, row: number): boolean {
    const tileID = this.wallGrid[row]?.[col];
    return tileID === Tile.Wall;
  }

  public isFloor(col: number, row: number): boolean {
    const tileID = this.wallGrid[row]?.[col];
    return tileID === Tile.Floor;
  }

  // Métodos de auxílio para o spawn
  public getPlayerInitialPos() {
    return { col: 2, row: 7 };
  }

  public getEnemyInitialPos() {
    //make sure to spawn the enemy in a valid RANDOM position (not in a wall)
    const col = Math.floor(Math.random() * (this.fullLevel.width - 2)) + 1;
    const row = Math.floor(Math.random() * (this.fullLevel.height - 2)) + 1;
    return { col, row };
  }

  public draw(ctx: CanvasRenderingContext2D) {
    for (let row = 0; row < this.wallGrid.length; row++) {
      for (let col = 0; col < this.wallGrid[row].length; col++) {
        if (this.wallGrid[row][col] === 1) {
          ctx.fillStyle = "white";
          ctx.fillRect(
            col * this.tileSize,
            row * this.tileSize,
            this.tileSize,
            this.tileSize,
          );

          // Erase a rectangle in the middle
          ctx.clearRect(
            col * this.tileSize + 2,
            row * this.tileSize + 2,
            this.tileSize - 4,
            this.tileSize - 4,
          );
        }
      }
    }
  }

}
