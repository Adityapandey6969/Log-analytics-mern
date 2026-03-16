const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow any origin for simplicity, use specific origin in prod
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Connect to MongoDB
connectDB();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
  
  // Optional: Client can request specific service logs
  socket.on('subscribe', (service) => {
    socket.join(service);
    console.log(`Client ${socket.id} subscribed to ${service}`);
  });
});

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    service: 'Log Analytics API',
    connectedClients: io.engine.clientsCount
  });
});

app.use('/api/logs', require('./routes/logs'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔌 Socket.io ready for connections`);
});
