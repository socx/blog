const request = require('supertest');
const { app } = require('../index');

describe('Admin posts scheduled filter', () => {
  jest.setTimeout(15000);
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'changeme' })
      .expect(200);
    token = res.body.token;
  });

  test('GET /api/v1/admin/posts?scheduled=true returns only future scheduled posts', async () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const createFuture = await request(app)
      .post('/api/v1/admin/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Future Post', slug: `future-${Date.now()}`, excerpt: 'x', content: 'x', status: 'published', published_at: future })
      .expect(201);
    const idFuture = createFuture.body.data.id;

    const createNow = await request(app)
      .post('/api/v1/admin/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Now Post', slug: `now-${Date.now()}`, excerpt: 'x', content: 'x', status: 'published', published_at: now })
      .expect(201);
    const idNow = createNow.body.data.id;

    const resScheduled = await request(app)
      .get('/api/v1/admin/posts?scheduled=true')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(resScheduled.body.data)).toBe(true);
    const slugs = resScheduled.body.data.map(p => p.slug);
    expect(slugs).toContain(createFuture.body.data.slug);
    expect(slugs).not.toContain(createNow.body.data.slug);

    // Ensure unfiltered admin list still contains both
    const resAll = await request(app)
      .get('/api/v1/admin/posts')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const allSlugs = resAll.body.data.map(p => p.slug);
    expect(allSlugs).toContain(createFuture.body.data.slug);
    expect(allSlugs).toContain(createNow.body.data.slug);

    // cleanup
    await request(app).delete(`/api/v1/admin/posts/${idFuture}`).set('Authorization', `Bearer ${token}`).expect(204);
    await request(app).delete(`/api/v1/admin/posts/${idNow}`).set('Authorization', `Bearer ${token}`).expect(204);
  });
});
