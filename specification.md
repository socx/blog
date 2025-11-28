# FaithStories - Headless CMS Blogging Platform (High-level Specification)

Date: 28 November 2025

This document is a concise, actionable high-level specification for a headless CMS-based blogging platform that reproduces the look-and-feel of the referenced Lemon Limes theme (preview link). It targets a microservice architecture with a Node.js/Express API connected to MySQL and two React frontends (public site and admin). The goal is to deliver an MVP that allows publishing Christian fiction stories, scripture-based articles, church history, essays and related content, with a secure admin experience for content creators.

## 1. Project overview

- Purpose: Build a modern, performant, SEO-friendly blog/CMS focused on Christian content — fiction, scripture-based articles, church history and essays — with a visually rich public site and a simple, secure admin area for content authors and editors.
- Primary tech stack:
  - Backend: Node.js + Express microservice (REST API)
  - Database: MySQL
  - Frontend: React with Tailwind CSS (two apps: Public and Admin)
  - Auth: JWT-based authentication for admin; optionally session cookies for UI convenience
  - Infrastructure: CDN for assets, object storage for media (S3 or S3-compatible), optional image CDN (imgix/Cloudinary)

## 2. Goals and success criteria

- Deliver an MVP within the agreed sprint cycle that supports publishing, editing, and viewing posts with design parity to the referenced theme.
- Provide a pleasant authoring experience (WYSIWYG or rich Markdown + preview), media management, and scheduling.
- Meet basic non-functional goals: page-load Time to Interactive (TTI) < 2.5s on 3G simulated mobile, Lighthouse Performance score >= 70 (initial target), SEO-friendly pages (meta tags, structured data where applicable for articles/stories), and WCAG AA baseline accessibility.
- Business success metrics for MVP:
  - Functionality: Create / Edit / Publish / Delete posts, upload media, manage categories/tags, and authenticate as admin.
  - Reliability: 99.5% uptime for the public site in staging/initial production window.
  - Performance: Median First Contentful Paint (FCP) < 2s on 4G.
  - Engagement: average session duration and bounce rate tracked via analytics (define baselines after launch).

## 3. Target users / personas (high-level)

 - Casual Reader: Visits the public site to read fiction, devotionals, and articles; expects fast pages, clear imagery, searchable content, and author/scripture metadata.
 - Devout Reader / Researcher: Uses category/tag filters and search to find scripture-based articles, historical pieces, and essays; expects clear references, citations, print-friendly views, and tidy metadata for scripture passages.
 - Author / Editor (Admin): Writes and schedules stories and articles, uploads and crops images, manages categories/tags, previews content, and moderates comments.

## 4. Core features (Epic-level)

- Public-facing site
  - Home / Featured posts carousel
  - Content listing (latest, by category/tag)
  - Article page with large hero image, article metadata (scripture references, reading time), related posts, author box, social share buttons
  - Search (title/content/tags) and tag/category archive pages
  - Responsive design and image optimization (srcset, lazy loading)

- Admin site
  - Authentication (login, password reset) and role-based access (author, editor, admin)
  - Post editor (title, slug, excerpt, content, blocks or rich Markdown, article/story meta fields such as scripture references), draft & scheduled publishing, revision history
  - Media library with upload, basic image crop/resize, and attached metadata
  - Category & Tag management
  - Basic comment moderation (optional integration with third-party comment service)

- Platform & infrastructure
  - REST API with pagination, filtering, and authentication
  - MySQL data model with normalized tables for posts, users, media, categories, tags, comments, and revisions
  - CDN-backed static assets + image processing pipeline

## 5. Minimum Viable Product (MVP) scope

Focus on the smallest set of features that enable publishing and consuming content with the desired look.

MVP includes:
- Public site
  - Home, article, category archive, tag archive, search, responsive layout, article metadata (scripture references where applicable)
  - Static SEO essentials (title, description, open graph, JSON-LD for articles/stories where applicable)

- Admin site
  - Login/logout (JWT), create/edit/publish posts, upload images, manage categories and tags, preview drafts

- API & Data
  - CRUD endpoints for posts, media, categories, tags, users (admin only)
  - MySQL schema and migrations

- DevOps
  - Local development scripts, simple CI pipeline (lint + tests), staging deployment, basic monitoring (error logging)

Out of scope for MVP (phase 2 candidates): comments system, multi-language support, advanced SEO features, full WYSIWYG block editor, A/B testing, advanced analytics integrations, and paid subscriptions.

## 6. High-level API contract (summary)

The backend exposes JSON REST endpoints secured by JWT for admin routes. Public fetching endpoints are read-only and cacheable.

Examples (summary):

- Public
  - GET /api/v1/posts?page=1&limit=12&tag=summer
  - GET /api/v1/posts/:slug
  - GET /api/v1/categories

- Admin (auth required)
  - POST /api/v1/auth/login -> { token }
  - POST /api/v1/posts -> create
  - PUT /api/v1/posts/:id -> update
  - POST /api/v1/media -> upload image

Detailed OpenAPI contract will be produced in the API contract sprint.

## 7. Data model (high-level)

Core tables:
- users (id, name, email, password_hash, role, created_at, updated_at)
- posts (id, author_id, title, slug, excerpt, content, featured_media_id, status[draft|published|scheduled], published_at, created_at, updated_at)
- categories (id, name, slug)
- tags (id, name, slug)
- post_categories (post_id, category_id)
- post_tags (post_id, tag_id)
- media (id, url, mime_type, width, height, alt_text, uploaded_by, created_at)
- revisions (id, post_id, data_json, author_id, created_at)

Normalization and indexes for full-text search on title/content will be considered; a small search index (MySQL fulltext or ElasticSearch in later phases) is acceptable.

## 8. Security & privacy (MVP highlights)

- Admin auth: strong password storage (bcrypt/argon2), JWT signed tokens with reasonable expiry, refresh token strategy for long-lived sessions if needed.
- Input validation & sanitization on server-side; HTML sanitization for WYSIWYG content (allow limited tags/attributes).
- CSRF protection on admin UI if cookies are used; otherwise rely on Authorization headers for JWT.
- Rate limiting on auth and write endpoints; basic logging and monitoring for suspicious activity.
- GDPR/privacy: collect minimal personal data, provide privacy policy as text assets; support deleting a user (and anonymizing posts if required) in later phases.

## 9. Non-functional requirements (brief)

- Performance: scale to hundreds of concurrent readers in a single instance; use CDN for media and caching for API responses where safe.
- Availability: initial SLA target 99.5% for public site.
- Accessibility: WCAG AA baseline for primary pathways (navigation, article reading, form controls in admin).
- Observability: structured logs and error reporting (Sentry or similar), basic metrics (request latency, error rate).

## 10. Acceptance criteria for MVP

- Public site renders article and story pages with hero image, scripture/article metadata, and content exactly matching the design tokens and layouts in provided mockups.
- Admin user can log in and create a post with title, content, featured image, categories, tags, save as draft, and publish; published posts appear on the public site.
- Media uploaded through the admin is stored and retrievable; images are served optimized (responsive srcset and lazy loading).
- API implements endpoints documented in the API contract summary above and passes basic integration tests (CRUD flows).

## 11. Assumptions & constraints

- The team will provide final visual assets (logo, fonts) or will use open-source equivalents.
- Hosting target will support Node.js and MySQL (e.g., DigitalOcean, Render, Railway, or AWS). We assume access to an S3-compatible object storage or Cloudinary for image hosting.
- The initial scope focuses on English language only.

## 12. Rough roadmap & next steps (first three sprints)

- Sprint 0 (setup, 1 week)
  - Project scaffolding (monorepo or two apps + api), CI basic pipeline, database migrations setup, initial README
  - Dev environment docs and seeds

- Sprint 1 (MVP backend + basic public site, 2 weeks)
  - MySQL schema and migrations, API endpoints for posts/categories/tags, public listing and article endpoints
  - Basic public React app scaffolding and article page layout

- Sprint 2 (Admin and media, 2 weeks)
  - Admin auth, post editor, media upload, category/tag management, publish flow and preview
  - Integrate image storage and CDN configuration

After Sprint 2 we'd have a working MVP ready for content seeding and user testing.

## 13. Risks & mitigation (top 3)

1. Scope creep (many theme features are optional) — Mitigation: lock MVP scope; move extras to phase 2 backlog.
2. Image performance and storage complexity — Mitigation: use a managed image CDN (Cloudinary) or S3 + image CDN; enforce size limits and automated resizing.
3. Editor UX complexity (block editor vs markdown) — Mitigation: start with a simple rich Markdown editor + preview; evaluate rich block editors later.

## 14. Deliverables from this phase

- This `specification.md` (high-level spec)
- Sprint-ready backlog (user stories & acceptance criteria)
- OpenAPI skeleton (to be produced in next sprint)
- Initial repo scaffolding (to be created during Sprint 0)

## 15. Questions / decisions required

1. Preferred hosting provider and whether a managed DB / object storage will be used (affects infra setup and cost).
2. Editor preference: rich Markdown (lighter) vs full block/WYSIWYG editor (heavier). I recommend starting with Markdown + light formatting and a preview component.
3. Do we require comments in MVP or can that be deferred?

---

If this matches your expectations I will: (a) commit this file to the repo, (b) produce the persona & user journey document next, and (c) scaffold the project layout with initial package manifests and README. Tell me which of the three you prefer to do next or if you want any changes to this spec.
