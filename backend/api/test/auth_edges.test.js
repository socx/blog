const request = require('supertest');
const { app, knex } = require('../index');
const bcrypt = require('bcryptjs');

describe('Auth edge cases', () => {
  jest.setTimeout(10000);

  test('login fails with wrong password', async () => {
    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'wrong-password' })
      .expect(401);
  });

  test('admin endpoints require auth header', async () => {
    await request(app)
      .post('/api/v1/admin/posts')
      .send({ title: 'No auth' })
      .expect(401);
  });

  test('non-admin user cannot access admin endpoints', async () => {
    // create a regular user in the test DB
    const password = 'regular-pass';
    const hash = await bcrypt.hash(password, 10);
    const [id] = await knex('users').insert({
      name: 'Regular',
      email: 'user-integration@example.com',
      password_hash: hash,
      role: 'user',
      created_at: new Date()
    });

    // login as that user
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user-integration@example.com', password })
      .expect(200);
    const token = res.body.token;

    // attempt to access admin endpoint
    await request(app)
      .get('/api/v1/admin/posts')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});

afterAll(async () => {
  try {
    await knex.destroy();
  } catch (err) {
    // ignore
  }
});
