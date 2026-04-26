import { Global } from "../Global";

enum Tile {
  Floor = 0,
  Wall = 1,
}

export class Map {
  public tileSize: number;
  public wallGrid: Tile[][];
  public widthInTiles: number;
  public heightInTiles: number;
  public level: any;
  public tilesetImage: HTMLImageElement;

  constructor(level: number) {
    this.tileSize = Global.TILE_SIZE;
    this.widthInTiles = Math.floor(
      (Global.CANVAS_WIDTH * level) / Global.TILE_SIZE,
    );
    this.heightInTiles = Math.floor(
      (Global.CANVAS_HEIGHT * level) / Global.TILE_SIZE,
    );
    this.level = level;
    this.wallGrid = [];
    this.tilesetImage = new Image();
    this.tilesetImage.src = `assets/world/tileset${Global.TILE_SIZE}.png`;
    //this.generateFullMap();
  }

  public isWall(col: number, row: number): boolean {
    const tileID = this.wallGrid[row]?.[col];
    return tileID === 1;
  }

  public isFloor(col: number, row: number): boolean {
    const tileID = this.wallGrid[row]?.[col];
    return tileID === 0;
  }

  public generateBaseLayout() {
    // 1. Geração Inicial (Igual ao seu código)
    for (let y = 0; y < this.heightInTiles; y++) {
      this.wallGrid[y] = [];
      for (let x = 0; x < this.widthInTiles; x++) {
        this.wallGrid[y][x] =
          y === 0 ||
          y === this.heightInTiles - 1 ||
          x === 0 ||
          x === this.widthInTiles - 1 ||
          Math.random() < 0.2
            ? Tile.Wall
            : Tile.Floor;
      }
    }

    // 2. Seus túneis de garantia (Mantém a conectividade básica)
    const midX = Math.floor(this.widthInTiles / 2);
    const midY = Math.floor(this.heightInTiles / 2);
    for (let x = 1; x <= midX; x++) this.wallGrid[1][x] = Tile.Floor;
    for (let y = 1; y <= midY; y++) this.wallGrid[y][1] = Tile.Floor;
    for (let x = this.widthInTiles - 2; x >= midX; x--)
      this.wallGrid[this.heightInTiles - 2][x] = Tile.Floor;
    for (let y = this.heightInTiles - 2; y >= midY; y--)
      this.wallGrid[y][this.widthInTiles - 2] = Tile.Floor;
    this.wallGrid[midY][midX] = Tile.Floor;
    this.wallGrid[midY + 1][midX] = Tile.Floor;
    this.wallGrid[midY][midX + 1] = Tile.Floor;

    // 3. LIMPEZA DE ÁREAS ISOLADAS (O novo passo)
    this.removeIsolatedAreas(1, 1); // Começa do spawn do player

    return this.wallGrid;
  }

  private removeIsolatedAreas(startX: number, startY: number) {
    const reachable = Array.from({ length: this.heightInTiles }, () =>
      Array(this.widthInTiles).fill(false),
    );
    const queue: [number, number][] = [[startX, startY]];
    reachable[startY][startX] = true;

    // Algoritmo de Flood Fill para marcar áreas alcançáveis
    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      const neighbors = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];

      for (const [dx, dy] of neighbors) {
        const nx = x + dx;
        const ny = y + dy;

        if (
          ny >= 0 &&
          ny < this.heightInTiles &&
          nx >= 0 &&
          nx < this.widthInTiles
        ) {
          if (!reachable[ny][nx] && this.wallGrid[ny][nx] === Tile.Floor) {
            reachable[ny][nx] = true;
            queue.push([nx, ny]);
          }
        }
      }
    }

    // Preenche com parede tudo que o Player não consegue alcançar
    for (let y = 0; y < this.heightInTiles; y++) {
      for (let x = 0; x < this.widthInTiles; x++) {
        if (this.wallGrid[y][x] === Tile.Floor && !reachable[y][x]) {
          this.wallGrid[y][x] = Tile.Wall;
        }
      }
    }
  }

  // 2. Transforma o layout em IDs de Bitmask
  public generateFullMap(): number[][] {
    const base = this.generateBaseLayout();
    this.wallGrid = [];

    for (let y = 0; y < this.heightInTiles; y++) {
      this.wallGrid[y] = [];
      for (let x = 0; x < this.widthInTiles; x++) {
        if (base[y][x] === 0) {
          this.wallGrid[y][x] = 0; // Chão continua sendo 0 (ou outro ID de chão)
        } else {
          // Se for parede, calculamos o Bitmask de 1 a 15
          this.wallGrid[y][x] = this.calculateBitmask(base, x, y);
        }
      }
    }
    return this.wallGrid;
  }

  private calculateBitmask(base: number[][], x: number, y: number): number {
    let mask = 0;

    if (y > 0 && base[y - 1][x] === Tile.Wall) mask += 1; // N
    if (x < base[0].length - 1 && base[y][x + 1] === Tile.Wall) mask += 2; // E
    if (y < base.length - 1 && base[y + 1][x] === Tile.Wall) mask += 4; // S
    if (x > 0 && base[y][x - 1] === Tile.Wall) mask += 8; // W

    return mask;
  }

  // Métodos de auxílio para o spawn
  public getPlayerInitialPos() {
    return { col: 1, row: 1 };
  }

  public getEnemyInitialPos() {
    //make sure to spawn the enemy in a valid RANDOM position (not in a wall)
    const col = Math.floor(Math.random() * (this.widthInTiles - 2)) + 1;
    const row = Math.floor(Math.random() * (this.heightInTiles - 2)) + 1;
    return { col, row };
  }

  public draw(ctx: CanvasRenderingContext2D) {
    for (let y = 0; y < this.heightInTiles; y++) {
      for (let x = 0; x < this.widthInTiles; x++) {

        ctx.fillStyle = "#233f32";
        ctx.fillRect(
          x * this.tileSize,
          y * this.tileSize,
          this.tileSize,
          this.tileSize,
        );

        // Erase a rectangle in the middle
        ctx.clearRect(
          x * this.tileSize + 1,
          y * this.tileSize + 1,
          this.tileSize - 2,
          this.tileSize - 2,
        );

        const bitmaskId = this.wallGrid[y][x];


        if (bitmaskId > 0) {
          this.drawSingleTile(ctx, bitmaskId, x, y);
        }
      }
    }
  }

  private drawSingleTile(
    ctx: CanvasRenderingContext2D,
    tilesetIndex: number,
    x: number,
    y: number,
  ) {
    // O tilesetIndex é a posição linear no seu PNG de 4 colunas
    const sx = (tilesetIndex % 4) * this.tileSize;
    const sy = Math.floor(tilesetIndex / 4) * this.tileSize;

    ctx.drawImage(
      this.tilesetImage,
      sx,
      sy,
      this.tileSize,
      this.tileSize,
      x * this.tileSize,
      y * this.tileSize,
      this.tileSize,
      this.tileSize,
    );
    // ctx.fillStyle = "white";
    // ctx.fillText(
    //   tilesetIndex.toString(),
    //   x * this.tileSize + 8,
    //   y * this.tileSize + 16,
    // );
  }

  // public draw(ctx: CanvasRenderingContext2D) {
  //   for (let row = 0; row < this.wallGrid.length; row++) {
  //     for (let col = 0; col < this.wallGrid[row].length; col++) {
  //       if (this.wallGrid[row][col] === 1) {
  //         ctx.fillStyle = "white";
  //         ctx.fillRect(
  //           col * this.tileSize,
  //           row * this.tileSize,
  //           this.tileSize,
  //           this.tileSize,
  //         );

  //         // Erase a rectangle in the middle
  //         ctx.clearRect(
  //           col * this.tileSize + 2,
  //           row * this.tileSize + 2,
  //           this.tileSize - 4,
  //           this.tileSize - 4,
  //         );
  //       }
  //     }
  //   }
  // }

  // public draw(ctx: CanvasRenderingContext2D) {
  //   for (let row = 0; row < this.wallGrid.length; row++) {
  //     for (let col = 0; col < this.wallGrid[row].length; col++) {
  //       const tileId = this.wallGrid[row][col];
  //       const tilesetX = (tileId % 4) * Global.TILE_SIZE;
  //       const tilesetY = Math.floor(tileId / 4) * Global.TILE_SIZE;

  //       ctx.drawImage(
  //         this.tilesetImage,
  //         tilesetX,
  //         tilesetY,
  //         this.tileSize,
  //         this.tileSize, // Origem no PNG
  //         col * this.tileSize,
  //         row * this.tileSize,
  //         this.tileSize,
  //         this.tileSize, // Destino no Canvas
  //       );
  //     }
  //   }
  // }

  // public draw(ctx: CanvasRenderingContext2D) {
  //   // 1. Configurações do Tileset (ajuste esses números conforme sua imagem)
  //   const tilesetColumns = 8; // quantos tiles existem na horizontal do seu PNG

  //   // 2. Percorre a matriz 2D (this.wallGrid)
  //   for (let row = 0; row < this.wallGrid.length; row++) {
  //     for (let col = 0; col < this.wallGrid[row].length; col++) {
  //       const tileID = this.wallGrid[row][col];

  //       // Se o ID for 0 (vazio) ou 54 (chão opcional), você pode pular ou desenhar
  //       if (tileID === 0) continue;

  //       // 3. Onde recortar no Tileset (Origem)
  //       // Tiled soma 1 ao ID, então subtraímos para voltar ao índice 0

  //       const actualID = tileID - 1;
  //       const sx = Math.floor(actualID % tilesetColumns) * this.tileSize;
  //       const sy = Math.floor(actualID / tilesetColumns) * this.tileSize;

  //       // 4. Onde desenhar no Canvas (Destino)
  //       const dx = col * this.tileSize;
  //       const dy = row * this.tileSize;

  //       // 5. Desenha o pedacinho da imagem
  //       ctx.drawImage(
  //         this.tilesetImage, // Sua variável HTMLImageElement
  //         sx,
  //         sy, // Coordenadas de origem (PNG)
  //         this.tileSize,
  //         this.tileSize, // Tamanho do corte
  //         dx,
  //         dy, // Coordenadas de destino (Jogo)
  //         this.tileSize,
  //         this.tileSize, // Tamanho na tela
  //       );
  //     }
  //   }
  // }
}
