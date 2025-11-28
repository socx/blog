require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const knexConfig = require('../db/knexfile');
const Knex = require('knex');

const env = process.env.NODE_ENV || 'development';
// fall back to development config if the environment key isn't present
const knexConfigForEnv = knexConfig[env] || knexConfig.development;
const knex = Knex(knexConfigForEnv);

const app = express();
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '2mb' }));
const { body, validationResult } = require('express-validator');

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Public endpoints (stub)
app.get('/api/v1/posts', async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = Math.min(parseInt(req.query.limit || '12', 10), 100);
  const offset = (page - 1) * limit;
  const posts = await knex('posts').select('id','title','slug','excerpt','published_at').where('status','published').orderBy('published_at','desc').limit(limit).offset(offset);
  res.json({ data: posts, meta: { page, limit } });
});

app.get('/api/v1/posts/:slug', async (req, res) => {
  const { slug } = req.params;
  const post = await knex('posts').where({ slug, status: 'published' }).first();
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json({ data: post });
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

// --- JWT auth middleware ---
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
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { title, slug, excerpt, content, status, published_at, featured_media_id } = req.body;
    const now = new Date();
    try {
      const [id] = await knex('posts').insert({
        author_id: req.user.id,
        title,
        slug,
        excerpt: excerpt || null,
        content: content || null,
        featured_media_id: featured_media_id || null,
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
  ];
  // run validations
  for (const v of validations) {
    await v.run(req);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const allowed = ['title', 'slug', 'excerpt', 'content', 'status', 'published_at', 'featured_media_id'];
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

const port = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(port, () => console.log(`API server listening on http://localhost:${port}`));
}

// export app and knex for testing
module.exports = { app, knex };
