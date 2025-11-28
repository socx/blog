const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  const password = process.env.ADMIN_PASSWORD || 'changeme';
  const hash = await bcrypt.hash(password, 10);

  await knex('users').insert([
    {
      id: 1,
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password_hash: hash,
      role: 'admin',
      created_at: new Date()
    }
  ]);
};
