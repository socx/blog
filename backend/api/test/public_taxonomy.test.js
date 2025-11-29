const request = require('supertest');
const { buildApp, knex } = require('../index');

// Separate app instance using default knex
const app = buildApp(knex);

describe('Public taxonomy endpoints', () => {
  beforeAll(async () => {
    // Ensure clean tables and insert sample data
    await knex('post_categories').del();
    await knex('post_tags').del();
    await knex('categories').del();
    await knex('tags').del();
    await knex('categories').insert([
      { name: 'History', slug: 'history' },
      { name: 'Doctrine', slug: 'doctrine' }
    ]);
    await knex('tags').insert([
      { name: 'Grace', slug: 'grace' },
      { name: 'Faith', slug: 'faith' }
    ]);
  });

  afterAll(async () => {
    // cleanup inserted data
    await knex('post_categories').del();
    await knex('post_tags').del();
    await knex('categories').del();
    await knex('tags').del();
  });

  test('GET /api/v1/categories returns list', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('slug');
  });

  test('GET /api/v1/tags returns list', async () => {
    const res = await request(app).get('/api/v1/tags');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('slug');
  });
});
