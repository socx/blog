require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabaseIfNotExists() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || '';
  const dbName = process.env.DB_NAME || 'faithstories_dev';

  console.log(`Connecting to MySQL ${host}:${port} as ${user} to ensure database '${dbName}' exists...`);

  let connection;
  try {
    connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`Database '${dbName}' is ready.`);
  } catch (err) {
    console.error('Failed to create database:', err.message || err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

createDatabaseIfNotExists();
