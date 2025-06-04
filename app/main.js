import RedisModule from './modules/redis_module.js';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.Server(app);
const io = new SocketIOServer(server);
const PORT = process.env.PORT || 7000;

// Redisクライアントを1つだけ生成 sawada
const redis = new RedisModule();
await redis.connect(); // サーバー起動時に一度だけ接続

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// プレイヤー座標の定期ブロードキャスト sawada
setInterval(async () => {
    try {
        // すべてのキー（socket.id）を取得
        const keys = await redis.client.keys('*');
        if (keys.length === 0) return;
        // まとめて値を取得
        const values = await redis.client.mGet(keys);
        // 配信用データ整形
        const players = keys.map((key, i) => ({
            id: key,
            ...JSON.parse(values[i])
        }));
        io.emit('playersData', players);
    } catch (err) {
        console.error('Error broadcasting players data:', err);
    }
}, 1); // ここでラグを調整

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // 新しいプレイヤーを作成
    redis.set(socket.id, JSON.stringify({ x: 0, y: 0 }))
        .then(() => console.log(`Player ${socket.id} initialized in Redis`))
        .catch(error => console.error('Redis operation failed on connection:', error));

    // プレイヤーの更新情報を受信
    socket.on('playerUpdate', (playerData) => {
        redis.set(socket.id, JSON.stringify({ x: playerData.x, y: playerData.y }))
            .then(() => console.log(`Player ${socket.id} updated in Redis`))
            .catch(error => console.error('Redis operation failed on playerUpdate:', error));
    });

    socket.on('playerJump', () => {
        io.emit('playerJump', { playerId: socket.id, timestamp: Date.now() });
    });

    // プレイヤーの削除
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        redis.del(socket.id)
            .then(() => console.log(`Player ${socket.id} data deleted in Redis`))
            .catch(error => console.error('Redis operation failed on disconnect:', error));
    });
});

server.listen(PORT, function () {
    console.log('server listening. Port:' + PORT);
});
