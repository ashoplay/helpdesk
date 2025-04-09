const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const colors = require('colors'); // Add this import for the colors library

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');
const tickets = require('./routes/tickets');
const comments = require('./routes/comments');
const stats = require('./routes/stats');
const companies = require('./routes/companies');
const users = require('./routes/users');

// Initialize Express
const app = express();

// Trust proxy
app.set('trust proxy', 1);  // Trust first proxy - adjust the number if behind multiple proxies

// Request logging middleware for debugging (add this)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, error: 'Too many requests, please try again later.' }
});

// Apply rate limiting to authentication routes
app.use('/api/auth', apiLimiter);

// Mount routers
app.use('/api/auth', auth);
app.use('/api/tickets', tickets);
app.use('/api/comments', comments);
app.use('/api/stats', stats);
app.use('/api/companies', companies);
app.use('/api/users', users);

// Create server with socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Use environment variable instead of hardcoded value
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
});

// Socket.io connections
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join ticket room
  socket.on('joinTicket', (ticketId) => {
    socket.join(`ticket-${ticketId}`);
    console.log(`User joined ticket: ${ticketId}`);
  });
  
  // Leave ticket room
  socket.on('leaveTicket', (ticketId) => {
    socket.leave(`ticket-${ticketId}`);
    console.log(`User left ticket: ${ticketId}`);
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Add socket.io instance to app for use in controllers
app.set('io', io);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Error handler middleware
app.use(errorHandler);

// CHANGE THIS: Use 'server' to listen, not 'app'
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
