# FaithStories — blog repo

High-level specification and user stories drafted in `specification.md` and `user_stories.md`.

## Local dev: migrations and seeds

This repo uses Knex migrations/seeds for the API database (MySQL). Quick steps:

1. Copy `.env.example` to `.env` and set your DB credentials.
2. Install dependencies:

```bash
cd blog
npm install
```

3. Run migrations and seeds:

```bash
npm run migrate
npm run seed
```

If you prefer to use `npx` directly:

```bash
npx knex migrate:latest --knexfile knexfile.js
npx knex seed:run --knexfile knexfile.js
```

Note: seeds create a default admin user using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your environment.

## CI / GitHub Actions secrets

The repository includes a GitHub Actions workflow that runs the API integration tests. To run the workflow successfully, set the following repository secrets (Settings → Secrets and variables → Actions):

- `MYSQL_ROOT_PASSWORD` — password for the MySQL root user inside the container (used to create the test DB and CI user).
- `DB_USER` — username for the non-root CI database user (e.g. `ci_user`).
- `DB_PASS` — password for the non-root CI database user.
- `DB_NAME_TEST` — name of the test database (e.g. `faithstories_test`).

When the workflow runs it will:

1. Start a MySQL service container using `MYSQL_ROOT_PASSWORD` and create the database `DB_NAME_TEST`.
2. Wait for MySQL to become ready.
3. Create a dedicated CI DB user (`DB_USER`) with password `DB_PASS`, and grant privileges on `DB_NAME_TEST`.
4. Run migrations and seeds against the test DB and then execute the Jest integration tests.

For local testing you can set these env vars in your `.env` or run the test setup script manually:

```bash
# create test DB and run migrations+seeds
node api/bin/test-setup.js

# run tests
NODE_ENV=test cd api && npm test

# optionally drop test DB when done
node api/bin/test-teardown.js
```

