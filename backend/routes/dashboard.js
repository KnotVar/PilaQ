import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { db } from '../db/schema.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/stats', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const todayCount = db.prepare(`
    SELECT COUNT(*) as count FROM consultations WHERE visit_date = ?
  `).get(today);

  const weekCount = db.prepare(`
    SELECT COUNT(*) as count FROM consultations 
    WHERE visit_date >= date('now', '-7 days')
  `).get();

  const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get();

  const topComplaints = db.prepare(`
    SELECT chief_complaint, COUNT(*) as count 
    FROM consultations 
    WHERE visit_date >= date('now', '-30 days')
    GROUP BY LOWER(TRIM(chief_complaint))
    ORDER BY count DESC
    LIMIT 10
  `).all();

  res.json({
    today: todayCount.count,
    thisWeek: weekCount.count,
    totalStudents: totalStudents.count,
    topComplaints,
  });
});

export default router;
