import { Global } from "../Global";

export class Camera {
    public x: number = 0;
    public y: number = 0;
    private width = Global.CAMERA_WIDTH
    private height = Global.CAMERA_HEIGHT

    constructor() {}

    // Centering logic
    public update(targetX: number, targetY: number) {
        let nextX = this.x + (targetX - this.width / 2 - this.x) * 0.2;
        let nextY = this.y + (targetY - this.height / 2 - this.y) * 0.2;

        nextX = Math.max(0, nextX);
        nextY = Math.max(0, nextY);

        nextX = Math.min(nextX, Global.CANVAS_WIDTH - this.width);
        nextY = Math.min(nextY, Global.CANVAS_HEIGHT - this.height);

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
