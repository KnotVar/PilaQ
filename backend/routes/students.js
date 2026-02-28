import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { db } from '../db/schema.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
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

  const countResult = await db.getRow(
    query.replace('SELECT *', 'SELECT COUNT(*) as total'),
    params
  );
  const total = Number(countResult?.total ?? 0);

  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const students = await db.getRows(query, params);
  res.json({ students, total, page: parseInt(page), limit: parseInt(limit) });
});

router.get('/:id', async (req, res) => {
  const student = await db.getRow('SELECT * FROM students WHERE id = ?', [req.params.id]);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

router.post('/', async (req, res) => {
  const {
    student_id, first_name, last_name, course, year_level,
    contact, emergency_contact, emergency_phone, blood_type,
    allergies, medical_conditions, notes
  } = req.body;

  if (!student_id || !first_name || !last_name) {
    return res.status(400).json({ error: 'Student ID, first name, and last name required' });
  }

  try {
    const id = await db.runReturningId(
      `INSERT INTO students (student_id, first_name, last_name, course, year_level,
        contact, emergency_contact, emergency_phone, blood_type,
        allergies, medical_conditions, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id, first_name, last_name, course || null, year_level || null,
        contact || null, emergency_contact || null, emergency_phone || null,
        blood_type || null, allergies || null, medical_conditions || null, notes || null
      ]
    );
    const student = await db.getRow('SELECT * FROM students WHERE id = ?', [id]);
    res.status(201).json(student);
  } catch (err) {
    if (err.message?.includes('UNIQUE') || err.code === '23505') {
      return res.status(400).json({ error: 'Student ID already exists' });
    }
    throw err;
  }
});

router.put('/:id', async (req, res) => {
  const student = await db.getRow('SELECT * FROM students WHERE id = ?', [req.params.id]);
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

  const setClause = Object.keys(updates).map((k, i) => `${k} = ?`).join(', ');
  const values = [...Object.values(updates), req.params.id];

  await db.run(
    `UPDATE students SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values
  );
  const updated = await db.getRow('SELECT * FROM students WHERE id = ?', [req.params.id]);
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const result = await db.run('DELETE FROM students WHERE id = ?', [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Student not found' });
  res.json({ message: 'Student deleted' });
});

export default router;
