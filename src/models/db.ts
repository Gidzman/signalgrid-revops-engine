import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'signalgrid.db');
// Removed verbose logging parameter for production-grade clean terminal output
const db = new Database(dbPath);

export function initializeDatabase(): void {
  const createAuditTableQuery = `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      correlationId TEXT NOT NULL,
      entityDomain TEXT NOT NULL,
      processingStage TEXT NOT NULL,
      status TEXT NOT NULL,
      attemptCount INTEGER NOT NULL,
      payloadSnapshot TEXT NOT NULL,
      errorMessage TEXT,
      createdAt TEXT NOT NULL
    );
  `;
  db.exec(createAuditTableQuery);
}

export default db;