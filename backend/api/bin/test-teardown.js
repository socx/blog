#!/usr/bin/env node
/*
  test-teardown.js
  - Drops the test database. Intended to run after tests complete.
*/

require('dotenv').config();
const mysql = require('mysql2/promise');

async function dropTestDatabase() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || '';
  const dbName = process.env.DB_NAME_TEST || 'faithstories_test';

  try {
    const conn = await mysql.createConnection({ host, port, user, password });
    await conn.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    await conn.end();
    console.log(`Dropped test database: ${dbName}`);
  } catch (err) {
    console.error('Failed to drop test database:', err.message || err);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  dropTestDatabase().then(() => process.exit(process.exitCode || 0));
}
