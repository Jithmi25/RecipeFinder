# Recipe Finder 🧑🏻‍🍳

Recipe Finder is a Node.js and Express backend that provides authenticated recipe discovery and favorites management.

The service integrates:

- Google Sign-In token verification for login
- JWT-based API authentication
- TheMealDB as the recipe source
- Firebase Firestore for user favorites storage
- MySQL for local seed/demo schema and Dockerized development setup

## Tech Stack 🛠️

- Runtime: Node.js 18+ (Render config uses Node 20)
- Framework: Express 5
- HTTP client: Axios
- Auth: Google Auth Library + JSON Web Tokens
- Data stores:
  - Firestore (favorites)
  - MySQL 8 (seeded local schema)
- Containerization: Docker + Docker Compose

## Repository Structure 📂

```text
.
|-- docker-compose.yml
|-- render.yaml
|-- seed/
|   `-- seed.sql
`-- recipe-finder-api/
		|-- Dockerfile
		|-- package.json
		`-- src/
				|-- server.js
				|-- db.js
				|-- firebaseAdmin.js
				|-- controllers/
				|-- middleware/
				|-- models/
				|-- routes/
				`-- services/
```

## Prerequisites 📝

- Node.js 18 or higher
- npm
- Docker Desktop (for containerized local run)
- A Firebase project with Firestore enabled
- Google OAuth client configured for your app

## Environment Variables

Create a local environment file at recipe-finder-api/.env.

Important:

- Do not commit real credentials.
- Use your own Firebase private key and OAuth credentials.

Required backend variables:

```env
DB_HOST=localhost
DB_USER=dev
DB_PASS=devpass
DB_NAME=recipes
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173

GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
JWT_SECRET=replace-with-a-strong-secret

FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

THEMEALDB_BASE_URL=https://www.themealdb.com/api/json/v1/1
THEMEALDB_API_KEY=1
```

Notes about FIREBASE_PRIVATE_KEY:

- Keep line breaks escaped as \n in the .env file.
- The app normalizes escaped newlines and also wraps missing key headers when needed.

## Local Development (Without Docker)

1. Open a terminal in recipe-finder-api.
2. Install dependencies.
3. Add your .env file.
4. Start the dev server.

```bash
cd recipe-finder-api
npm install
npm run dev
```

Server default URL:

- http://localhost:3000

## Run With Docker Compose

From repo root:

```bash
docker compose up --build
```

What this starts:

- db: MySQL 8, seeded from seed/seed.sql on first run
- api: Express backend (port 3000)
- web: Frontend service reference (port 5173) from docker-compose.yml

Notes:

- The current workspace includes the backend project and compose file.
- If recipe-finder-frontend is not present in your checkout, the web service build will fail.
- In that case, comment out or remove the web service in docker-compose.yml when running backend-only.

## API Overview

Base URL:

- /api

Authentication:

- Most recipe endpoints require Authorization: Bearer <jwt>
- JWT is obtained by exchanging a Google credential token at login

### Auth Endpoints

POST /api/auth/google

- Body:

```json
{
  "credential": "google-id-token"
}
```

- Success response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "google-sub",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://..."
  }
}
```

### Recipe Endpoints (JWT Required)

GET /api/recipes/search

- Query params:
  - q: text query
  - diets: comma-separated category keys
  - limit: integer, default 12
  - offset: integer, default 0

GET /api/recipes/diets

- Returns available diet/category options from TheMealDB categories

GET /api/recipes/ingredients

- Query params:
  - limit: integer, default 20

GET /api/recipes/:id

- Returns normalized recipe details including ingredients

GET /api/recipes/favorites

- Returns favorite recipes for authenticated user

GET /api/recipes/favorites/ids

- Returns only favorited recipe IDs

POST /api/recipes/favorites/:recipeId

- Adds a recipe to favorites

DELETE /api/recipes/favorites/:recipeId

- Removes a recipe from favorites

## CORS Behavior

Allowed origins are built from:

- FRONTEND_ORIGIN (comma-separated, optional)
- http://localhost:5173 (always included as a default)

Requests with no Origin header (for example curl or Postman) are allowed.

## Data Model Notes

MySQL seed schema is provided in seed/seed.sql and includes:

- recipes
- ingredients
- recipe_ingredients
- diet_types
- recipe_diet_types

Current runtime recipe search and details come from TheMealDB.

Favorites persistence uses Firestore collection:

- user_favorites

Document key pattern:

- <userId>\_<recipeId>

## Deployment

Render blueprint is defined in render.yaml:

- Service name: recipe-finder-api
- Environment: Node
- Root directory: recipe-finder-api
- Build command: npm install
- Start command: npm start
- Node version: 20

Before deploying, configure environment variables in Render:

- GOOGLE_CLIENT_ID
- JWT_SECRET
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
- FRONTEND_ORIGIN
- THEMEALDB_BASE_URL (optional)
- THEMEALDB_API_KEY (optional)

## Troubleshooting

401 Missing authentication token

- Ensure Authorization header is set as Bearer <token>.

401 Invalid or expired authentication token

- Re-authenticate via /api/auth/google and retry with a fresh token.

401 Google token verification failed

- Check that credential token is valid and GOOGLE_CLIENT_ID matches the token audience.

500 Firebase credentials are missing

- Verify FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.

503 Saved recipes service is temporarily unavailable

- Usually indicates upstream (TheMealDB or Firestore) connectivity or configuration issue.

CORS blocked requests

- Add the exact frontend origin to FRONTEND_ORIGIN.
- Include protocol and port, for example https://app.example.com.

## Security Recommendations

- Rotate and replace any previously exposed secrets immediately.
- Use a strong JWT_SECRET in non-local environments.
- Keep .env files out of source control.
- Restrict FRONTEND_ORIGIN to trusted domains in production.

## Scripts

From recipe-finder-api:

- npm start: run production server
- npm run dev: run with nodemon
- npm test: placeholder script (no tests configured yet)

## Current Gaps

- Automated tests are not yet configured.
- The compose file references a frontend folder that may not exist in this workspace.
- A legacy service file exists in src/services/searchService.js and appears unused by active routes.
