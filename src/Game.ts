import { Player } from "./Entities/Player";
import { Enemy } from "./Entities/Enemy";
import { Input } from "./Systems/Input";
import { MapStatic } from "./World/MapStatic";
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
  private map: MapStatic;
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
    this.map = new MapStatic(this.level);
    this.input = new Input();
    const player: Player = new Player(this.input, this.map, "Gandalf");
    const enemies: Enemy[] = Enemy.generateEnemies(this.level, this.map);

    this.entities = new EntityManager(player, enemies);
    this.hud = new HUD();
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
      if (this.entities.player.getHealth() <= 0) {
        this.gameOver();
      }
            this.hud.update(
        this.currentState,
        this.entities.player.getHealth(),
        this.entities.player.getMaxHealth(),
        this.entities.getScore(),
        this.level
      );
      this.camera.update(this.entities.player.x, this.entities.player.y, this.map.fullLevel.layers[1].width, this.map.fullLevel.layers[1].height);

    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.camera.apply(this.ctx);

    this.ctx.drawImage(this.map.tilesetImage, 0 , 0, this.map.fullLevel.layers[1].width, this.map.fullLevel.layers[1].height);

    this.map.draw(this.ctx);
    this.entities.draw(this.ctx);
    this.camera.release(this.ctx);
  }
  private gameOver() {
    this.currentState = GameState.GAME_OVER;
    this.map = new MapStatic(this.level);
    this.lastTime = 0;
    const player: Player = new Player(this.input, this.map, "Gandalf");
    const enemies: Enemy[] = Enemy.generateEnemies(this.level, this.map);
    this.entities = new EntityManager(player, enemies);

  }

  private restart() {
    this.level = 1;
    this.hud = new HUD();
    this.camera = new Camera();
    this.currentState = GameState.RUNNING;
  }

  private goToNextLevel() {
    this.level++;
    const score = this.entities.getScore()
    const maxHealth = this.entities.player.getMaxHealth();
    this.map = new MapStatic(this.level);
    this.lastTime = 0;
    const player: Player = new Player(this.input, this.map, "Gandalf", maxHealth);
    const enemies: Enemy[] = Enemy.generateEnemies(this.level, this.map);
    this.entities = new EntityManager(player, enemies, score);
    this.hud = new HUD();
    this.camera = new Camera(); this.currentState = GameState.NEXT_LEVEL;
  }

  start() {
    requestAnimationFrame(this.loop.bind(this));
  }

}
