const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check API (used by Docker & Kubernetes)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'mern-todo-server',
    version: '1.0.0',
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 MERN Obsidian Todo API is running successfully',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        profile: 'PUT /api/auth/profile',
      },
      todos: {
        list: 'GET /api/todos',
        create: 'POST /api/todos',
        stats: 'GET /api/todos/stats',
        getOne: 'GET /api/todos/:id',
        update: 'PUT /api/todos/:id',
        toggle: 'PATCH /api/todos/:id/toggle',
        delete: 'DELETE /api/todos/:id',
        clearCompleted: 'DELETE /api/todos/clear-completed',
      },
    },
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/todos', require('./routes/todoRoutes'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

let PORT = parseInt(process.env.PORT, 10) || 5001;

function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    console.log(`=========================================`);
    console.log(`🚀 MERN Todo Server running in ${process.env.NODE_ENV || 'development'} mode on port ${portToTry}`);
    console.log(`📡 Healthcheck available at: http://localhost:${portToTry}/api/health`);
    console.log(`=========================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Port Conflict] Port ${portToTry} is already in use. Retrying on port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('[Server Error]', err);
    }
  });

  return server;
}

const serverInstance = startServer(PORT);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
});

module.exports = app;
