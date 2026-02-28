import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const usePg = !!process.env.DATABASE_URL;

// Convert ? placeholders to $1, $2, ... for PostgreSQL
function toPgParams(sql) {
  let n = 0;
  return sql.replace(/\?/g, () => `$${++n}`);
}

let sqliteDb;
let pgClient;

const db = {
  async getRow(sql, params = []) {
    if (usePg) {
      const r = await pgClient.query(toPgParams(sql), params);
      return r.rows[0] || null;
    }
    return Promise.resolve(sqliteDb.prepare(sql).get(...params) || null);
  },
  async getRows(sql, params = []) {
    if (usePg) {
      const r = await pgClient.query(toPgParams(sql), params);
      return r.rows;
    }
    return Promise.resolve(sqliteDb.prepare(sql).all(...params));
  },
  async run(sql, params = []) {
    if (usePg) {
      const r = await pgClient.query(toPgParams(sql), params);
      return { rowCount: r.rowCount, lastInsertRowid: null };
    }
    const r = sqliteDb.prepare(sql).run(...params);
    return Promise.resolve({ rowCount: r.changes, lastInsertRowid: r.lastInsertRowid });
  },
  async runReturningId(sql, params = [], idColumn = 'id') {
    if (usePg) {
      const withReturning = sql.trim().endsWith(';')
        ? sql.replace(/;\s*$/, ` RETURNING ${idColumn}`)
        : sql + ` RETURNING ${idColumn}`;
      const r = await pgClient.query(toPgParams(withReturning), params);
      return r.rows[0]?.[idColumn] ?? null;
    }
    const r = sqliteDb.prepare(sql).run(...params);
    return Promise.resolve(r.lastInsertRowid);
  },
};

export { db };

export async function initDb() {
  if (usePg) {
    pgClient = new pg.Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    await pgClient.connect();

    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'nurse',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        course VARCHAR(255),
        year_level VARCHAR(50),
        contact VARCHAR(255),
        emergency_contact VARCHAR(255),
        emergency_phone VARCHAR(50),
        blood_type VARCHAR(20),
        allergies TEXT,
        medical_conditions TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS consultations (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES students(id),
        nurse_id INTEGER NOT NULL REFERENCES users(id),
        visit_date DATE NOT NULL,
        visit_time VARCHAR(20),
        chief_complaint TEXT NOT NULL,
        vital_signs TEXT,
        assessment TEXT,
        treatment TEXT,
        medication_given TEXT,
        referral TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_consultations_student ON consultations(student_id);
      CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(visit_date);
      CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
      CREATE INDEX IF NOT EXISTS idx_students_name ON students(first_name, last_name);
    `);

    const userCount = await db.getRow('SELECT COUNT(*) as count FROM users');
    if (Number(userCount?.count) === 0) {
      const hash = bcrypt.hashSync('clinic123', 10);
      await db.run(
        `INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)`,
        ['nurse', hash, 'Clinic Nurse', 'nurse']
      );
      console.log('Created default nurse account: username=nurse, password=clinic123');
    }
    return;
  }

  // SQLite (local)
  const Database = (await import('better-sqlite3')).default;
  const dbPath = path.join(__dirname, 'clinic.db');
  sqliteDb = new Database(dbPath);

  sqliteDb.exec(`
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

  const userCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const hash = bcrypt.hashSync('clinic123', 10);
    sqliteDb.prepare(`
      INSERT INTO users (username, password_hash, full_name, role)
      VALUES (?, ?, ?, ?)
    `).run('nurse', hash, 'Clinic Nurse', 'nurse');
    console.log('Created default nurse account: username=nurse, password=clinic123');
  }
}
