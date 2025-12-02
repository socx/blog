#!/usr/bin/env node
/*
  test-teardown.js
  - Drops the test database. Intended to run after tests complete.
*/

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const os = require('os');
const path = require('path');

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
    try {
      await conn.end();
    } catch (_) {
      console.warn('Warning: failed to close DB connection during teardown.');
    }
  }
}

// Safety timer: ensure teardown never hangs the workflow
const timeoutMs = process.env.CI === 'true' ? 10000 : parseInt(process.env.TEST_TEARDOWN_TIMEOUT_MS || '20000', 10);
const safetyTimer = setTimeout(() => {
  console.warn(`Teardown timeout (${timeoutMs}ms) exceeded; forcing exit.`);
  process.exit(0);
}, timeoutMs);

function removeUploadsDirIfSafe() {
  try {
    const uploadsDir = process.env.UPLOADS_DIR;
    const cleanupFlag = String(process.env.CLEANUP_UPLOADS || 'true').toLowerCase();
    if (cleanupFlag === 'false') {
      console.log('[teardown] CLEANUP_UPLOADS is false; skipping uploads dir removal');
      return;
    }
    if (!uploadsDir) return;
    const resolved = path.resolve(uploadsDir);
    const tmp = os.tmpdir();
    // Only remove if uploadsDir is inside system temp directory (safety guard)
    if (resolved.indexOf(path.resolve(tmp)) !== 0) {
      console.warn(`[teardown] skipping removal of UPLOADS_DIR outside tmp: ${resolved}`);
      return;
    }
    console.log(`[teardown] removing UPLOADS_DIR: ${resolved}`);
    try {
      fs.rmSync(resolved, { recursive: true, force: true });
    } catch (e) {
      // older Node may not have fs.rmSync; fallback to rmdirSync
      try { fs.rmdirSync(resolved, { recursive: true }); } catch (_) {}
    }
  } catch (err) {
    console.warn('[teardown] failed to remove UPLOADS_DIR:', err && err.message ? err.message : err);
  }
}

if (require.main === module) {
  dropTestDatabase()
    .then(() => {
      try {
        removeUploadsDirIfSafe();
      } catch (e) {

      }
      clearTimeout(safetyTimer);
      process.exit(0);
    })
    .catch(() => {
      try {
        removeUploadsDirIfSafe();
      } catch (e) {

      }
      clearTimeout(safetyTimer);
      // Exit 0 to avoid failing CI due to privilege constraints
      process.exit(0);
    });
}

if (require.main === module) {
  dropTestDatabase().then(() => {
    try {
      removeUploadsDirIfSafe(); 
    } catch (e) {
      
    }
    process.exit(process.exitCode || 0);
  });
}
