const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const redis = require('redis');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 4000;

// Redisクライアント
const redisSub = redis.createClient();
const redisPub = redis.createClient();

(async () => {
  await redisSub.connect();
  await redisPub.connect();
})();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

io.on('connection', (socket) => {
  console.log('管理画面クライアント接続:', socket.id);

  // Redis購読：チャットログ
  const subscribeChatLogs = async () => {
    await redisSub.subscribe('chatLogs', (message) => {
      socket.emit('chatLog', JSON.parse(message));
    });
  };
  subscribeChatLogs();

  // BANコマンド受信
  socket.on('banUser', ({ ip }) => {
    if (!ip) return;
    redisPub.publish('adminCommands', JSON.stringify({ type: 'ban', ip }));
    console.log(`BAN命令送信: ${ip}`);
  });

  // リセットコマンド受信
  socket.on('resetServer', () => {
    redisPub.publish('adminCommands', JSON.stringify({ type: 'reset' }));
    console.log('サーバーリセット命令送信');
  });
});

server.listen(PORT, () => {
  console.log(`管理サーバー起動: http://localhost:${PORT}`);
});
