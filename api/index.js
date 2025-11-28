require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const knexConfig = require('../knexfile');
const Knex = require('knex');

const env = process.env.NODE_ENV || 'development';
const knex = Knex(knexConfig[env]);

const app = express();
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '2mb' }));

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
  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '8h' });
  res.json({ token });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API server listening on http://localhost:${port}`));
