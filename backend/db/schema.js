import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'clinic.db');
export const db = new Database(dbPath);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT DEFAULT 'nurse',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      course TEXT,
      year_level TEXT,
      contact TEXT,
      emergency_contact TEXT,
      emergency_phone TEXT,
      blood_type TEXT,
      allergies TEXT,
      medical_conditions TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      nurse_id INTEGER NOT NULL,
      visit_date DATE NOT NULL,
      visit_time TEXT,
      chief_complaint TEXT NOT NULL,
      vital_signs TEXT,
      assessment TEXT,
      treatment TEXT,
      medication_given TEXT,
      referral TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (nurse_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_consultations_student ON consultations(student_id);
    CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(visit_date);
    CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
    CREATE INDEX IF NOT EXISTS idx_students_name ON students(first_name, last_name);
  `);

  // Seed default nurse if no users exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const hash = bcrypt.hashSync('clinic123', 10);
    db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role)
      VALUES (?, ?, ?, ?)
    `).run('nurse', hash, 'Clinic Nurse', 'nurse');
    console.log('Created default nurse account: username=nurse, password=clinic123');
  }
}
