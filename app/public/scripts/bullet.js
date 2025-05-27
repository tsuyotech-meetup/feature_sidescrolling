/*
bulletクラス
*/

class Bullet {
    constructor(x, y, vx, vy, width, height, type) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx, cameraX) {
        ctx.fillStyle = '#e63946';
        ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
    }
}
export default Bullet;
