CI notes — package installs and lockfiles

Why this matters

- The CI workflow prefers deterministic installs using `npm ci` when a `package-lock.json` exists. `npm ci` installs exactly what's in the lockfile and is faster and more reproducible.
- `npm ci` requires a matching `package-lock.json` present in the package directory. If the lockfile is missing or out-of-sync with `package.json`, `npm ci` fails with an EUSAGE / lockfile mismatch error.
- For multi-package layouts (here: `backend/api` and `backend/db`) each package that runs `npm ci` should commit its own lockfile if you want deterministic installs for that package.

What the workflow does (short)

- For `backend/db` the workflow will:
  - run `npm ci --prefix backend/db` if `backend/db/package-lock.json` exists
  - otherwise fall back to `npm install --prefix backend/db`

- For `backend/api` the workflow will:
  - attempt `npm ci` if `backend/api/package-lock.json` exists
  - if `npm ci` fails (for example lockfile out-of-sync), it falls back to `npm install` to avoid the EUSAGE failure

Why we chose this fallback

- Falling back to `npm install` keeps CI robust (it won't immediately fail because of a missing or stale lockfile). The preferred deterministic path remains `npm ci` when a lockfile is present and valid.
- Long-term the recommended practice is to commit the lockfiles so CI can run `npm ci` and installs are reproducible.

How to generate and commit lockfiles locally

1. Generate `backend/api` lockfile (run from repo root):

```bash
npm install --prefix backend/api
git add backend/api/package-lock.json
git commit -m "chore(api): add package-lock.json for deterministic CI installs"
```

2. Generate `backend/db` lockfile (if you want deterministic installs for the seeds/migrations):

```bash
npm install --prefix backend/db
git add backend/db/package-lock.json
git commit -m "chore(db): add package-lock.json for deterministic CI installs"
```

3. Push the changes and re-run CI.

Optional: keep lockfiles in sync

- When you intentionally change dependencies in a package, update the lockfile by running `npm install --prefix <package>` and commit the updated lockfile alongside the `package.json` change.

Notes and security

- The CI workflow uses repo secrets for DB credentials; lockfiles do not contain secrets and are safe to commit.
- The CI workflow will still create and drop a CI DB user during the job; audit artifacts for grants are uploaded for traceability.

Troubleshooting

- If CI still fails with `npm ci` errors after adding lockfiles, run the failing install command locally to reproduce the issue and update the lockfile.
- If you prefer to always use non-deterministic installs, we can simplify CI to always use `npm install`, but this increases the risk of inconsistent builds.

Contact

If you want, I can generate and add these lockfiles for you and create a small PR with the commits.
