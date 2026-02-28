import { initDb } from '../db/schema.js';

console.log('Initializing database...');
await initDb();
console.log('Database initialized successfully.');
