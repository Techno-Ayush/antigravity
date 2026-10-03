import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { initSocket } from './sockets/socketManager.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { seedDatabase } from './seed/seedData.js';
import User from './models/User.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import creditRoutes from './routes/creditRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});
initSocket(io);

// Security & Parsing Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: '*',
    credentials: true
  })
);
app.use(express.json());

// Basic Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', limiter);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Peer-to-Peer Skill Exchange API',
    creditEconomy: 'Active (1 hr = 1 credit)',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Serve static client assets in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server and Auto-Seed if database is fresh
const startServer = async () => {
  try {
    await connectDB();

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap] Empty database detected. Auto-seeding initial users, skills & demo transactions...');
      await seedDatabase();
    } else {
      console.log(`[Bootstrap] Existing database found with ${userCount} users.`);
    }

    server.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Skill Exchange Server running on port ${PORT}`);
      console.log(`💡 USP: Free Time-Bank / Knowledge Currency Platform`);
      console.log(`📡 Real-time Socket.io initialized`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('[Server] Failed to launch server:', err.message);
    process.exit(1);
  }
};

startServer();
