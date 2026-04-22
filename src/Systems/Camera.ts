import { Global } from "../Global";

export class Camera {
    public x: number = 0;
    public y: number = 0;
    private width = Global.CANVAS_WIDTH;
    private height = Global.CANVAS_HEIGHT;

    constructor() {}

    // Centering logic
    public update(targetX: number, targetY: number, level: number) {
        let nextX = this.x + (targetX - this.width / 2 - this.x) * 0.2;
        let nextY = this.y + (targetY - this.height / 2 - this.y) * 0.2;

        nextX = Math.max(0, nextX);
        nextY = Math.max(0, nextY);

        nextX = Math.min(nextX, Global.CANVAS_WIDTH * level - this.width);
        nextY = Math.min(nextY, Global.CANVAS_HEIGHT * level - this.height);

        this.x = nextX;
        this.y = nextY;
    }

    public apply(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(-this.x, -this.y);
    }

    public release(ctx: CanvasRenderingContext2D) {
        ctx.restore();
    }
}
