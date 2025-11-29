const request = require('supertest');
const { app, knex } = require('../index');

describe('Posts validation and public endpoints', () => {
  jest.setTimeout(15000);
  let token;

  beforeAll(async () => {
    // login as seeded admin
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'changeme' })
      .expect(200);
    token = res.body.token;
  });

  test('slug validation rejects invalid slug', async () => {
    const res = await request(app)
      .post('/api/v1/admin/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Invalid slug', slug: 'Bad Slug!', excerpt: 'x' })
      .expect(400);
  // validation errors array present and mention slug (message should reference 'slug')
  expect(Array.isArray(res.body.errors)).toBe(true);
  const slugErr = res.body.errors.find(e => typeof e.msg === 'string' && /slug/i.test(e.msg));
  expect(slugErr).toBeTruthy();
  });

  test('duplicate slug returns 409', async () => {
    const slug = `dup-slug-${Date.now()}`;
    const create1 = await request(app)
      .post('/api/v1/admin/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'First', slug, excerpt: 'x', content: 'a' })
      .expect(201);
    expect(create1.body.data).toBeTruthy();

    // attempt duplicate
    await request(app)
      .post('/api/v1/admin/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Second', slug, excerpt: 'x', content: 'b' })
      .expect(409);

    // cleanup
    await request(app)
      .delete(`/api/v1/admin/posts/${create1.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

  test('published posts appear on public list and single endpoint', async () => {
    const slug = `public-${Date.now()}`;
    const create = await request(app)
      .post('/api/v1/admin/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Public', slug, excerpt: 'x', content: 'body', status: 'published', published_at: new Date().toISOString() })
      .expect(201);
    const id = create.body.data.id;

    // public list should include the published post (may include others)
    const list = await request(app).get('/api/v1/posts').expect(200);
    expect(Array.isArray(list.body.data)).toBe(true);
    const found = list.body.data.find(p => p.slug === slug);
    expect(found).toBeTruthy();

    // single post by slug
    const single = await request(app).get(`/api/v1/posts/${slug}`).expect(200);
    expect(single.body.data.id).toBe(id);

    // cleanup
    await request(app)
      .delete(`/api/v1/admin/posts/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

  test('draft post is not visible publicly', async () => {
    const slug = `draft-${Date.now()}`;
    const create = await request(app)
      .post('/api/v1/admin/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Draft', slug, excerpt: 'x', content: 'body', status: 'draft' })
      .expect(201);
    const id = create.body.data.id;

    await request(app).get(`/api/v1/posts/${slug}`).expect(404);

    // cleanup
    await request(app)
      .delete(`/api/v1/admin/posts/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

});

afterAll(async () => {
  try {
    await knex.destroy();
  } catch (err) {
    // ignore
  }
});
