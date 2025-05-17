const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

app.get('/room/:id', (req, res) => {
  res.sendFile(__dirname + '/public/chat.html');
});

io.on('connection', socket => {
  socket.on('join', roomID => {
    const clients = io.sockets.adapter.rooms.get(roomID) || new Set();
    if (clients.size >= 2) {
      socket.emit('room-full');
      return;
    }

    socket.join(roomID);
    socket.to(roomID).emit('new-user');

    socket.on('signal', data => {
      socket.to(roomID).emit('signal', data);
    });

    socket.on('disconnect', () => {
      socket.to(roomID).emit('user-left');
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

