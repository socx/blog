# Blog Frontend

This is a minimal Vite + React frontend to consume the blog API.

Quick start:

1. Install deps

   npm install

2. Run dev server (defaults to port 5173)

   npm run dev

3. Configure the API base in development by setting VITE_API_BASE. Example:

   VITE_API_BASE=http://localhost:3000 npm run dev

This app contains a `Home` page that fetches featured posts and renders a simple featured carousel and a paginated list of recent posts.
