# API Manual Tests

This file contains a short set of curl commands you can run locally to exercise the auth flow and the admin posts CRUD endpoints. The examples assume the API server is running locally on port 4000 (the default in `api/index.js`).

Notes
- The seed creates an admin user with the credentials from `.env.example` (by default `admin@example.com` / `changeme`).
- Replace $TOKEN in the commands with a real JWT returned from the login command. A helper that captures it with Python is shown below.

1) Get a token (login)

```bash
# Get a token and print it
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"changeme"}' \
  http://localhost:4000/api/v1/auth/login | python3 -c 'import sys,json;print(json.load(sys.stdin).get("token",""))'

# Or get the full JSON response (token + user profile)
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"changeme"}' \
  http://localhost:4000/api/v1/auth/login | jq .
```

Example response (login success):

```json
{
  "token": "<JWT_TOKEN_HERE>",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

2) Attempt an invalid create (validation failure)

```bash
# using a helper to store the token in $TOKEN
TOKEN=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"changeme"}' http://localhost:4000/api/v1/auth/login | python3 -c 'import sys,json;print(json.load(sys.stdin).get("token",""))')

# invalid because `slug` is missing / empty
curl -i -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Invalid Post"}' \
  http://localhost:4000/api/v1/admin/posts | jq .
```

... (commands omitted for brevity; same content as original) ...

## Admin: scheduled posts filter

The admin posts list supports a `scheduled` query parameter to return only posts that are scheduled to be published in the future.

Example: list only scheduled (future `published_at`) posts

```bash
# assuming you stored a token in $TOKEN as above
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/api/v1/admin/posts?scheduled=true" | jq .
```

Behavior:
- `?scheduled=true` — returns posts whose `published_at` is in the future (scheduled posts).
- No `scheduled` param (or `scheduled=false`) — returns the normal admin list (all posts regardless of publish time).

Notes:
- The filter is intended for the admin UI to show only items scheduled for future publishing.
- The public `GET /api/v1/posts` endpoint already respects `published_at` and only returns currently-published posts (i.e. those with `published_at` <= now or null).
