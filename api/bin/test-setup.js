#!/usr/bin/env node
/*
  test-setup.js
  - Creates the test database if missing
  - Runs knex migrations and seeds against the test config
*/

require('dotenv').config();
const path = require('path');
const Knex = require('knex');
const mysql = require('mysql2/promise');
const knexfile = require(path.resolve(__dirname, '..', '..', 'knexfile'));

async function ensureTestDatabase() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || '';
  const dbName = process.env.DB_NAME_TEST || 'faithstories_test';

  const conn = await mysql.createConnection({ host, port, user, password });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();
  console.log(`Ensured test database exists: ${dbName}`);
}

async function runMigrationsAndSeeds() {
  const env = 'test';
  const rawConfig = knexfile[env] || knexfile.development;
  // ensure migrations/seeds directories are absolute (knex resolves relative to cwd)
  const config = Object.assign({}, rawConfig, {
    migrations: Object.assign({}, rawConfig.migrations, { directory: path.resolve(__dirname, '..', '..', 'migrations') }),
    seeds: Object.assign({}, rawConfig.seeds, { directory: path.resolve(__dirname, '..', '..', 'seeds') }),
  });
  const knex = Knex(config);
  try {
    console.log('Running migrations...');
    await knex.migrate.latest();
    console.log('Running seeds...');
    await knex.seed.run();
    console.log('Migrations and seeds complete.');
  } finally {
    await knex.destroy();
  }
}

async function main() {
  try {
    await ensureTestDatabase();
    await runMigrationsAndSeeds();
    process.exit(0);
  } catch (err) {
    console.error('Test DB setup failed:', err);
    process.exit(1);
  }
}

if (require.main === module) main();
