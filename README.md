# RoamRoot

**Discover places. Experience more. Plan your journey.**

RoamRoot is a MERN travel discovery platform: unique stays, local experiences, hidden gems, trip planning, bookings, travel stories, creator dashboards, an AI trip planner and an AI assistant. It is the rebuilt version of the old COZYCORNERS project.

Journey: **Discover → Save → Plan → Book → Travel → Share**

## Features

- Discover page with search, filters (URL based, shareable), sorting, pagination and an interactive map synced with the list
- Listing types: stay, experience, place, activity, event
- Listing detail: gallery with fullscreen viewer, map, reviews, booking panel, save, share, add to trip
- Register / login (JWT in an http-only cookie), roles USER / CREATOR / ADMIN, password reset flow
- Reviews (1 per user per listing, rating updates automatically)
- Saved places, bookings (with availability, capacity and server-side pricing), trips with day-by-day itinerary, reorder, notes and map
- Travel stories (magazine layout, likes)
- Creator Studio: dashboard, listings CRUD with Cloudinary uploads, bookings management, analytics charts
- AI Planner (5-step wizard) and floating AI assistant, grounded in real RoamRoot listings
- Deterministic recommendation engine (interests, category, location, price, rating, popularity, saved/booked history)
- Responsive design with mobile bottom navigation, skeleton loaders, empty/error states, toasts, offline banner

## Tech stack

| Part | Tools |
| --- | --- |
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios, TanStack Query, React Hook Form, Zod, Framer Motion, Lucide, React Leaflet (OpenStreetMap), Recharts, date-fns |
| Backend | Node.js, Express 4, MongoDB + Mongoose 7, JWT, bcryptjs, Joi, Multer, Cloudinary, Helmet, rate limiting |

## Folder structure

```
roamroot/
├── backend/
│   ├── server.js, app.js
│   ├── config/        db.js, cloudinary.js
│   ├── models/        User, Listing, Review, Booking, Favorite, Trip, TripItem, TravelStory
│   ├── controllers/   one file per feature
│   ├── routes/        one file per feature
│   ├── middleware/    auth, roles, upload, validate, validators, errorHandler, notFound
│   ├── services/      cloudinaryService, geocodingService, ai/ (provider, planner, recommendations, assistant)
│   ├── seed/          seedData.js, seed.js
│   ├── tests/         api.test.js
│   └── utils/
└── frontend/
    ├── public/images/ (brand, hero, destinations, stays, experiences, hidden-gems, stories, creators, ai, empty-states, system)
    └── src/ components, pages, layouts, services (one API file per feature), context, hooks, lib
```

## Setup

You need **Node.js 18+** (20 or newer is recommended) and your MongoDB Atlas + Cloudinary accounts.

### 1. Environment variables

`backend/.env` is your existing COZYCORNERS `.env`, copied unchanged. It uses these names:

```
ATLASDB_URL=
SECRET=
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=
```

Optional new variables (see `backend/.env.example`). Add them only if you need them:

| Variable | Default | Meaning |
| --- | --- | --- |
| `DB_NAME` | `roamroot` | Database name inside your Atlas cluster. RoamRoot uses its own database so the old COZYCORNERS collections are never touched or overwritten (the seed script clears RoamRoot collections only). |
| `PORT` | `8080` | API port |
| `CLIENT_URL` | `http://localhost:5173` | Frontend address (for CORS and reset links) |
| `NODE_ENV` | `development` | Use `production` when deploying (secure cookies, hidden error details) |
| `ANTHROPIC_API_KEY` | empty | Optional. Lets the AI planner/assistant write nicer text. Works without it. |
| `AI_MODEL` | `claude-sonnet-5-5` | Model used when a key is set |

**Never commit `.env`.** The `.gitignore` already excludes it. Never put secrets in the frontend.

### 2. Backend

```bash
cd backend
npm install
npm run seed     # fills the database with demo data
npm run dev      # http://localhost:8080
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

Open http://localhost:5173. In development Vite forwards `/api` to the backend on port 8080, so cookies just work.

### Demo accounts (created by the seed, password `Password@123`)

| Role | Email |
| --- | --- |
| User | demo@roamroot.com |
| Creator | creator@roamroot.com |
| Admin | admin@roamroot.com |

### Production build

```bash
cd frontend && npm run build     # output in frontend/dist
```

Serve `dist` from any static host and route `/api` to the backend (or set up a proxy). If the frontend and API are on different domains, set `CLIENT_URL` on the backend and use `sameSite: "none"` cookies with HTTPS.

## Testing

```bash
cd backend
npm run dev        # in one terminal
npm test           # in another: 72 checks of auth, CRUD, permissions, bookings, trips, AI
```

## How the pieces work

- **Images:** the creator form uploads files to `POST /api/uploads`; the backend sends them to Cloudinary with your existing keys. Seed data uses the local photos in `frontend/public/images`. Cloudinary URLs are resized automatically in the UI.
- **Maps:** React Leaflet with OpenStreetMap, no key needed. The old project's Mapbox geocoding was never configured (no token), so "Find on map" in the listing form now uses OpenStreetMap Nominatim through the backend.
- **AI:** `services/ai/aiProvider.js` is the only file that talks to an AI company. The plan itself (days, listings, prices, budget) is always built from the database, so no fake listings are invented. With an API key, AI also writes the summary and tips.
- **Recommendations:** `services/ai/recommendationService.js` scores each listing: interest + category + location + price + rating + popularity.
- **Bookings:** application-level only. No payment is taken and the UI says so.
- **Password reset:** there is no email service, so the reset link is printed in the backend terminal.

## API overview

All responses look like `{ "success": true, "data": ... }` or `{ "success": false, "message": "..." }`. Lists return `{ items, pagination: { page, limit, total, pages } }`.

| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/register`, `login`, `logout`, `GET /me`, `PUT /profile`, `GET /stats`, `POST /become-creator`, `/forgot-password`, `/reset-password` |
| Listings | `GET /api/listings` (q, destination, type, category, tag, minPrice, maxPrice, minRating, maxDuration, sort, page, limit), `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`, `GET /destinations`, `GET /geocode` |
| Reviews | `GET/POST /api/listings/:id/reviews`, `DELETE /api/reviews/:id` |
| Bookings | `POST/GET /api/bookings`, `GET/PATCH/DELETE /api/bookings/:id` |
| Favorites | `GET /api/favorites`, `POST/DELETE /api/favorites/:listingId` |
| Trips | `GET/POST /api/trips`, `GET/PUT/DELETE /:id`, `POST /:id/items`, `PUT/DELETE /:id/items/:itemId`, `POST /from-plan` |
| Stories | `GET/POST /api/stories`, `GET/PUT/DELETE /:id`, `POST /:id/like` |
| Creator | `GET /api/creator/dashboard`, `listings`, `bookings`, `analytics`, `featured`, `profile/:id` |
| AI | `POST /api/ai/plan-trip`, `recommend`, `chat` |
| Uploads / Admin | `POST /api/uploads`, `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`, `DELETE /api/admin/users/:id` |

## User roles

- **USER:** browse, save, review, book, plan trips, use AI, write stories
- **CREATOR:** everything a user can do, plus listings, bookings management and analytics (any user can click "Become a Creator")
- **ADMIN:** manage users and roles; delete any listing, review or story

Roles are always checked on the server, never trusted from the frontend.

## Screenshots

Add your own screenshots here (home, discover, listing, trip, creator dashboard).

## Future improvements

- Real payments (Stripe/Razorpay) and email (password reset, booking confirmations)
- Edit stories, creator reply to reviews, availability calendar with blocked dates
- Image moderation, notifications, multi-language support
- Machine-learning recommendations on top of the current scoring
