/*
mainクラス
*/

import Player from './player.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const player = new Player(100, 280);

// キー入力管理
const keys = {};

// 地面・障害物
const platforms = [
    { x: 0, y: 330, width: 2000, height: 70 }, // 床
    { x: 400, y: 280, width: 100, height: 20 },
    { x: 600, y: 230, width: 100, height: 20 },
    { x: 800, y: 180, width: 200, height: 20 },
    { x: 1600, y: 230, width: 100, height: 20 },
];

let cameraX = 0;

// キーイベントリスナー
document.addEventListener('keydown', e => {keys[e.code] = true;});
document.addEventListener('keyup', e => keys[e.code] = false);

function update() {
    player.update(keys, platforms);

    // カメラをプレイヤーに追従
    cameraX = player.x - 150;
    if (cameraX < 0) cameraX = 0;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /// オブジェクトの描画関係
    // プラットフォーム描画
    ctx.fillStyle = '#219ebc';
    for (const p of platforms) {
        ctx.fillRect(p.x - cameraX, p.y, p.width, p.height);
    }

    // プレイヤー描画
    ctx.fillStyle = '#ffb703';
    player.draw(ctx, cameraX);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}


const socket = io();
socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    socket.emit('playerUpdate', { x: player.x });
});

gameLoop();
