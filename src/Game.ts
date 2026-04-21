import { Player } from "./Entities/Player";
import { Enemy } from "./Entities/Enemy";
import { Input } from "./Systems/Input";
import { MapBuilder } from "./World/MapBuilder";
import { Map } from "./World/Map";
import { Camera } from "./Systems/Camera";
import { EntityManager } from "./Systems/EntityManager";
import { HUD } from "./Systems/HUD";

export enum GameState {
  START_MENU,
  NEXT_LEVEL,
  RUNNING,
  GAME_OVER,
  PAUSED,
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: Input;
  private lastTime: number;
  private map: Map;
  private camera: Camera;
  private currentState: GameState = GameState.START_MENU;
  private entities: EntityManager;
  private hud: HUD;
  private level: number;

  constructor() {
    this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.lastTime = 0;
    this.level = 1;
    const baseMap = new MapBuilder().generateBaseLayout();
    this.map = new Map(baseMap);
    this.input = new Input();
    const player: Player = new Player(this.input, this.map, "Gandalf");
    const enemies: Enemy[] = Enemy.generateEnemies(100, this.map);

    this.entities = new EntityManager(player, enemies);
    this.hud = new HUD(this.ctx);
    this.camera = new Camera();
  }

  private handleGlobalInputs() {
    if (
      (this.currentState === GameState.START_MENU ||
        this.currentState === GameState.NEXT_LEVEL) &&
      this.input.isPressed("Enter")
    ) {
      this.input.consumeKeyPress("Enter");
      this.currentState = GameState.RUNNING;
    } else if (
      this.currentState === GameState.GAME_OVER &&
      this.input.isPressed("KeyR")
    ) {
      this.input.consumeKeyPress("KeyR");
      this.restart();
    }
  }

  loop(time: number) {
    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;
    this.update(delta);
    this.draw();
    requestAnimationFrame(this.loop.bind(this));
  }

  update(delta: number) {
    this.handleGlobalInputs();
    if (this.currentState === GameState.RUNNING) {
      if (this.entities.getRequestNextLevel()) {
        this.goToNextLevel();
      }
      this.entities.update(delta);
      this.camera.update(this.entities.player.x, this.entities.player.y);
      if (this.entities.player.getHealth() <= 0) {
        this.currentState = GameState.GAME_OVER;
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.camera.apply(this.ctx);
    this.map.draw(this.ctx);
    this.entities.draw(this.ctx);
    this.camera.release(this.ctx);
    this.hud.draw(
      this.currentState,
      this.entities.player.getHealth(),
      this.entities.player.getMaxHealth(),
      this.entities.getScore(),
      this.level,
    );
  }

  private restart() {
    // Reinicia as posições e o estado
    const player: Player = new Player(this.input, this.map, "Gandalf");
    const enemies: Enemy[] = Enemy.generateEnemies(100, this.map);
    this.entities = new EntityManager(player, enemies);
    this.hud = new HUD(this.ctx);
    this.camera = new Camera();
    this.currentState = GameState.RUNNING;
  }

  start() {
    requestAnimationFrame(this.loop.bind(this));
  }

  private goToNextLevel() {
    this.level++;
    const enemyCount = 100 + this.level * 20; // Aumenta dificuldade

    const newMapData = new MapBuilder().generateBaseLayout();
    this.map = new Map(newMapData);
    const player: Player = new Player(this.input, this.map, "Gandalf");
    const enemies: Enemy[] = Enemy.generateEnemies(enemyCount, this.map);

    // O segredo é NÃO criar um novo player, mas atualizar o mapa dele
    this.entities.resetForNextLevel(player, enemies);
    this.camera = new Camera();
    this.currentState = GameState.NEXT_LEVEL;
  }
}
