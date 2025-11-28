# Personas & User Journeys — FaithStories

Date: 28 November 2025

This document captures primary personas for the FaithStories site and maps key user journeys for the public-facing site and the admin/editor experience. Each journey includes success criteria and acceptance checks for the MVP.

## Personas

1) Casual Reader ("Anna")
  - Age: 28–45, occasional churchgoer, reads devotional content and short fiction for encouragement.
  - Goals: Quickly find uplifting stories and short articles; read on mobile during breaks.
  - Devices: Mobile-first (iPhone/Android), sometimes desktop.
  - Needs/Expectations: Fast page loads, clear typography, obvious navigation, share buttons, easy search by topic or scripture reference.
  - Pain points: Slow image-heavy pages, confusing navigation, paywalls or heavy registration requirements.

2) Devout Researcher ("Dr. Samuel")
  - Age: 40–65, seminary student or church historian, deep interest in scripture-based essays and historical sources.
  - Goals: Locate articles with scripture citations and references, access author/source metadata, print or save long-form pieces.
  - Devices: Desktop and tablet; expects robust search and filtering.
  - Needs/Expectations: Clear article metadata (author, published date, scripture references), citation support, printable view, advanced search (by scripture, tag, author).
  - Pain points: Poorly formatted references, missing metadata, weak search capabilities.

3) Community Member / Church Leader ("Pastor Emma")
  - Age: 30–55, leads small groups and pastors a church; sources material for teaching and devotions.
  - Goals: Find sermon-appropriate essays, devotionals, short stories, curate or bookmark pieces for reuse.
  - Devices: Desktop for preparation, mobile on the go.
  - Needs/Expectations: Ability to save/bookmark, print-friendly pages, clear licensing/permission notes for reuse, contact/author info.
  - Pain points: Licensing uncertainty, inability to quickly compile several articles for a lesson.

4) Author / Editor (Admin) ("Mark")
  - Age: 25–60, contributor/editor who writes fiction, essays, or scripture-based reflections.
  - Goals: Compose, preview, schedule, and publish stories and articles; manage media and metadata (scripture refs, tags, categories).
  - Devices: Desktop (primary); occasionally tablet.
  - Needs/Expectations: Clean editor with Markdown or light WYSIWYG, preview exactly matches public rendering, easy image upload and cropping, draft/schedule capabilities, revision history.
  - Pain points: Clunky editors, inability to preview mobile layout, manual metadata entry that is error-prone.

## Key user journeys (MVP-focused)

For each journey: Steps, acceptance criteria, key screens, and metrics.

### Public journey A — Read an article (Casual Reader)

Steps:
  1. Arrive at Home page (featured carousel / latest list).
 2. Tap a featured story → Article page opens with hero image, title, author, published date and scripture references (if present).
 3. Read content; use social share or bookmark/print controls.
 4. Click related post or category tag to discover more.

Acceptance criteria:
  - Article loads within target FCP/TTI (see spec non-functional targets).
  - Hero image uses responsive srcset and lazy loads below the fold.
  - Scripture references render as inline metadata and link to a small modal or anchor with verse text (optional MVP: show inline reference only).
  - Social share buttons are visible and prefill title/URL.

Key screens: Home, Article page, Related posts list, Tag/category page.

Success metrics: Time on page, % scroll depth to 50%, clickthrough to related posts.

### Public journey B — Find an article by scripture or tag (Devout Researcher)

Steps:
  1. Use site search or filter (enter "Romans 8" or tag "church-history").
  2. Results list shows matching articles with snippet and metadata; results are paginated.
  3. Open preferred article; use print view or save link.

Acceptance criteria:
  - Search returns relevant results for title/content/tags; scripture reference matches are supported by metadata indexing.
  - Paginated results with stable sort (relevance/date).

Key screens: Search results, Article page, Print view.

Success metrics: Search success rate (click-to-result), time-to-first-result.

### Public journey C — Subscribe / Share (Community Member)

Steps:
  1. Enter email in a subscription widget on Home or Article page.
  2. Confirm via email (double opt-in — phase-1 optional depending on outreach plan).
  3. Share an article via social button or copy link.

Acceptance criteria:
  - Subscription widget validates email, posts to subscription API, and triggers confirmation flow (if configured).
  - Social sharing generates correct Open Graph metadata for pinned images and descriptions.

Key screens: Subscription modal/section, Article page.

Success metrics: Subscription conversion rate, shares per article.

### Admin journey A — Create, preview, and publish a story (Author / Editor)

Steps:
  1. Sign in to Admin dashboard.
  2. Click New Post → fill title, excerpt, content (Markdown or rich text), add scripture references field(s), select categories and tags.
  3. Upload featured image from Media Library or upload new file and crop/select focal point.
  4. Preview post (mobile/desktop toggles) — confirm layout and metadata render correctly.
  5. Save as Draft or Schedule/Publish immediately.

Acceptance criteria:
  - Editor saves drafts and publishes posts; published posts are visible on the public site within expected propagation time.
  - Media uploads return a URL and dimensions; admin can select alt text.
  - Preview matches public rendering for primary content and metadata.

Key screens: Admin Dashboard, Post Editor, Media Library, Post Preview.

Success metrics: Time from draft -> publish, # of publish errors, editor satisfaction (qualitative feedback later).

### Admin journey B — Manage categories/tags and revisions

Steps:
  1. Sign in and open Taxonomy management.
  2. Create/edit/delete categories and tags; merge duplicates.
  3. Open a published post → view revision history → revert to previous revision if needed.

Acceptance criteria:
  - Taxonomy changes propagate to public site and post filters correctly.
  - Revision history stores snapshots on save and allows revert.

Key screens: Taxonomy management, Post history.

Success metrics: # taxonomy errors post-change, # of successful reverts.

### Admin journey C — Upload media and attach to post

Steps:
  1. Open Media Library → Upload image(s).
  2. System processes image (store to object storage, generate responsive variants) and returns URLs.
  3. Attach image to post as featured image; set alt text.

Acceptance criteria:
  - Media uploads succeed and images are accessible via CDN URLs; responsive variants are generated.
  - Admin can crop/select focal point and set alt text.

Key screens: Media Library, Upload modal, Post Editor image selector.

Success metrics: Upload success rate, time for image processing, CDN delivery latency.

## Edge cases & accessibility notes

- Anonymous users should be able to read public content without sign-in. Admin routes must be protected.
- Large uploads should be rejected with a clear error and guidance for resizing. Implement client-side file-size checks.
- All primary paths must be keyboard-navigable and meet WCAG AA contrast/tap target rules for MVP.

## Next steps

- Convert these journeys into backlog user stories with acceptance criteria.
- Create simple UI wireframes for Home, Article, Editor, and Media Library to validate UX flows.
