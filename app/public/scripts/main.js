/*
mainクラス
*/

import Player from './player.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const player = new Player(430, 0);

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

let lastPlayerUpdate = 0;
const updateInterval = 1000 / 10; 

function update() {
    const previousX = player.x;
    const previousY = player.y;
    player.update(keys, platforms);

    const now = Date.now();
    // x座標またはy座標が変更され、かつupdateIntervalが経過した場合にのみ送信
    if ((player.x !== previousX || player.y !== previousY) && (now - lastPlayerUpdate > updateInterval)) {
        socket.emit('playerUpdate', { x: player.x, y: player.y });
        lastPlayerUpdate = now;
    }
    
    // カメラをプレイヤーの位置に追従させる
    cameraX = player.x - canvas.width / 2 + player.width / 2;
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
const otherPlayers = {}; // 他のプレイヤーを格納するオブジェクト

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    player.id = socket.id;
    socket.emit('playerUpdate', { x: player.x, y: player.y });
});

gameLoop();
