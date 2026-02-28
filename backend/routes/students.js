import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { db } from '../db/schema.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = 'SELECT * FROM students';
  const params = [];

  if (search) {
    query += ` WHERE student_id LIKE ? OR first_name LIKE ? OR last_name LIKE ?`;
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  query += ' ORDER BY last_name, first_name';

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countResult = db.prepare(countQuery).get(...params);
  const total = countResult.total;

  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const students = db.prepare(query).all(...params);
  res.json({ students, total, page: parseInt(page), limit: parseInt(limit) });
});

router.get('/:id', (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

router.post('/', (req, res) => {
  const {
    student_id, first_name, last_name, course, year_level,
    contact, emergency_contact, emergency_phone, blood_type,
    allergies, medical_conditions, notes
  } = req.body;

  if (!student_id || !first_name || !last_name) {
    return res.status(400).json({ error: 'Student ID, first name, and last name required' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO students (student_id, first_name, last_name, course, year_level,
        contact, emergency_contact, emergency_phone, blood_type,
        allergies, medical_conditions, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      student_id, first_name, last_name, course || null, year_level || null,
      contact || null, emergency_contact || null, emergency_phone || null,
      blood_type || null, allergies || null, medical_conditions || null, notes || null
    );
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(student);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Student ID already exists' });
    }
    throw err;
  }
});

router.put('/:id', (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const fields = [
    'student_id', 'first_name', 'last_name', 'course', 'year_level',
    'contact', 'emergency_contact', 'emergency_phone', 'blood_type',
    'allergies', 'medical_conditions', 'notes'
  ];
  const updates = {};
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(updates), req.params.id];

  db.prepare(`UPDATE students SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
  const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Student not found' });
  res.json({ message: 'Student deleted' });
});

export default router;
