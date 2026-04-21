import { GameState } from "../Game";

export class HUD {
  private ctx: CanvasRenderingContext2D;
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public draw(state: GameState, health: number, maxHealth: number, score: number, level: number) {
    this.drawLevel(level);
    this.drawHearts(health, maxHealth);
    this.drawScore(score);

    
    if (state === GameState.START_MENU) {
      this.drawOverlay("PRESS ENTER TO START");
    } else if (state === GameState.GAME_OVER) {
      this.drawOverlay("GAME OVER - PRESS R TO RESTART");
    } else if (state === GameState.NEXT_LEVEL) {
      this.drawOverlay(`LEVEL ${level} - PRESS ENTER TO START`);
    }
  }

  private drawHearts(health: number, maxHealth: number) {
    this.ctx.save();
    this.ctx.font = "30px Arial";
    for (let i = 0; i < maxHealth; i++) {
      const heart = i < health ? "❤️" : "🤍";
      this.ctx.fillText(heart, 55 + i * 35, 80);
    }
    this.ctx.restore();
  }

private drawLevel(level: number) {
    this.ctx.save();
    this.ctx.fillStyle = "white";
    this.ctx.font = "bold 30px Arial";
    this.ctx.textAlign = "left";
    // Desenha no canto superior direito
    this.ctx.fillText(`LEVEL: ${level}`, 40, 40);
    this.ctx.restore();
}  


private drawScore(score: number) {
    this.ctx.save();
    this.ctx.fillStyle = "white";
    this.ctx.font = "bold 20px Arial";
    this.ctx.textAlign = "right";
    // Desenha no canto superior direito
    this.ctx.fillText(`SCORE: ${score}`, this.ctx.canvas.width - 20, 40);
    this.ctx.restore();
}  

  private drawOverlay(text: string) {
    this.ctx.fillStyle = "rgba(0,0,0,0.5)";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.font = "30px Arial";
    this.ctx.fillText(text, this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
  }
}
