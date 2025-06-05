/*
playerクラス
*/

class Player {
    constructor(x, y) {
        this.id = null;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.vx = 0;
        this.vy = 0;
        this.speed = 3;
        this.jumpPower = 15;
        this.onGround = false;
        this.color = '#ffb703';
        this.targetX = x;
        this.targetY = y;

    }

    update(keys, platforms) {
        // 左右移動
        if (keys['KeyD']) this.vx = this.speed;
        else if (keys['KeyA']) this.vx = -this.speed;
        else this.vx = 0;

        // ジャンプ
        if (keys['Space'] && this.onGround) {
            this.vy = -this.jumpPower;
            this.onGround = false;
        }

        // 重力
        this.vy += 0.7;

        // 移動
        this.x += this.vx;
        this.y += this.vy;

        // 地面・障害物との当たり判定
        this.onGround = false;
        for (const p of platforms) {
            // 簡易AABB判定
            if (
                this.x < p.x + p.width &&
                this.x + this.width > p.x &&
                this.y < p.y + p.height &&
                this.y + this.height > p.y
            ) {
                // プレイヤーが上から着地
                if (this.vy > 0 && this.y + this.height - this.vy <= p.y) {
                    this.y = p.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                }
            }
        }

        // 落下判定
        if (this.y > 500) {
            this.x = 430;
            this.y = 0;
        }
        
    }

    draw(ctx, cameraX) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
    }
}
export default Player;