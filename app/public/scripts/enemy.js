/*
enemyクラス
*/

import Bullet from './bullet.js';

class Enemy {
constructor(x, y, bulletWidth, bulletHeight, bulletSpeed) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.nextShootTime = 0;
    this.shootInterval = 1000 + Math.random() * 2000;
    this.hp = 5;
    this.bulletWidth = bulletWidth;
    this.bulletHeight = bulletHeight;
    this.bulletSpeed = bulletSpeed;
}

    update(bullets, now) {
        if (now >= this.nextShootTime) {
            bullets.push(new Bullet(
                this.x - this.bulletWidth, // 左側から発射
                this.y + this.height / 2 - this.bulletHeight / 2,
                -this.bulletSpeed, // 左方向に移動
                0,
                this.bulletWidth,
                this.bulletHeight,
                'enemy'
            ));
            // 次の射撃タイミングをランダムに設定
            this.nextShootTime = now + 1000 + Math.random() * 2000;
        }
    }

    draw(ctx, cameraX) {
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
    }
}

export default Enemy;