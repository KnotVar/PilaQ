import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db/schema.js';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import consultationRoutes from './routes/consultations.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Allow your Z.com frontend; set FRONTEND_URL on Render to your exact site URL (e.g. https://yoursite.z.com)
const corsOrigin = process.env.FRONTEND_URL || true;
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'APCAS Clinic API is running' });
});

// Initialize database then start server
const start = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`APCAS Clinic API running at http://localhost:${PORT}`);
  });
};
start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
