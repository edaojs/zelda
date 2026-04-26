import { Global } from "../Global";
import { convertTo2DArray } from "../utils/arrayToCols";
import { Map } from "./Map";
import { level1 } from "./Level1";

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
    this.wallGrid = convertTo2DArray(this.fullLevel.layers[1].data, this.fullLevel.layers[1].width)
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
            col * this.tileSize + 1,
            row * this.tileSize + 1,
            this.tileSize - 1,
            this.tileSize - 1,
          );
        }
      }
    }
  }

}
