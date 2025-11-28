# GitHub issues: Top P0 stories & core technical tasks — FaithStories

Below are copy-paste-ready issue bodies for the top P0 user stories and core technical tasks. Paste each section into a new GitHub issue and set labels (example labels: P0, frontend, backend, infra, ux) as appropriate.

---

Issue: US-001 — Public: View article page (P0)

Description
- As a Casual Reader, I want to open an article page so I can read a story or article.

Acceptance criteria
- Given a public article slug, GET /posts/:slug returns article JSON with title, content, author, published date, featured image URL(s), categories, tags, and scripture references (if present).
- The public React app renders hero image, title, author, date, scripture references, and content matching design tokens.
- Images use responsive srcset and lazy loading; server-side meta tags (og:title, og:description, og:image) exist for SEO.

Tasks
- Backend: Implement GET /api/v1/posts/:slug (include metadata, optimized image URLs).
- Frontend: Article page component, responsive hero, metadata display, lazy image loading.

Labels: P0, frontend, backend, seo

---

Issue: US-002 — Public: Home / listing & featured (P0)

Description
- As a Casual Reader, I want to see featured and recent posts on the home page so I can discover content quickly.

Acceptance criteria
- API supports GET /posts?page=&limit=&featured=true for featured items.
- Home UI shows a featured carousel and paginated list of recent posts with excerpt and thumbnail.

Tasks
- Backend: Add featured flag and endpoint support; pagination.
- Frontend: Home page, featured carousel, list component with pagination.

Labels: P0, frontend, backend, ux

---

Issue: US-003 — Public: Category/Tag archive and filtering (P0)

Description
- As a Devout Researcher, I want to browse posts by category or tag so I can find related articles.

Acceptance criteria
- API: GET /categories and GET /categories/:slug/posts (or /posts?category=slug) supporting pagination & sorting.
- Archive page lists posts with metadata and links to article pages.

Tasks
- Backend: Category & tag endpoints, db relations and pagination.
- Frontend: Archive page UI and filter controls.

Labels: P0, frontend, backend

---

Issue: US-004 — Public: Search (basic) (P0)

Description
- As a Devout Researcher, I want to search titles/content/tags so I can locate articles quickly.

Acceptance criteria
- GET /search?q=term returns relevant results sorted by relevance/date with snippets.
- Search supports basic scripture reference matching if references stored in metadata.

Tasks
- Backend: Implement simple search using MySQL fulltext or simple LIKE fallback; index scripture references in metadata.
- Frontend: Search input, results page with snippets and pagination.

Labels: P0, backend, frontend

---

Issue: US-010 — Admin: Authentication (P0)

Description
- As an Author/Editor, I want to log in so I can access the admin area.

Acceptance criteria
- POST /auth/login accepts email/password; returns signed JWT (and refresh token if implemented).
- Admin routes are protected; unauthorized requests receive 401.

Tasks
- Backend: Auth endpoints, password hashing (bcrypt/argon2), JWT generation, refresh token strategy (optional).
- Frontend: Admin login page and token storage (localStorage or secure cookie).

Labels: P0, backend, security, frontend

---

Issue: US-011 — Admin: Create/Edit/Publish posts (P0)

Description
- As an Author, I want to compose and publish posts so the public can read them.

Acceptance criteria
- Admin UI enables creating post with title, slug, excerpt, content, featured image, categories, tags, optional scripture references.
- POST /admin/posts creates draft; PUT /admin/posts/:id updates; POST /admin/posts/:id/publish sets status published and sets published_at.
- Published posts become visible on public site.

Tasks
- Backend: CRUD endpoints for posts with status field, validation, slug uniqueness.
- Frontend: Post editor UI, preview, publish workflow.

Labels: P0, frontend, backend

---

Issue: US-012 — Admin: Drafts, scheduling, revisions (P0)

Description
- As an Editor, I want drafts, scheduling, and revision history so I can prepare content and revert changes when needed.

Acceptance criteria
- Drafts saved with status=draft and editable.
- Scheduling supports published_at in future; scheduled posts publish at the correct time via job/cron.
- Revisions are stored on save/publish; UI exposes history and revert action.

Tasks
- Backend: Revisions table, scheduling job (worker/cron), draft handling.
- Frontend: UI for scheduling and revision history view + revert.

Labels: P0, backend, frontend

---

Issue: US-013 — Admin: Media library & image handling (P0)

Description
- As an Author, I want to upload and select images for posts and set alt text so images display correctly on the public site.

Acceptance criteria
- POST /admin/media accepts multipart upload, validates size/type, stores in object storage, returns CDN URL and dimensions.
- Admin UI lists media and supports crop/focal point and alt text.

Tasks
- Backend: Media upload endpoint, integration with S3 or S3-compatible storage, generate responsive variants.
- Frontend: Media library UI, upload modal, image cropping/focal point.

Labels: P0, backend, frontend, infra

---

Issue: US-014 — Admin: Taxonomy management (categories & tags) (P0)

Description
- As an Editor, I want to create and manage categories/tags so content can be organized.

Acceptance criteria
- CRUD endpoints for categories and tags exist and are admin-protected.
- Deleting/renaming a category updates posts or provides a clear workflow to reassign.

Tasks
- Backend: Categories/tags CRUD endpoints, safe delete/merge behavior.
- Frontend: Taxonomy management UI.

Labels: P0, frontend, backend

---

Issue: US-020 — SEO metadata & Open Graph (P0)

Description
- As a site owner, I want pages to include SEO meta tags and Open Graph so shared links and search results look correct.

Acceptance criteria
- Server-side or meta-injection adds title, description, canonical, og:* tags per article and list page.
- Featured image used for og:image and twitter card.

Tasks
- Backend: Add meta generation per article, ensure SSR or prerendered meta for SEO crawlers.
- Frontend: Ensure head tags are correct for client-side routes (use react-helmet or SSR solution).

Labels: P0, seo, backend, frontend

---

Issue: TS-001 — DB schema & migrations (P0)

Description
- Create initial MySQL schema and migrations for users, posts, categories, tags, post_taxonomy, media, revisions, and settings.

Acceptance criteria
- Migrations run locally and in CI; seed script adds an admin user and sample content.

Tasks
- DB: Write migration files (e.g., using Knex, TypeORM, or Sequelize migrations).
- DevOps: Add seed script and local DB instructions to README.

Labels: P0, backend, infra

---

Issue: TS-002 — API skeleton & OpenAPI (P0)

Description
- Implement Express app skeleton with routing and basic error handling; add OpenAPI skeleton covering core endpoints.

Acceptance criteria
- Basic endpoints respond with stubbed data; OpenAPI file present and used to generate client stubs.

Tasks
- Backend: Express app, middleware (logging, error handling), OpenAPI YAML/JSON file skeleton.

Labels: P0, backend

---

Issue: TS-003 — CI (lint + test) (P0)

Description
- Add CI workflow that runs linter and unit tests on push/PR.

Acceptance criteria
- CI passes on main branch with minimal tests (auth + posts CRUD stubs).

Tasks
- Create GitHub Actions workflow to run lint and test; add test skeletons.

Labels: P0, ci

---

Issue: TS-004 — Local dev setup & README (P0)

Description
- Create README with local dev steps, environment variables, and scripts to run API and frontends.

Acceptance criteria
- Developer can run API and web apps locally following README.

Tasks
- Populate README with quickstart, env examples, seed commands, and basic troubleshooting.

Labels: P0, docs

---

Copy each section into a new GitHub issue. I can also create these programmatically if you want — say the repo (owner/repo) and provide a GitHub token with repo:issues scope and I will create them.
