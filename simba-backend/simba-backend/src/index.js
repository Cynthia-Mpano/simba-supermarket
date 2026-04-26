import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { connectDB } from './db/connection.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import analyticsRouter from './routes/analytics.js';

const app = express();

// ── Security & Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

// ── Rate Limiting ────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 20,
  message: { error: 'Too many orders placed. Please try again in an hour.' },
});

app.use('/api/', apiLimiter);
app.use('/api/orders', orderLimiter);

// ── Routes ───────────────────────────────────────────────────────────
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);
app.use('/api/analytics', analyticsRouter);

// ── Health Check ─────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ── Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────────────
async function bootstrap() {
  await connectDB();
  app.listen(config.PORT, () => {
    console.log(`🚀 Simba API running on http://localhost:${config.PORT}`);
  });
}

bootstrap().catch(console.error);
