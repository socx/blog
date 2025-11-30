#!/usr/bin/env node
/*
  test-teardown.js
  - Drops the test database. Intended to run after tests complete.
*/

require('dotenv').config();
const mysql = require('mysql2/promise');

async function killActiveConnections(conn, dbName) {
  try {
    const [rows] = await conn.query(
      'SELECT ID FROM information_schema.PROCESSLIST WHERE DB = ? AND ID <> CONNECTION_ID()',
      [dbName]
    );
    if (Array.isArray(rows) && rows.length) {
      console.log(`Killing ${rows.length} active connection(s) to ${dbName}...`);
      for (const r of rows) {
        const id = r.ID || r.Id || r.id;
        if (!id) continue;
        try {
          await conn.query(`KILL ${id}`);
        } catch (e) {
          // Likely missing PROCESS privilege; log and continue
          console.warn(`Warning: failed to KILL ${id}: ${e && e.message ? e.message : e}`);
        }
      }
    }
  } catch (err) {
    console.warn('Warning: unable to enumerate processlist (insufficient privileges?):', err && err.message ? err.message : err);
  }
}

async function dropTestDatabase() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || '';
  const dbName = process.env.DB_NAME_TEST || 'faithstories_test';

  const conn = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  try {
    await killActiveConnections(conn, dbName);
    await conn.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    await conn.end();
    console.log(`Dropped test database: ${dbName}`);
  } catch (err) {
    // Common in CI: user lacks DROP privilege; don't fail the job
    console.warn(`Warning: failed to drop test database '${dbName}': ${err && err.message ? err.message : err}`);
    process.exitCode = 1;
  } finally {
    try { await conn.end(); } catch (_) {}
  }
}

// Safety timer: ensure teardown never hangs the workflow
const timeoutMs = process.env.CI === 'true' ? 10000 : parseInt(process.env.TEST_TEARDOWN_TIMEOUT_MS || '20000', 10);
const safetyTimer = setTimeout(() => {
  console.warn(`Teardown timeout (${timeoutMs}ms) exceeded; forcing exit.`);
  process.exit(0);
}, timeoutMs);

if (require.main === module) {
  dropTestDatabase()
    .then(() => {
      clearTimeout(safetyTimer);
      process.exit(0);
    })
    .catch(() => {
      clearTimeout(safetyTimer);
      // Exit 0 to avoid failing CI due to privilege constraints
      process.exit(0);
    });
}

if (require.main === module) {
  dropTestDatabase().then(() => process.exit(process.exitCode || 0));
}
