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

Example response (400 Bad Request):

```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Invalid value",
      "path": "slug",
      "location": "body"
    },
    {
      "type": "field",
      "value": "",
      "msg": "slug must be lowercase letters, numbers or hyphens",
      "path": "slug",
      "location": "body"
    }
  ]
}
```

3) Create a valid post

```bash
curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Valid Post","slug":"valid-post-1","excerpt":"hi","content":"body"}' \
  http://localhost:4000/api/v1/admin/posts | jq .
```

Example response (201 Created):

```json
{
  "data": {
    "id": 1,
    "author_id": 1,
    "title": "Valid Post",
    "slug": "valid-post-1",
    "excerpt": "hi",
    "content": "body",
    "featured_media_id": null,
    "status": "draft",
    "published_at": null,
    "created_at": "2025-11-28T19:17:21.000Z",
    "updated_at": "2025-11-28T19:17:21.000Z"
  }
}
```

4) List posts (admin view)

```bash
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/admin/posts | jq .
```

Example response:

```json
{
  "data": [
    {
      "id": 1,
      "author_id": 1,
      "title": "Valid Post",
      "slug": "valid-post-1",
      "excerpt": "hi",
      "content": "body",
      "featured_media_id": null,
      "status": "draft",
      "published_at": null,
      "created_at": "2025-11-28T19:17:21.000Z",
      "updated_at": "2025-11-28T19:17:21.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20
  }
}
```

5) Get / Update / Delete a single post

```bash
# get by id (replace ID with the real id)
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/admin/posts/1 | jq .

# update
curl -s -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Updated Title"}' \
  http://localhost:4000/api/v1/admin/posts/1 | jq .

# delete
curl -i -s -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/admin/posts/1
```

Example update response:

```json
{
  "data": {
    "id": 1,
    "author_id": 1,
    "title": "Updated Title",
    "slug": "valid-post-1",
    "excerpt": "hi",
    "content": "body",
    "featured_media_id": null,
    "status": "draft",
    "published_at": null,
    "created_at": "2025-11-28T19:17:21.000Z",
    "updated_at": "2025-11-28T19:20:00.000Z"
  }
}
```

Delete returns 204 No Content on success.

---

If you'd like, I can also add an automated integration test (Jest + supertest) that runs these steps programmatically and fails the CI pipeline on regressions. Would you like that next?
