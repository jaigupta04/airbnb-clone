# Airbnb Clone

A functional clone of the Airbnb web application, built with **Next.js (TypeScript)** on the frontend and **FastAPI (Python)** with **SQLite** on the backend. It recreates Airbnb's explore → detail → booking → host workflows, including search, filters, date-range availability, wishlists, reviews, and full host CRUD.

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4 |
| Icons      | lucide-react |
| Dates      | Custom date-range picker (date-fns utilities) |
| Backend    | Python FastAPI, SQLAlchemy 2.x ORM, Pydantic v2 |
| Database   | SQLite (file-based, `airbnb.db`) |
| Auth       | JWT (PyJWT) with PBKDF2-SHA256 password hashing |

---

## Architecture Overview

```
air-bnb-clone/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + lifespan (auto-seeds on startup)
│   │   ├── database.py      # SQLAlchemy engine, session, Base
│   │   ├── models.py        # ORM models (User, Listing, Booking, Review, Wishlist, Category)
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   ├── auth.py          # JWT + password hashing + dependency injection
│   │   ├── seed.py          # Sample data: 6 users, 12 listings, bookings, reviews
│   │   └── routers/
│   │       ├── auth.py      # signup, login, me
│   │       ├── listings.py  # CRUD, search/filter, availability
│   │       ├── bookings.py  # create, my-trips, host bookings, cancel, price
│   │       ├── reviews.py   # list + create (with rating aggregation)
│   │       ├── wishlist.py  # add/remove/list
│   │       └── categories.py
│   ├── run.py               # entry point
│   └── requirements.txt
└── frontend/
    └── src/
        ├── app/
        │   ├── layout.tsx           # Root layout with providers
        │   ├── providers.tsx        # Auth, Toast, Theme, Header
        │   ├── page.tsx             # Explore grid + search + categories + filters
        │   ├── listings/[id]/        # Detail view with gallery, calendar, reviews
        │   ├── trips/                # My Trips (bookings) + cancel + review form
        │   ├── wishlist/             # Saved listings
        │   ├── host/                 # Host dashboard (listings + bookings)
        │   ├── host/new/             # Create listing form
        │   ├── host/[id]/edit/       # Edit listing form
        │   ├── login/ + signup/      # Auth pages
        ├── components/
        │   ├── Header.tsx, ListingCard.tsx, CategoryBar.tsx,
        │   │   FiltersModal.tsx, DateRangePicker.tsx, ListingForm.tsx,
        │   │   ReviewForm.tsx
        ├── contexts/  AuthContext.tsx, ToastContext.tsx, ThemeContext.tsx
        └── lib/      api.ts (typed client + types), utils.ts
```

### Data flow
The frontend talks to the backend over REST (`NEXT_PUBLIC_API_BASE`). On startup the backend auto-drops and recreates tables and seeds demo data, so the app is immediately usable. Bookings block date ranges so subsequent reservation attempts validate against them.

---

## Setup Instructions

### Prerequisites
- Node.js 18+ (tested on Node 22+)
- Python 3.10+ (tested on 3.13)

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
python run.py          # serves http://127.0.0.1:8000
```
The database (`airbnb.db`) is created and seeded automatically on first run. API docs: `http://127.0.0.1:8000/docs`.

### 2. Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev           # serves http://localhost:3000
```
Ensure `NEXT_PUBLIC_API_BASE` points to the backend (defaults to `http://127.0.0.1:8000`).

### Demo logins
All accounts use password **`password123`**.

| Email                  | Role      |
|------------------------|-----------|
| priya@example.com      | Guest     |
| maria@example.com      | Superhost |
| james@example.com      | Host      |

---

## Database Schema

```sql
USERS
  id, name, email (unique), password_hash, avatar_url,
  is_host, is_superhost, created_at

CATEGORIES
  id, name (unique), icon

LISTINGS
  id, host_id → users.id
  title, description, property_type, room_type,
  city, country, lat, lng,
  price_per_night, cleaning_fee, service_fee_pct,
  bedrooms, beds, baths, max_guests,
  amenities (JSON array), photos (JSON array),
  rating_avg, rating_count, created_at

LISTING_CATEGORIES  (many-to-many)
  listing_id → listings.id,  category_id → categories.id  (PK pair)

BOOKINGS
  id, listing_id → listings.id, guest_id → users.id,
  check_in, check_out, guests, nights,
  nightly_total, cleaning_fee, service_fee, total,
  status (confirmed | completed | cancelled), created_at

REVIEWS
  id, listing_id → listings.id, author_id → users.id,
  booking_id → bookings.id (nullable),
  rating (1-5), comment, created_at

WISHLISTS
  id, user_id → users.id, listing_id → listings.id,
  created_at, UNIQUE(user_id, listing_id)
```

**Relationships**
- A user (host) has many listings; a listing belongs to one host.
- A listing has many bookings (one guest per booking); a booking belongs to one guest and one listing.
- A booking has at most one review (guest leaves review after stay).
- Listings ↔ Categories is many-to-many.
- Users ↔ Listings (through Wishlist) is many-to-many favourites.
- Ratings on listings are aggregated from reviews (avg + count); Superhost status is auto-set when a host has ≥5 reviews averaging ≥4.8.

---

## API Overview

| Method | Endpoint                          | Auth | Description |
|--------|-----------------------------------|------|-------------|
| POST   | `/auth/signup`                    | –    | Create account, returns JWT |
| POST   | `/auth/login`                     | –    | Login, returns JWT |
| GET    | `/auth/me`                        | ✓    | Current user |
| GET    | `/listings`                       | –    | Search/filter listings (city, category, price, type, guests, dates, amenities, sort, pagination) |
| GET    | `/listings/{id}`                  | –    | Listing detail |
| POST   | `/listings`                        | ✓ host | Create listing |
| PUT    | `/listings/{id}`                   | ✓ host | Update listing |
| DELETE | `/listings/{id}`                   | ✓ host | Delete listing |
| GET    | `/listings/host/my`                | ✓     | Host's own listings |
| GET    | `/listings/{id}/availability`     | –    | Unavailable ISO dates |
| GET    | `/categories`                     | –    | Category list |
| POST   | `/bookings/price`                 | –    | Price breakdown for date range |
| POST   | `/bookings`                       | ✓    | Create booking (validates overlap, guest count, dates) |
| GET    | `/bookings/my-trips`               | ✓    | Guest's bookings (with listing) |
| GET    | `/bookings/host`                   | ✓ host| Bookings for host's listings |
| DELETE | `/bookings/{id}`                   | ✓     | Cancel booking (guest only) |
| GET    | `/reviews/listing/{id}`            | –    | Reviews for listing |
| POST   | `/reviews?booking_id=`             | ✓     | Leave review (post-stay, once per booking) |
| GET    | `/wishlist`                        | ✓     | User's saved listings |
| POST   | `/wishlist/{listing_id}`           | ✓     | Save listing |
| DELETE | `/wishlist/{listing_id}`           | ✓     | Unsave listing |

---

## Feature Checklist

### Core (Must Have)
- [x] Home/explore grid with cards (photo, title, location, price/night, rating) + photo carousel
- [x] Search bar (location + date hint + guests)
- [x] Category row + Filters modal (price range, property type, room type, amenities, guests)
- [x] Infinite scroll pagination
- [x] Listing detail page: photo gallery + lightbox, title, description, amenities, host info, availability calendar, price breakdown, reviews
- [x] Booking flow: date-range selection with unavailable-date blocking, guest count validation, overlap detection, mocked checkout/confirmation
- [x] My Trips view with cancel + leave-review
- [x] Bookings persist and block dates on the listing
- [x] Host CRUD: create (photo URL/upload + suggested stock), edit, delete
- [x] Host dashboard: owned listings + their bookings
- [x] Notifications/toasts
- [x] Wishlist/favorites (toggle from cards and detail page; saved view)

### Bonus
- [x] Superhost badges + ratings aggregation
- [x] Leave a review after a completed stay
- [x] Dark mode
- [x] Responsive design (mobile, tablet, desktop)
- [x] Image upload (file → data URL; URL input; stock photo suggestions)

### Mocked
- Payment processing (booking confirmation only)
- Messaging between guest and host
- Real-time map (static gradient placeholder with lat/lng)
- Authentication is simplified JWT (no email verification); guest vs host distinction is supported via `is_host`

---

## Assumptions
- Single-server deployment (SQLite file); suitable for the demo scope.
- Auth tokens are stored in `localStorage` (sufficient for this assignment; HTTP-only cookies would be used in production).
- Image upload stores data URLs (base64) in the database for simplicity; no external cloud storage is integrated.
- Reviews are allowed only after the checkout date of a completed booking, once per booking.
- Categories are seeded; listings opt into categories via the host form.

---

## Running Lint / Type Checks
```bash
# Frontend
cd frontend
npx tsc --noEmit
npm run lint

# Backend
cd backend
python -c "import app.main"   # smoke test imports
```

---

## Deployment Notes
- Frontend is ready for Vercel: set `NEXT_PUBLIC_API_BASE` to the deployed backend URL.
- Backend can be deployed to Render/Railway/Fly.io; switch `SQLALCHEMY_DATABASE_URL` to a persistent path or external DB for production.