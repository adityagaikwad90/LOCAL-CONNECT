require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json()); // Add JSON body parsing

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

// Initialize Gemini Client
let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// AI Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!ai) {
       return res.status(500).json({ 
         error: 'AI is not configured.', 
         reply: 'I am currently offline. Please set the GEMINI_API_KEY in the server to wake me up!' 
       });
    }

    // You can add a system prompt or adjust the model here
    const systemInstruction = "You are a helpful travel assistant for an app called LocalConnect. You help travelers find locals, get city recommendations, and plan itineraries. Keep your responses concise, friendly, and formatted nicely with markdown if possible.";
    
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
      }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to process AI request', reply: 'Sorry, I encountered an error while thinking about that.' });
  }
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Socket.io server is running on port ${PORT}`);
});
