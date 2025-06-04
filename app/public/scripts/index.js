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
document.addEventListener('keydown', e => {
    if (e.code === 'Space' && player.onGround) {
        socket.emit('playerJump');
    }
});

let lastPlayerUpdate = 0;
let sentOnce = false;
const updateInterval = 1000 / 10; 

function update() {
    const previousX = player.x;
    const previousY = player.y;
    player.update(keys, platforms);

    const now = Date.now();
    // x座標またはy座標が変更され、かつupdateIntervalが経過した場合にのみ送信
    if ((player.x !== previousX || player.y !== previousY) && (now - lastPlayerUpdate > updateInterval || !sentOnce)) {
        socket.emit('playerUpdate', { x: player.x, y: player.y });
        lastPlayerUpdate = now;
        sentOnce = true;
    }
    
    // カメラをプレイヤーの位置に追従させる
    cameraX = player.x - canvas.width / 2 + player.width / 2;

    socket.on('playersData', (players) => {
    console.log(players);

    players.forEach(player => {
        updatePlayerOnScreen(player.id, player.x, player.y);
    });
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /// オブジェクトの描画関係
    // プラットフォーム描画
    ctx.fillStyle = '#219ebc';
    for (const p of platforms) {
        ctx.fillRect(p.x - cameraX, p.y, p.width, p.height);
    }
    // 他のプレイヤーを描画
    otherPlayers.forEach(otherPlayer => {
        otherPlayer.draw(ctx, cameraX);
    });

    // プレイヤー描画
    ctx.fillStyle = '#ffb703';
    player.draw(ctx, cameraX);
}

function gameLoop() {
    update();
    updateOtherPlayers();
    draw();
    requestAnimationFrame(gameLoop);
}

function updateOtherPlayers() {
  otherPlayers.forEach(otherPlayer => {
    // 位置補間
    otherPlayer.x += (otherPlayer.targetX - otherPlayer.x) * 0.3;
    // otherPlayer.y += (otherPlayer.targetY - otherPlayer.y) * 0.3;
    otherPlayer.update({}, platforms);
  });
}



const socket = io();
const otherPlayers = new Map(); 

// サーバーから全プレイヤーデータを受信したときの処理
socket.on('playersData', (players) => {
  players.forEach(playerData => {
    if (playerData.id === socket.id) return;

    if (!otherPlayers.has(playerData.id)) {
      const newPlayer = new Player(playerData.x, playerData.y);
      newPlayer.id = playerData.id;
      newPlayer.color = '#005D4D';
      otherPlayers.set(playerData.id, newPlayer);
    } else {
      const existingPlayer = otherPlayers.get(playerData.id);
      // 直接x,yを更新せず、targetを更新
      existingPlayer.targetX = playerData.x;
      existingPlayer.targetY = playerData.y;
    }
  });

  const activeIds = new Set(players.map(p => p.id));
  otherPlayers.forEach((_, id) => {
    if (!activeIds.has(id) && id !== socket.id) {
      otherPlayers.delete(id);
    }
  });
});

socket.on('playerJump', (data) => {
    const otherPlayer = otherPlayers.get(data.playerId);
    if (otherPlayer) {
        otherPlayer.vy = -15; // ジャンプ力を直接適用
        otherPlayer.onGround = false;
    }
});

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    player.id = socket.id;
    socket.emit('playerUpdate', { x: player.x, y: player.y });
});

gameLoop();
