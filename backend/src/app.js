import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Allowed frontend domains
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_ALT,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header (e.g. server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options(/.*/, cors(corsOptions));

// Parse JSON requests
app.use(express.json({ limit: '1mb' }));

// Prevent API responses from being cached
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// API routes
app.use('/api', apiRouter);

// Serve built React frontend if available
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const clientDist = path.resolve(
  __dirname,
  '../../frontend/dist'
);

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Global error handler
app.use(errorHandler);

export default app;
