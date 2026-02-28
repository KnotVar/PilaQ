import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { db } from '../db/schema.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/stats', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const todayCount = await db.getRow(
    'SELECT COUNT(*) as count FROM consultations WHERE visit_date = ?',
    [today]
  );

  const weekCount = await db.getRow(
    process.env.DATABASE_URL
      ? `SELECT COUNT(*) as count FROM consultations WHERE visit_date >= CURRENT_DATE - INTERVAL '7 days'`
      : `SELECT COUNT(*) as count FROM consultations WHERE visit_date >= date('now', '-7 days')`,
    process.env.DATABASE_URL ? [] : []
  );

  const totalStudents = await db.getRow('SELECT COUNT(*) as count FROM students');

  const topComplaints = await db.getRows(
    process.env.DATABASE_URL
      ? `SELECT LOWER(TRIM(chief_complaint)) AS chief_complaint, COUNT(*) as count FROM consultations
         WHERE visit_date >= CURRENT_DATE - INTERVAL '30 days'
         GROUP BY LOWER(TRIM(chief_complaint)) ORDER BY count DESC LIMIT 10`
      : `SELECT chief_complaint, COUNT(*) as count FROM consultations
         WHERE visit_date >= date('now', '-30 days')
         GROUP BY LOWER(TRIM(chief_complaint)) ORDER BY count DESC LIMIT 10`,
    []
  );

  res.json({
    today: Number(todayCount?.count ?? 0),
    thisWeek: Number(weekCount?.count ?? 0),
    totalStudents: Number(totalStudents?.count ?? 0),
    topComplaints,
  });
});

export default router;
