const path = require('path');

function loadBcrypt() {
  try {
    return require('bcryptjs');
  } catch (err) {
    // Try to resolve bcryptjs from the API package's node_modules (sibling folder)
    try {
      return require(path.resolve(__dirname, '..', '..', 'api', 'node_modules', 'bcryptjs'));
    } catch (err2) {
      // rethrow original error to make failure visible
      throw err;
    }
  }
}

exports.seed = async function(knex) {
  const bcrypt = loadBcrypt();
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
