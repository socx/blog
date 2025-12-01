// Load env from both repo root and backend/api to avoid cwd issues
const path = require('path');
const fs = require('fs');
const rootEnvPath = path.resolve(__dirname, '..', '..', '.env');
const apiEnvPath = path.join(__dirname, '.env');
const loadedEnvPaths = [];
if (fs.existsSync(rootEnvPath)) {
  require('dotenv').config({ path: rootEnvPath });
  loadedEnvPaths.push(rootEnvPath);
}
if (fs.existsSync(apiEnvPath)) {
  require('dotenv').config({ path: apiEnvPath });
  loadedEnvPaths.push(apiEnvPath);
}
// Diagnostic log: which .env files were loaded and which expected keys are present
try {
  const expectedKeys = ['JWT_SECRET', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME', 'DB_PORT', 'NODE_ENV'];
  const present = expectedKeys.filter((k) => process.env[k] && String(process.env[k]).trim() !== '');
  const missing = expectedKeys.filter((k) => !present.includes(k));
  console.log('[env] loaded paths:', loadedEnvPaths);
  console.log('[env] present keys:', present);
  if (missing.length) console.log('[env] missing keys:', missing);
} catch (_) {
  // ignore logging errors
}

// Fail-fast environment validation
function requireEnvVars(vars) {
  console.log({processEnv: process.env.NODE_ENV});
  const missing = vars.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');
  if (missing.length) {
    const msg = `Missing required environment variables: ${missing.join(', ')}\n` +
      'Create a .env file (see repo root .env.example) or export them in your shell.\n' +
      'Example minimal setup:\n' +
      '  JWT_SECRET=change-me\n' +
      '  DB_HOST=127.0.0.1\n  DB_PORT=3306\n  DB_USER=faithstories\n  DB_PASS=faithpass\n  DB_NAME=faithstories_dev\n';
    console.error(msg);
    process.exit(1);
  }
}

// Required for boot; skip strict check in NODE_ENV=test (tests manage env separately)
if ((process.env.NODE_ENV || 'development') !== 'test') {
  requireEnvVars(['JWT_SECRET', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME']);
}
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const knexConfig = require('../db/knexfile');
const Knex = require('knex');
const { body, validationResult } = require('express-validator');



const env = process.env.NODE_ENV || 'development';
// fall back to development config if the environment key isn't present
const knexConfigForEnv = knexConfig[env] || knexConfig.development;
const defaultKnex = Knex(knexConfigForEnv);

function buildApp(knex) {
  const app = express();
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  // Health
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Public endpoints (stub)
  // Public taxonomy lists (no auth)
  app.get('/api/v1/categories', async (req, res) => {
    const rows = await knex('categories').select('id','name','slug').orderBy('name');
    res.json({ data: rows });
  });
  app.get('/api/v1/tags', async (req, res) => {
    const rows = await knex('tags').select('id','name','slug').orderBy('name');
    res.json({ data: rows });
  });
  app.get('/api/v1/posts', async (req, res) => {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '12', 10), 100);
    const offset = (page - 1) * limit;
    const { category, tag } = req.query; // slug values
    const q = knex('posts').where('status','published');
    // Maintain legacy column names for unit tests when no filters applied
    let aliasing = false;
    if (String(req.query.featured).toLowerCase() === 'true') {
      q.andWhere('featured', true);
    }
    if (category) {
      aliasing = true;
      q.join('post_categories','post_categories.post_id','posts.id')
        .join('categories','categories.id','post_categories.category_id')
        .andWhere('categories.slug', String(category));
    }
    if (tag) {
      aliasing = true;
      q.join('post_tags','post_tags.post_id','posts.id')
        .join('tags','tags.id','post_tags.tag_id')
        .andWhere('tags.slug', String(tag));
    }
    if (aliasing) {
      q.select(
        'posts.id as id',
        'posts.title as title',
        'posts.slug as slug',
        'posts.excerpt as excerpt',
        'posts.published_at as published_at',
        'posts.featured as featured'
      ).orderBy('posts.published_at','desc');
    } else {
      q.select('id','title','slug','excerpt','published_at','featured').orderBy('published_at','desc');
    }
    const posts = await q.limit(limit).offset(offset);
    res.json({ data: posts, meta: { page, limit } });
  });

  app.get('/api/v1/posts/:slug', async (req, res) => {
    const { slug } = req.params;
    const post = await knex('posts').where({ slug, status: 'published' }).first();
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json({ data: post });
  });

  // Featured posts endpoint (public): returns top N featured published posts
  app.get('/api/v1/featured', async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit || '6', 10), 50);
    const rows = await knex('posts')
      .where({ status: 'published' })
      .andWhere('featured', true)
      .select('id','title','slug','excerpt','published_at','featured')
      .orderBy('published_at', 'desc')
      .limit(limit);
    res.json({ data: rows, meta: { limit } });
  });

  // Sitemap XML for published posts
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const siteBase = (process.env.SITE_BASE_URL || process.env.VITE_API_BASE || 'http://localhost:4000').replace(/\/$/, '');
      const rows = await knex('posts')
        .where({ status: 'published' })
        .select('slug', 'published_at', 'updated_at')
        .orderBy('published_at', 'desc')
        .limit(50000);

      const urlset = rows.map(r => {
        const loc = `${siteBase}/posts/${encodeURIComponent(r.slug)}`;
        const last = (r.published_at || r.updated_at) ? new Date(r.published_at || r.updated_at).toISOString() : null;
        return `  <url>\n    <loc>${loc}</loc>${last ? `\n    <lastmod>${last}</lastmod>` : ''}\n  </url>`;
      }).join('\n');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        `${urlset}\n</urlset>`;

      res.header('Content-Type', 'application/xml');
      return res.send(xml);
    } catch (err) {
      console.error('Failed to generate sitemap:', err && err.message ? err.message : err);
      return res.status(500).send('Failed to generate sitemap');
    }
  });

// Auth stub for admin (login)
  app.post('/api/v1/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await knex('users').where({ email }).first();
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const bcrypt = require('bcryptjs');
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '8h' });
    // return token and a small user profile for client
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  // continue with auth middleware and admin routes
  function authenticateJWT(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    const token = auth.split(' ')[1];
    const jwt = require('jsonwebtoken');
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
      // attach minimal user info
      req.user = { id: payload.sub, role: payload.role, email: payload.email };
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  function requireAdmin(req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Insufficient permissions' });
    return next();
  }

  // --- Admin CRUD endpoints for posts ---
  const adminRouter = express.Router();

  // Create post
  adminRouter.post(
    '/posts',
    [
      body('title').isString().trim().isLength({ min: 3 }).withMessage('title must be at least 3 characters'),
      body('slug')
        .isString()
        .trim()
      .matches(/^[a-z0-9-]+$/)
        .withMessage('slug must be lowercase letters, numbers or hyphens'),
      body('excerpt').optional({ nullable: true }).isString(),
      body('content').optional({ nullable: true }).isString(),
      body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('invalid status'),
      body('published_at').optional({ nullable: true }).isISO8601().toDate(),
      body('featured_media_id').optional({ nullable: true }).isInt().toInt(),
  body('featured').optional().isBoolean().toBoolean(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { title, slug, excerpt, content, status, published_at, featured_media_id, featured } = req.body;
      const now = new Date();
      try {
        const [id] = await knex('posts').insert({
          author_id: req.user.id,
          title,
          slug,
          excerpt: excerpt || null,
          content: content || null,
          featured_media_id: featured_media_id || null,
          featured: typeof featured !== 'undefined' ? !!featured : false,
          status: status || 'draft',
          published_at: published_at ? new Date(published_at) : null,
          created_at: now,
          updated_at: now,
        });
        const post = await knex('posts').where({ id }).first();
        res.status(201).json({ data: post });
      } catch (err) {
        console.error(err);
        if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'slug already exists' });
        res.status(500).json({ error: 'Failed to create post' });
      }
    }
  );

  // List posts (admin view)
  adminRouter.get('/posts', async (req, res) => {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 200);
    const offset = (page - 1) * limit;
    const rows = await knex('posts').select('*').orderBy('created_at', 'desc').limit(limit).offset(offset);
    res.json({ data: rows, meta: { page, limit } });
  });

  // Get post by id
  adminRouter.get('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const post = await knex('posts').where({ id }).first();
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json({ data: post });
  });

  // Update post
  adminRouter.put('/posts/:id', async (req, res) => {
    const { id } = req.params;
    await Promise.resolve();
    const validations = [
      body('title').optional().isString().trim().isLength({ min: 3 }).withMessage('title must be at least 3 characters'),
      body('slug')
        .optional()
        .isString()
        .trim()
      .matches(/^[a-z0-9-]+$/)
        .withMessage('slug must be lowercase letters, numbers or hyphens'),
      body('excerpt').optional({ nullable: true }).isString(),
      body('content').optional({ nullable: true }).isString(),
      body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('invalid status'),
      body('published_at').optional({ nullable: true }).isISO8601().toDate(),
      body('featured_media_id').optional({ nullable: true }).isInt().toInt(),
      body('featured').optional().isBoolean().toBoolean(),
    ];
    // run validations
    for (const v of validations) {
      await v.run(req);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const allowed = ['title', 'slug', 'excerpt', 'content', 'status', 'published_at', 'featured_media_id', 'featured'];
    const updates = {};
    for (const k of allowed) if (Object.prototype.hasOwnProperty.call(req.body, k)) updates[k] = req.body[k];
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updatable fields provided' });
    updates.updated_at = new Date();
    if (Object.prototype.hasOwnProperty.call(updates, 'published_at')) {
      if (updates.published_at === null) {
        updates.published_at = null;
      } else if (updates.published_at) {
        updates.published_at = new Date(updates.published_at);
      }
    }
    try {
      const count = await knex('posts').where({ id }).update(updates);
      if (!count) return res.status(404).json({ error: 'Not found' });
      const post = await knex('posts').where({ id }).first();
      res.json({ data: post });
    } catch (err) {
      console.error(err);
      if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'slug already exists' });
      res.status(500).json({ error: 'Failed to update post' });
    }
  });

  // Publish a post: sets status='published' and published_at=now
  adminRouter.post('/posts/:id/publish', async (req, res) => {
    const { id } = req.params;
    const now = new Date();
    try {
      const count = await knex('posts').where({ id }).update({
        status: 'published',
        published_at: now,
        updated_at: now,
      });
      if (!count) return res.status(404).json({ error: 'Not found' });
      const post = await knex('posts').where({ id }).first();
      res.json({ data: post });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to publish post' });
    }
  });

  // Unpublish a post: sets status='draft' and clears published_at
  adminRouter.post('/posts/:id/unpublish', async (req, res) => {
    const { id } = req.params;
    const now = new Date();
    try {
      const count = await knex('posts').where({ id }).update({
        status: 'draft',
        published_at: null,
        updated_at: now,
      });
      if (!count) return res.status(404).json({ error: 'Not found' });
      const post = await knex('posts').where({ id }).first();
      res.json({ data: post });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to unpublish post' });
    }
  });

  // Delete post
  adminRouter.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const count = await knex('posts').where({ id }).del();
      if (!count) return res.status(404).json({ error: 'Not found' });
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  });

  // mount admin router with auth
  app.use('/api/v1/admin', authenticateJWT, requireAdmin, adminRouter);

  // --- Taxonomy Routers (admin) ---
  const taxonomyRouter = express.Router();

  // Categories CRUD
  taxonomyRouter.get('/categories', async (req, res) => {
    const rows = await knex('categories').select('*').orderBy('name');
    res.json({ data: rows });
  });
  taxonomyRouter.post('/categories', [
    body('name').isString().trim().isLength({ min: 2 }),
    body('slug').isString().trim().matches(/^[a-z0-9-]+$/)
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, slug } = req.body;
    try {
      const [id] = await knex('categories').insert({ name, slug });
      const row = await knex('categories').where({ id }).first();
      res.status(201).json({ data: row });
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'slug already exists' });
      console.error(err); return res.status(500).json({ error: 'Failed to create category' });
    }
  });
  taxonomyRouter.put('/categories/:id', async (req, res) => {
    const { id } = req.params;
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.slug) updates.slug = req.body.slug;
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No updatable fields provided' });
    try {
      const count = await knex('categories').where({ id }).update(updates);
      if (!count) return res.status(404).json({ error: 'Not found' });
      const row = await knex('categories').where({ id }).first();
      res.json({ data: row });
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'slug already exists' });
      console.error(err); return res.status(500).json({ error: 'Failed to update category' });
    }
  });
  taxonomyRouter.delete('/categories/:id', async (req, res) => {
    const { id } = req.params;
    const count = await knex('categories').where({ id }).del();
    if (!count) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  });

  // Tags CRUD
  taxonomyRouter.get('/tags', async (req, res) => {
    const rows = await knex('tags').select('*').orderBy('name');
    res.json({ data: rows });
  });
  taxonomyRouter.post('/tags', [
    body('name').isString().trim().isLength({ min: 2 }),
    body('slug').isString().trim().matches(/^[a-z0-9-]+$/)
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, slug } = req.body;
    try {
      const [id] = await knex('tags').insert({ name, slug });
      const row = await knex('tags').where({ id }).first();
      res.status(201).json({ data: row });
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'slug already exists' });
      console.error(err); return res.status(500).json({ error: 'Failed to create tag' });
    }
  });
  taxonomyRouter.put('/tags/:id', async (req, res) => {
    const { id } = req.params;
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.slug) updates.slug = req.body.slug;
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No updatable fields provided' });
    try {
      const count = await knex('tags').where({ id }).update(updates);
      if (!count) return res.status(404).json({ error: 'Not found' });
      const row = await knex('tags').where({ id }).first();
      res.json({ data: row });
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'slug already exists' });
      console.error(err); return res.status(500).json({ error: 'Failed to update tag' });
    }
  });
  taxonomyRouter.delete('/tags/:id', async (req, res) => {
    const { id } = req.params;
    const count = await knex('tags').where({ id }).del();
    if (!count) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  });

  // Attach categories/tags to post (replace sets)
  taxonomyRouter.post('/posts/:id/categories', async (req, res) => {
    const { id } = req.params;
    const list = Array.isArray(req.body.categories) ? req.body.categories : [];
    const exists = await knex('posts').where({ id }).first();
    if (!exists) return res.status(404).json({ error: 'Post not found' });
    await knex.transaction(async (trx) => {
      await trx('post_categories').where({ post_id: id }).del();
      for (const catId of list) {
        await trx('post_categories').insert({ post_id: id, category_id: catId });
      }
    });
    const rows = await knex('post_categories').join('categories','categories.id','post_categories.category_id').select('categories.id','categories.name','categories.slug').where('post_categories.post_id', id);
    res.json({ data: rows });
  });
  taxonomyRouter.post('/posts/:id/tags', async (req, res) => {
    const { id } = req.params;
    const list = Array.isArray(req.body.tags) ? req.body.tags : [];
    const exists = await knex('posts').where({ id }).first();
    if (!exists) return res.status(404).json({ error: 'Post not found' });
    await knex.transaction(async (trx) => {
      await trx('post_tags').where({ post_id: id }).del();
      for (const tagId of list) {
        await trx('post_tags').insert({ post_id: id, tag_id: tagId });
      }
    });
    const rows = await knex('post_tags').join('tags','tags.id','post_tags.tag_id').select('tags.id','tags.name','tags.slug').where('post_tags.post_id', id);
    res.json({ data: rows });
  });

  app.use('/api/v1/admin', authenticateJWT, requireAdmin, taxonomyRouter);

  return app;
}

// create default app instance using defaultKnex
const app = buildApp(defaultKnex);

const port = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(port, () => console.log(`API server listening on http://localhost:${port}`));
}

// export helpers for tests
module.exports = { buildApp, knex: defaultKnex, defaultKnex, app };
