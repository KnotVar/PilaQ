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

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'APCAS Clinic API is running' });
});

// Initialize database on startup
initDb();

app.listen(PORT, () => {
  console.log(`APCAS Clinic API running at http://localhost:${PORT}`);
});
