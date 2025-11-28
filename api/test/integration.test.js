const request = require('supertest');
const { app, knex } = require('../index');

let token;
let createdId;

describe('API integration (auth + admin posts)', () => {
  jest.setTimeout(10000);

  test('login as seeded admin returns token and user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'changeme' })
      .expect(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user).toBeTruthy();
    token = res.body.token;
  });

  test('creating a post without slug returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/admin/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'No slug' })
      .expect(400);
    expect(res.body.errors).toBeInstanceOf(Array);
  });

  test('create / read / update / delete post lifecycle', async () => {
    // create
    const create = await request(app)
      .post('/api/v1/admin/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test post', slug: 'test-post-integration', excerpt: 'ex', content: 'body' })
      .expect(201);
    expect(create.body.data).toBeTruthy();
    createdId = create.body.data.id;

    // get
    const get = await request(app)
      .get(`/api/v1/admin/posts/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(get.body.data.id).toBe(createdId);

    // update
    const upd = await request(app)
      .put(`/api/v1/admin/posts/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated from test' })
      .expect(200);
    expect(upd.body.data.title).toBe('Updated from test');

    // delete
    await request(app)
      .delete(`/api/v1/admin/posts/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });
});

afterAll(async () => {
  // close knex connection to avoid open handles
  try {
    await knex.destroy();
  } catch (err) {
    // ignore
  }
});
