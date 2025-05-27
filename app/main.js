var express = require('express');
var app = express();
var server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 7000;

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});


const players = {}; // 接続されているプレイヤーを管理
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    // 新しいプレイヤーを作成
    players[socket.id] = {
        id: socket.id,
        x: 0,
        y: 0,
    };

    // プレイヤーの更新情報を受信
    socket.on('playerUpdate', (playerData) => {
        if (players[socket.id]) {
            players[socket.id].x = playerData.x;
            players[socket.id].y = playerData.y;
            console.log(`Player ${socket.id} updated position: (${playerData.x}, ${playerData.y})`);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

});

server.listen(PORT, function () {
    console.log('server listening. Port:' + PORT);
});
