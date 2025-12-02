const request = require('supertest');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { buildApp } = require('../../index');
const cleanup = require('../helpers/cleanup');

function createMockKnex(dataByTable = {}) {
  // Maintain table state across multiple knex() calls so insert() is visible to subsequent where()/first()
  const tables = {};
  Object.keys(dataByTable || {}).forEach(t => { tables[t] = (dataByTable[t] || []).slice(); });
  return function mockKnex(table) {
    if (!Object.prototype.hasOwnProperty.call(tables, table)) tables[table] = [];
    const baseRows = tables[table];
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

describe('Admin media upload (unit)', () => {
  test('POST /api/v1/admin/media stores file and inserts media row', async () => {
    // create a small temporary file to upload
    const tmpDir = path.resolve(__dirname, '..', 'tmp');
    try { fs.mkdirSync(tmpDir, { recursive: true }); } catch (e) { console.warn(e); }
    const tmpFile = path.join(tmpDir, 'unit-upload.txt');
    fs.writeFileSync(tmpFile, 'unit test upload');

    const mockKnex = createMockKnex({ media: [] });
    const app = buildApp(mockKnex);

    // sign an admin JWT using same fallback secret as the app
    const token = jwt.sign({ sub: 1, role: 'admin', email: 'unit@example.com' }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '1h' });

    // track paths for cleanup even if assertions fail
    const uploadsDir = process.env.UPLOADS_DIR ? path.resolve(process.env.UPLOADS_DIR) : path.resolve(__dirname, '..', '..', '..', 'uploads');
    let uploadedPath;
    try {
      const res = await request(app)
        .post('/api/v1/admin/media')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', tmpFile)
        .expect(201);

      expect(res.body).toBeDefined();
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBeGreaterThan(0);
      expect(res.body.data.url).toBeTruthy();

      const uploadedFilename = path.basename(res.body.data.url || '');
      uploadedPath = path.join(uploadsDir, uploadedFilename);
    } finally {
      // Cleanup uploaded and temporary files via shared helper
      try { cleanup.removeIfExists(uploadedPath); } catch (e) { console.warn(e); }
      try { cleanup.removeIfExists(tmpFile); } catch (e) { console.warn(e); }
    }
  });
});
