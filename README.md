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

