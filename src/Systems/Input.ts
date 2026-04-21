export class Input {
  private keys: Set<string> = new Set();

  constructor() {
    window.addEventListener("keydown", (e) => this.keys.add(e.code));
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
  }

  public isPressed(code: string): boolean {
    return this.keys.has(code);
  }

  // Método utilitário para detectar um "clique único" (opcional)
  public consumeKeyPress(code: string): boolean {
    if (this.keys.has(code)) {
      this.keys.delete(code); // Remove para não disparar no próximo frame
      return true;
    }
    return false;
  }
}
