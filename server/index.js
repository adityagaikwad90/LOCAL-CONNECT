const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this to the frontend URL
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a specific chat room
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat room: ${chatId}`);
  });

  // Leave a specific chat room (optional, but good practice)
  socket.on('leave_chat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.id} left chat room: ${chatId}`);
  });

  // Handle incoming messages
  socket.on('send_message', (data) => {
    // data should contain { chatId, message: { id, senderId, text, createdAt, ... } }
    console.log(`Message received in room ${data.chatId}:`, data.message.text);

    // Broadcast the message to everyone in the room EXCEPT the sender
    socket.to(data.chatId).emit('receive_message', data.message);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Socket.io server is running on port ${PORT}`);
});
