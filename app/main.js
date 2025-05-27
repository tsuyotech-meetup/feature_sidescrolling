var express = require('express');
var app = express();
var server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 7000;

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

server.listen(PORT, function () {
    console.log('server listening. Port:' + PORT);
});
