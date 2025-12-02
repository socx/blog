# Backend API - Test uploads

Tests that exercise the media upload endpoint (`POST /api/v1/admin/media`) create temporary files during the run.

By default the application serves and stores uploads from the repository `uploads/` directory. When running the test suite the test harness will automatically create a temporary uploads directory and set the `UPLOADS_DIR` environment variable to point at it. The test flow is:

- `node ./bin/test-setup.js` — prepares the test database
- `node ./bin/mk-uploads-dir.js` — creates a temporary uploads directory and prints its path
- `UPLOADS_DIR=<temp-dir> NODE_ENV=test jest ...` — runs Jest with `UPLOADS_DIR` set so multer and the static server use the temp dir
- `node ./bin/test-teardown.js` — runs teardown (drops test DB)
- `rm -rf "$UPLOADS_DIR"` — removes the temp uploads directory

This keeps test artifacts isolated from the repository `uploads/` directory and makes CI runs safer. Tests also use a shared cleanup helper (`test/helpers/cleanup.js`) to attempt removal of any uploaded files created during individual tests.

Additionally, the test teardown script (`bin/test-teardown.js`) will attempt to remove the temporary `UPLOADS_DIR` created for the test run — but only when that directory is inside the system temporary directory (this is a safety guard to prevent accidental removal of non-temp paths).

If you want tests to always use a specific directory, set the `UPLOADS_DIR` environment variable before running the tests.

Example:

```bash
UPLOADS_DIR=/tmp/blog-uploads npm --prefix backend/api test
```
