import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db/awqaf-froms.db');
const db = new Database(dbPath, { verbose: console.log });

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT
  )
`).run();

export default db;
