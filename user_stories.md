# Prioritized User Stories & Acceptance Criteria — FaithStories

Date: 28 November 2025

This file converts the previously-defined personas and journeys into a prioritized backlog of user stories for the MVP and a few near-term technical stories. Each story has acceptance criteria and suggested priority.

Legend: Priority: P0 = must-have for MVP; P1 = important for MVP or early post-MVP; P2 = nice-to-have later.

## Epic: Public content consumption (P0)

US-001 — Public: View article page (P0)
- As a Casual Reader, I want to open an article page so I can read a story or article.
- Acceptance criteria:
  - Given a public article slug, when I request /posts/:slug, then the server returns article JSON with title, content (HTML or markdown render), author, published date, featured image URL(s), categories, tags, and scripture references (if present).
  - The public React app renders hero image, title, author, date, scripture references, and content matching design tokens.
  - Images use responsive srcset and lazy loading; meta tags (og:title, og:description, og:image) are present server-side for SEO.

US-002 — Public: Home / listing & featured (P0)
- As a Casual Reader, I want to see featured and recent posts on the home page so I can discover content quickly.
- Acceptance criteria:
  - GET /posts?page=&limit=&featured=true returns featured items.
  - Home UI shows a featured carousel and a paginated list of recent posts with excerpt and thumbnail.

US-003 — Public: Category/Tag archive and filtering (P0)
- As a Devout Researcher, I want to browse posts by category or tag so I can find related articles.
- Acceptance criteria:
  - GET /categories and GET /categories/:slug/posts (or /posts?category=slug) support pagination and sorting.
  - Archive page lists posts with metadata and links to article pages.

US-004 — Public: Search (basic) (P0)
- As a Devout Researcher, I want to search titles/content/tags so I can locate articles (including scripture references) quickly.
- Acceptance criteria:
  - GET /search?q=term returns relevant results sorted by relevance/date with snippets.
  - Search supports basic scripture reference matching if references stored in metadata.

## Epic: Admin content management (P0)

US-010 — Admin: Authentication (P0)
- As an Author/Editor, I want to log in so I can access the admin area.
- Acceptance criteria:
  - POST /auth/login accepts email/password; returns a signed JWT (and refresh token if implemented).
  - Admin routes are protected; requests without valid token receive 401.

US-011 — Admin: Create/Edit/Publish posts (P0)
- As an Author, I want to compose and publish posts so the public can read them.
- Acceptance criteria:
  - Admin UI allows creating a post with title, slug, excerpt, content, featured image, categories, tags, and optional scripture references.
  - POST /admin/posts creates draft; PUT /admin/posts/:id updates; POST /admin/posts/:id/publish sets status published and publishes (sets published_at).
  - After publish, GET /posts includes the new article and it is visible on the public site within expected propagation time.

US-012 — Admin: Drafts, scheduling, revisions (P0)
- As an Editor, I want drafts, scheduling, and revision history so I can prepare content and revert changes when needed.
- Acceptance criteria:
  - Drafts are saved with status=draft and editable.
  - Scheduling accepts a future published_at; scheduled items move to published automatically (or via a cron/job) at that time.
  - Revisions saved on each publish or explicit save; UI exposes a history and ability to revert to a prior snapshot.

US-013 — Admin: Media library & image handling (P0)
- As an Author, I want to upload and select images for posts and set alt text so images display correctly on the public site.
- Acceptance criteria:
  - POST /admin/media accepts multipart upload, validates file size/type, stores object in configured storage, and returns CDN URL and dimensions.
  - Admin UI lists uploaded media and allows selecting/cropping/setting alt text.

US-014 — Admin: Taxonomy management (categories & tags) (P0)
- As an Editor, I want to create and manage categories/tags so content can be organized.
- Acceptance criteria:
  - CRUD endpoints for categories and tags exist and are admin-protected.
  - Deleting/renaming a category updates or preserves posts with clear admin UX (prevent accidental orphaning).

## Epic: SEO, metadata & sharing (P0)

US-020 — SEO metadata & Open Graph (P0)
- As a site owner, I want pages to include SEO meta tags and Open Graph so shared links look correct and search engines index pages properly.
- Acceptance criteria:
  - Server-side rendering or meta injection adds title, description, canonical, og:* tags per article and per list page.
  - Featured image used for og:image and Twitter card.

## Epic: Subscriptions & sharing (P1)

US-030 — Subscribe via email (P1)
- As a Community Member, I want to subscribe to updates via email so I receive new articles.
- Acceptance criteria:
  - POST /subscribe accepts email and returns 200; email validation occurs.
  - Double opt-in flow configurable; integration with mailing provider (Mailgun/SendGrid) or simple webhook.

US-031 — Social sharing (P1)
- As a user, I want to share articles via social networks so others can read them.
- Acceptance criteria:
  - Social share buttons exist and open correct share dialogs/URLs with prefilled title and URL.

## Epic: Search & Researcher features (P1)

US-040 — Advanced search & scripture indexing (P1)
- As a Devout Researcher, I want to search by scripture passage and see matching articles that reference that passage.
- Acceptance criteria:
  - Scripture references stored as structured metadata and indexed for search.
  - Search UI can accept scripture-like input (e.g., "Romans 8") and return matching results.

## Epic: Platform, infra & dev tasks (P0/P1)

TS-001 — DB schema & migrations (P0)
- Create initial MySQL schema and migrations for users, posts, categories, tags, post_taxonomy, media, revisions, and settings.
- Acceptance criteria:
  - Migrations run locally and in CI; seed script adds an admin user and sample content.

TS-002 — API skeleton & OpenAPI (P0)
- Implement Express app skeleton with routing and basic error handling; add OpenAPI skeleton covering the core endpoints.
- Acceptance criteria:
  - Basic endpoints return stubbed responses; OpenAPI file present and can be used to generate API client stubs.

TS-003 — CI (lint + test) (P0)
- Add CI workflow that runs linter and unit tests on push/PR.
- Acceptance criteria:
  - CI passes on main branch with minimal tests (auth + posts CRUD stubs).

TS-004 — Local dev setup & README (P0)
- Create readme with local dev steps, environment variables, and scripts to run API and frontends.
- Acceptance criteria:
  - Developer can run the API and web apps locally following README.

## Prioritization notes & dependencies
- Must-have (P0) stories: US-001, US-002, US-003, US-004, US-010..US-014, US-020, TS-001..TS-004.
- Near-term (P1) stories: US-030, US-031, US-040.
- P1/P2 features depend on stable P0 infra (object storage, CDN, DB migrations, auth).

## Ready-for-estimate checklist (for each story)
- Clear acceptance criteria (present in this file)
- Mockups/screens for UI stories (Home, Article, Admin Editor, Media Library)
- API contract and sample request/response shapes
- Definition of Done includes unit tests, integration test (where applicable), and documentation update.

## Next steps
- Convert top P0 stories into GitHub issues or project tickets with estimates.
- Produce simple wireframes for Home, Article, and Admin Editor to remove UI ambiguity.
- Start Sprint 0: TS-001, TS-002, TS-004, and US-010 (auth) as initial tasks.
