import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env, validateServerEnv } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

// Validate environment on startup
validateServerEnv();

const app = express();

// ─── Middleware ───
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───
app.use('/api', routes);

// ─── Error Handler (must be last) ───
app.use(errorHandler);

// ─── Start Server ───
app.listen(env.PORT, () => {
  console.log(`[CivicLens API] Running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

export default app;
