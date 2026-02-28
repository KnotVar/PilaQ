import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { db } from '../db/schema.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const { student_id, date, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT c.*, 
      s.student_id as student_number, s.first_name, s.last_name, s.course,
      u.full_name as nurse_name
    FROM consultations c
    JOIN students s ON c.student_id = s.id
    JOIN users u ON c.nurse_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (student_id) {
    query += ' AND c.student_id = ?';
    params.push(student_id);
  }
  if (date) {
    query += ' AND c.visit_date = ?';
    params.push(date);
  }

  const countQuery = 'SELECT COUNT(*) as total FROM consultations c WHERE 1=1' +
    (student_id ? ' AND c.student_id = ?' : '') +
    (date ? ' AND c.visit_date = ?' : '');
  const countResult = db.prepare(countQuery).get(...params);
  const total = countResult.total;

  query += ' ORDER BY c.visit_date DESC, c.visit_time DESC';

  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const consultations = db.prepare(query).all(...params);
  res.json({ consultations, total, page: parseInt(page), limit: parseInt(limit) });
});

router.get('/:id', (req, res) => {
  const consultation = db.prepare(`
    SELECT c.*, 
      s.student_id as student_number, s.first_name, s.last_name, s.course, s.year_level,
      s.allergies, s.medical_conditions,
      u.full_name as nurse_name
    FROM consultations c
    JOIN students s ON c.student_id = s.id
    JOIN users u ON c.nurse_id = u.id
    WHERE c.id = ?
  `).get(req.params.id);
  if (!consultation) return res.status(404).json({ error: 'Consultation not found' });
  res.json(consultation);
});

router.post('/', (req, res) => {
  const {
    student_id, visit_date, visit_time, chief_complaint,
    vital_signs, assessment, treatment, medication_given, referral, notes
  } = req.body;

  if (!student_id || !visit_date || !chief_complaint) {
    return res.status(400).json({ error: 'Student, visit date, and chief complaint required' });
  }

  const result = db.prepare(`
    INSERT INTO consultations (student_id, nurse_id, visit_date, visit_time, chief_complaint,
      vital_signs, assessment, treatment, medication_given, referral, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    student_id, req.user.id, visit_date, visit_time || null, chief_complaint,
    vital_signs ? JSON.stringify(vital_signs) : null,
    assessment || null, treatment || null, medication_given || null, referral || null, notes || null
  );
  const consultation = db.prepare(`
    SELECT c.*, s.student_id as student_number, s.first_name, s.last_name,
      u.full_name as nurse_name
    FROM consultations c
    JOIN students s ON c.student_id = s.id
    JOIN users u ON c.nurse_id = u.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);
  res.status(201).json(consultation);
});

router.put('/:id', (req, res) => {
  const consultation = db.prepare('SELECT * FROM consultations WHERE id = ?').get(req.params.id);
  if (!consultation) return res.status(404).json({ error: 'Consultation not found' });

  const fields = [
    'visit_date', 'visit_time', 'chief_complaint', 'vital_signs',
    'assessment', 'treatment', 'medication_given', 'referral', 'notes'
  ];
  const updates = {};
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates[f] = f === 'vital_signs' && typeof req.body[f] === 'object'
        ? JSON.stringify(req.body[f]) : req.body[f];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(updates), req.params.id];

  db.prepare(`UPDATE consultations SET ${setClause} WHERE id = ?`).run(...values);
  const updated = db.prepare(`
    SELECT c.*, s.student_id as student_number, s.first_name, s.last_name,
      u.full_name as nurse_name
    FROM consultations c
    JOIN students s ON c.student_id = s.id
    JOIN users u ON c.nurse_id = u.id
    WHERE c.id = ?
  `).get(req.params.id);
  res.json(updated);
});

export default router;
