import { GameState } from "../Game";

export class HUD {
  private levelEl: HTMLElement;
  private scoreEl: HTMLElement;
  private healthEl: HTMLElement;
  private screenEl: HTMLElement;
  private screenText: HTMLElement;

  constructor() {
    // Busca os elementos uma única vez
    this.levelEl = document.getElementById("hud-level")!;
    this.scoreEl = document.getElementById("hud-score")!;
    this.healthEl = document.getElementById("hud-health")!;
    this.screenEl = document.getElementById("game-screens")!;
    this.screenText = document.getElementById("screen-text")!;
  }

  public update(state: GameState, health: number, maxHealth: number, score: number, level: number) {
    // Atualiza Textos
    this.levelEl.innerText = `LEVEL: ${level}`;
    this.scoreEl.innerText = `SCORE: ${score.toString().padStart(6, '0')}`;
    
    // Atualiza Corações
    const hearts = "❤️".repeat(health) + "🤍".repeat(maxHealth - health);
    this.healthEl.innerText = hearts;

    // Gerencia as Telas (Overlay)
    if (state === GameState.RUNNING) {
      this.screenEl.classList.add("screen-hidden");
    } else {
      this.screenEl.classList.remove("screen-hidden");
      if (state === GameState.START_MENU) this.screenText.innerText = "PRESS ENTER TO START";
      else if (state === GameState.GAME_OVER) this.screenText.innerText = "GAME OVER - PRESS R";
      else if (state === GameState.NEXT_LEVEL) this.screenText.innerText = `LEVEL ${level} - PRESS ENTER TO START`

    }
  }
}
