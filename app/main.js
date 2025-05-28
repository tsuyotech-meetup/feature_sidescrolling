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

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

io.on('connection', async (socket) => {
    console.log('A user connected:', socket.id);
    let redis;
    // 新しいプレイヤーを作成
    try {
        redis = new RedisModule();
        await redis.connect();

        await redis.set(socket.id, JSON.stringify({ x: 0, y: 0 }));
        console.log(`Player ${socket.id} initialized in Redis`);
    }
    catch (error) {
        console.error('Redis operation failed on connection:', error);
    }
    finally {
        if (redis) {
            await redis.disconnect();
        }
    }

    // プレイヤーの更新情報を受信
    socket.on('playerUpdate', async (playerData) => {
        let redisUpdate;
        try {
            redisUpdate = new RedisModule();
            await redisUpdate.connect();

            await redisUpdate.set(socket.id, JSON.stringify({ x: playerData.x, y: playerData.y }));
            console.log(`Player ${socket.id} updated in Redis`);
        }
        catch (error) {
            console.error('Redis operation failed on playerUpdate:', error);
        }
        finally {
            if (redisUpdate) {
                await redisUpdate.disconnect();
            }
        }
    });

    // プレイヤーの削除
    socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);
        let redisDisconnect;
        try {
            redisDisconnect = new RedisModule();
            await redisDisconnect.connect();

            await redisDisconnect.del(socket.id);
            console.log(`Player ${socket.id} data deleted in Redis`);
        }
        catch (error) {
            console.error('Redis operation failed on disconnect:', error);
        }
        finally {
            if (redisDisconnect) {
                await redisDisconnect.disconnect();
            }
        }
    });
});

server.listen(PORT, function () {
    console.log('server listening. Port:' + PORT);
});
