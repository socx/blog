const request = require('supertest');
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

describe('Meta fields exposure (unit)', () => {
  test('GET /api/v1/posts includes meta fields', async () => {
    const posts = [
      { id: 1, title: 'Public', slug: 'public-1', excerpt: 'x', published_at: new Date(), status: 'published', meta_title: 'MT', meta_description: 'MD', meta_image_url: 'http://img' },
      { id: 2, title: 'Draft', slug: 'draft-1', excerpt: 'y', published_at: null, status: 'draft' },
    ];
    const mockKnex = createMockKnex({ posts });
    const app = buildApp(mockKnex);
    const res = await request(app).get('/api/v1/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    const p = res.body.data[0];
    expect(p).toHaveProperty('meta_title', 'MT');
    expect(p).toHaveProperty('meta_description', 'MD');
    expect(p).toHaveProperty('meta_image_url', 'http://img');
  });

  test('GET /api/v1/posts/:slug includes meta fields', async () => {
    const posts = [
      { id: 1, title: 'Public', slug: 'public-1', excerpt: 'x', published_at: new Date(), status: 'published', meta_title: 'MT2', meta_description: 'MD2', meta_image_url: 'http://img2' },
    ];
    const mockKnex = createMockKnex({ posts });
    const app = buildApp(mockKnex);
    const res = await request(app).get('/api/v1/posts/public-1');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data).toHaveProperty('meta_title', 'MT2');
    expect(res.body.data).toHaveProperty('meta_description', 'MD2');
    expect(res.body.data).toHaveProperty('meta_image_url', 'http://img2');
  });
});
