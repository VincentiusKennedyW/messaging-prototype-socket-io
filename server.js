const server = require('http').createServer();
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});
const Redis = require('ioredis');
const redis = new Redis();

// Psubscribe untuk menangkap semua channel yang memiliki pola tertentu
redis.psubscribe('laravel_database_private-chat-channel.*', (err, count) => {
  if (err) {
    console.error(`Failed to psubscribe: ${err.message}`);
  } else {
    console.log(`Subscribed to pattern. Channel count: ${count}`);
  }
});

redis.on('pmessage', (pattern, channel, message) => {
  const parsedMessage = JSON.parse(message);
  console.log(`Message received on channel ${channel}:`, parsedMessage);

  // Emit event yang sesuai ke client melalui Socket.IO
  if (parsedMessage && parsedMessage.event && parsedMessage.data) {
    io.emit(`${channel}:${parsedMessage.event}`, parsedMessage.data);
  } else {
    console.warn('Received message in unexpected format:', parsedMessage);
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(8001, () => {
  console.log('Socket.IO server is running on port 8001');
});
