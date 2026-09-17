import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tasksRouter from './routes/tasks';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { initDatabase, healthCheck, pool } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in dev
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Taskflow API - Task Management System',
    version: '1.0.0',
    endpoints: {
      'GET /api/tasks': 'List all tasks with filtering, search, pagination',
      'GET /api/tasks/stats': 'Get task statistics',
      'GET /api/tasks/:id': 'Get single task',
      'POST /api/tasks': 'Create new task',
      'PUT /api/tasks/:id': 'Update task',
      'PATCH /api/tasks/:id/status': 'Toggle task status',
      'DELETE /api/tasks/:id': 'Delete task',
      'GET /api/health': 'Health check',
    },
    docs: 'https://github.com/your-username/taskflow',
  });
});

app.get('/api/health', async (_req, res) => {
  const dbHealthy = await healthCheck();
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbHealthy ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

app.use('/api/tasks', tasksRouter);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

async function startServer() {
  try {
    // Initialize database
    if (process.env.DATABASE_URL) {
      await initDatabase();
    } else {
      console.log('DATABASE_URL not set - running in MEMORY MODE (demo)');
      console.log('Set DATABASE_URL in .env to connect to Neon PostgreSQL for persistence');
    }

    app.listen(PORT, () => {
      console.log(`
 Taskflow API running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Local:   http://localhost:${PORT}
Health:  http://localhost:${PORT}/api/health
Tasks:   http://localhost:${PORT}/api/tasks
Env:     ${process.env.NODE_ENV || 'development'}
DB:      ${process.env.DATABASE_URL ? 'Neon PostgreSQL ✓' : 'Not configured ✗'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
