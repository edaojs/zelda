//import { Global } from "../Global";

import { Global } from "../Global";

// export function generateConnectedMap() {

//   const width = Global.CANVAS_WIDTH / Global.TILE_SIZE;
//   const height = Global.CANVAS_HEIGHT / Global.TILE_SIZE;
//   const map: number[][] = [];

//     for (let y = 0; y < height; y++) {
//     map[y] = [];
//     for (let x = 0; x < width; x++) {
//       map[y][x] = 1;
//     }
//   }

//   const centerX = Math.floor(width / 2);
//   const centerY = Math.floor(height / 2);

//   // começa no centro
//   let x = centerX;
//   let y = centerY;

//   map[y][x] = 0;

//   const directions = [
//     [1, 0],  // direita
//     [-1, 0], // esquerda
//     [0, 1],  // baixo
//     [0, -1], // cima
//   ];

//   const steps = width * height * 2;

//   for (let i = 0; i < steps; i++) {
//     // escolhe direção aleatória
//     const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];

//     x += dx;
//     y += dy;

//     // mantém dentro dos limites (evita borda)
//     x = Math.max(1, Math.min(width - 2, x));
//     y = Math.max(1, Math.min(height - 2, y));

//     // escava
//     map[y][x] = 0;

//     // chance de expandir área (criar "sala")
//     if (Math.random() < 0.2) {
//       for (let oy = -1; oy <= 1; oy++) {
//         for (let ox = -1; ox <= 1; ox++) {
//           const nx = x + ox;
//           const ny = y + oy;

//           if (map[ny] && map[ny][nx] !== undefined) {
//             map[ny][nx] = 0;
//           }
//         }
//       }
//     }
//   }

//   return map;
// }

enum Tile {
  Floor = 0,
  Wall = 1,
}

// Cálculo dinâmico baseado no Global
const MAP_COLS = Math.floor(Global.CANVAS_WIDTH / Global.TILE_SIZE);
const MAP_ROWS = Math.floor(Global.CANVAS_HEIGHT / Global.TILE_SIZE);

export class MapBuilder {
  public wallGrid: Tile[][] = [];

  public generateBaseLayout() {
    this.wallGrid = []; // Limpa o mapa anterior

    // 1. Preenchimento Base (Respeitando MAP_ROWS e MAP_COLS)
    for (let y = 0; y < MAP_ROWS; y++) {
      this.wallGrid[y] = [];
      for (let x = 0; x < MAP_COLS; x++) {
        this.wallGrid[y][x] =
          y === 0 ||
          y === MAP_ROWS - 1 ||
          x === 0 ||
          x === MAP_COLS - 1 ||
          Math.random() < 0.2
            ? Tile.Wall
            : Tile.Floor;
      }
    }

    // 2. GARANTIA DE SAÍDA DO PLAYER (Top-Left -> Centro)
    // Escavamos um túnel até a metade da largura e metade da altura
    const midX = Math.floor(MAP_COLS / 2);
    const midY = Math.floor(MAP_ROWS / 2);

    for (let x = 1; x <= midX; x++) this.wallGrid[1][x] = Tile.Floor; // Túnel Horizontal
    for (let y = 1; y <= midY; y++) this.wallGrid[y][1] = Tile.Floor; // Túnel Vertical

    // 3. GARANTIA DE ENTRADA DO INIMIGO (Bottom-Right -> Centro)
    for (let x = MAP_COLS - 2; x >= midX; x--)
      this.wallGrid[MAP_ROWS - 2][x] = Tile.Floor;
    for (let y = MAP_ROWS - 2; y >= midY; y--)
      this.wallGrid[y][MAP_COLS - 2] = Tile.Floor;

    // 4. PONTO DE ENCONTRO (Centro)
    // Garante que os túneis se conectem no meio do mapa retangular
    this.wallGrid[midY][midX] = Tile.Floor;
    this.wallGrid[midY + 1][midX] = Tile.Floor;
    this.wallGrid[midY][midX + 1] = Tile.Floor;

    return this.wallGrid;
  }

  // 2. Transforma o layout em IDs de Bitmask
  public generateFullMap(): number[][] {
    const base = this.generateBaseLayout();
    this.wallGrid = [];

    for (let y = 0; y < MAP_ROWS; y++) {
      this.wallGrid[y] = [];
      for (let x = 0; x < MAP_COLS; x++) {
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
    // N=1, S=2, E=4, W=8
    if (y > 0 && base[y - 1][x] === 1) mask += 1;
    if (y < MAP_ROWS - 1 && base[y + 1][x] === 1) mask += 2;
    if (x < MAP_COLS - 1 && base[y][x + 1] === 1) mask += 4;
    if (x > 0 && base[y][x - 1] === 1) mask += 8;

    // Se o resultado for 0 (parede sem vizinhos), podemos retornar um ID fixo
    // para "bloco isolado", por exemplo, 16.
    return mask === 0 ? 16 : mask;
  }

  // Métodos de auxílio para o spawn
  public static getPlayerInitialPos() {
    return { col: 1, row: 1 };
  }

  public static getEnemyInitialPos() {
    //make sure to spawn the enemy in a valid RANDOM position (not in a wall)
    const col = Math.floor(Math.random() * (MAP_COLS - 2)) + 1;
    const row = Math.floor(Math.random() * (MAP_ROWS - 2)) + 1;
    return { col, row };
  }
}
