# FaithStories — blog repo

High-level specification and user stories drafted in `specification.md` and `user_stories.md`.

## Local dev: migrations, seeds and running the API

The repository was reorganized: the server code lives under `backend/api` and DB migrations/seeds under `backend/db`.

Quickstart (local machine)

1. Copy `.env.example` to `.env` and set your DB credentials (DB_HOST/DB_USER/DB_PASS/DB_NAME etc.).

2. Install API dependencies:

```bash
cd backend/api
npm ci
```

3. Start MySQL (Docker Compose) and run migrations/seeds from the repo root (recommended):

```bash
# bring up the DB + API dev container (API will mount your source)
docker compose -f devops/docker-compose.dev.yml up -d db

# run migrations and seeds (from repo root)
npx knex migrate:latest --knexfile backend/db/knexfile.js
npx knex seed:run --knexfile backend/db/knexfile.js
```

Notes:
- The `knexfile` is now at `backend/db/knexfile.js` so use `--knexfile` when invoking `knex` from the repo root.
- Seeds create a default admin user using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your environment.

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
node backend/api/bin/test-setup.js

# run tests
NODE_ENV=test cd backend/api && npm test

# optionally drop test DB when done
node backend/api/bin/test-teardown.js
```

## Local development with Docker Compose

There's a `docker-compose.dev.yml` in the repo root (`blog/docker-compose.dev.yml`) that starts a MySQL container and runs the API in a Node container (the API service builds using `backend/api` and bind-mounts your source for live reload).

1. Copy `.env.example` to `.env` and adjust values if you like (especially `DB_*` and admin credentials).

2. Start services (from repo root):

```bash
docker compose -f devops/docker-compose.dev.yml up
```

The API will be available at http://localhost:4000 (when running).

Notes:
- The compose file uses environment variables from your shell or `.env` file. Defaults are provided in the YAML for convenience but you should set secure values locally.
- Run migrations from your host (recommended) while the DB container is running (see commands above).
- To run the admin/test flow quickly inside the running API container, you can open a shell:

# use the devops compose file path when running from repo root
```bash
docker compose -f devops/docker-compose.dev.yml exec api sh
# then inside the container:
npm run migrate # if you have the knex CLI available in the container
npm run seed
node ./index.js # or npm run dev
```


