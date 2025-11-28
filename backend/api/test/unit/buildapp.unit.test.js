const request = require('supertest');
const bcrypt = require('bcryptjs');
const { buildApp } = require('../../index');

function createMockKnex(dataByTable = {}) {
  return function mockKnex(table) {
    const baseRows = (dataByTable[table] || []).slice();
    const qb = {
      _rows: baseRows,
      select() { return this; },
      orderBy() { return this; },
      limit() { return this; },
      offset() { return Promise.resolve(this._rows); },
      where(arg1, arg2) {
        if (typeof arg1 === 'object') {
          this._rows = baseRows.filter(r => Object.entries(arg1).every(([k, v]) => r[k] === v));
        } else {
          this._rows = baseRows.filter(r => r[arg1] === arg2);
        }
        return this;
      },
      first() { return Promise.resolve(this._rows[0]); },
      insert(obj) {
        const newRow = Object.assign({}, obj, { id: baseRows.length + 1 });
        baseRows.push(newRow);
        return Promise.resolve([newRow.id]);
      },
      update() { return Promise.resolve(1); },
      del() { return Promise.resolve(1); },
    };
    return qb;
  };
}

describe('buildApp unit tests (mocked DB)', () => {
  test('GET /api/health', async () => {
    const app = buildApp(createMockKnex());
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('GET /api/v1/posts returns published posts only', async () => {
    const posts = [
      { id: 1, title: 'Public', slug: 'public-1', excerpt: 'x', published_at: new Date(), status: 'published' },
      { id: 2, title: 'Draft', slug: 'draft-1', excerpt: 'y', published_at: null, status: 'draft' },
    ];
    const mockKnex = createMockKnex({ posts });
    const app = buildApp(mockKnex);
    const res = await request(app).get('/api/v1/posts');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    // only one published post should be returned
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].slug).toBe('public-1');
    expect(res.body.meta).toHaveProperty('page');
  });

  test('GET /api/v1/posts/:slug returns single published post', async () => {
    const posts = [
      { id: 1, title: 'Public', slug: 'public-1', excerpt: 'x', published_at: new Date(), status: 'published' },
    ];
    const mockKnex = createMockKnex({ posts });
    const app = buildApp(mockKnex);
    const res = await request(app).get('/api/v1/posts/public-1');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.slug).toBe('public-1');
  });

  test('POST /api/v1/auth/login with valid credentials returns token', async () => {
    const password = 'unit-pass';
    const hash = await bcrypt.hash(password, 10);
    const users = [
      { id: 42, name: 'Unit', email: 'unit@example.com', password_hash: hash, role: 'admin' },
    ];
    const mockKnex = createMockKnex({ users });
    const app = buildApp(mockKnex);
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'unit@example.com', password });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('unit@example.com');
  });
});
