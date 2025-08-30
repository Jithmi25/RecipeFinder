# Recipe Finder — Starter

This starter implements a search MVP for recipes using Vue 3 (Vite) frontend, Express backend, and MySQL.

## Quick start

1. `docker compose up --build`
2. The seed SQL (in `/seed`) will be executed by MySQL on first run.
3. Frontend: http://localhost:5173
4. API: http://localhost:3000

## Notes

- The backend exposes `/api/recipes/search` and `/api/ingredients`.
- For production, replace compose DB creds and remove DB port exposure.
