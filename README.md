# Polley Enterprise Website

Next.js 15 App Router site plus a fleet tracking backend for Polley Enterprise, a
Houston, TX transportation and service company. Everything runs on Cloudflare: one
Worker serves the site, the API, and the database.

**Live:** https://polley-enterprise.polley-enterprise.workers.dev

## Stack

- Next.js 15 (App Router, static export)
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Cloudflare Workers (site hosting + API)
- Cloudflare D1 (SQLite database: employees, shipments, GPS, form submissions)

There is no third-party backend service. No Supabase, no Netlify, no separate form
provider.

## Run Locally

Two ways to run, depending on what you are working on.

```bash
npm install

npm run dev        # pages only, fast refresh, http://localhost:3000
```

The API and database do not exist under `npm run dev`, so login, tracking, and the
forms will not work there. To run the whole thing exactly as it runs in production:

```bash
npm run build              # produces the static site in out/
npm run db:apply:local     # creates the tables in a local test database
npm run cf:dev             # http://127.0.0.1:8787 with the API and database
```

Then add a test login for the local database:

```bash
npm run users:create -- --local --email you@example.com --name "Your Name" --role admin
```

## Deploy

```bash
npm run cf:deploy
```

That builds the site and pushes the Worker, the static files, and the D1 binding in
one step. To use a custom domain, add the domain to Cloudflare and attach a route
to the `polley-enterprise` Worker in the dashboard.

## What Is Already Set Up

The Cloudflare side is done and live:

| Item | Value |
| --- | --- |
| Cloudflare account | Polley Enterprise (`1f4b8a60146a3506526639512a6b0f05`) |
| Worker | `polley-enterprise` |
| D1 database | `polley-enterprise` (`49473a60-7960-4d4d-8f74-173fd71eb513`) |
| Tables | users, sessions, login_attempts, counters, shipments, shipment_events, shift_sessions, location_pings, quote_requests |
| Owner login | `owner@polleyenterprise.com` (admin) |

Change the owner password after the first sign-in, and create a login for each
employee:

```bash
npm run users:create -- --email dispatch@polleyenterprise.com --name "Dispatcher Name" --role dispatcher
npm run users:create -- --email driver@polleyenterprise.com --name "Driver Name" --role employee
```

Leave `--password` off and a strong one is generated and printed once. Roles are
`admin`, `dispatcher`, or `employee`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Pages only, no API. |
| `npm run build` | Builds the static site into `out/`. |
| `npm run cf:dev` | Runs the site, API, and a local database together. |
| `npm run cf:deploy` | Builds and deploys to Cloudflare. |
| `npm run db:apply` | Applies `db/schema.sql` to the live database. Safe to re-run. |
| `npm run db:apply:local` | Same, against the local test database. |
| `npm run db:seed` | Adds two demo shipments (`PE-DEMO1`, `PE-DEMO2`) for the tracking page. |
| `npm run users:create` | Creates or updates an employee login. |
| `npm run api:test` | Runs 46 end-to-end checks against `npm run cf:dev`. |

`npm run api:test` also accepts a URL, for example
`npm run api:test -- https://polley-enterprise.polley-enterprise.workers.dev`. Against
a live site it runs only the checks that do not need test accounts.

## How It Works

Customers and staff hit the same Worker:

- Any normal page request is served from the uploaded static files.
- Anything under `/api/` is handled by the Worker code in `worker/` and reads or
  writes D1.

### API

| Endpoint | Who | Purpose |
| --- | --- | --- |
| `POST /api/quotes` | anyone | Website form submissions |
| `GET /api/track?number=` | anyone | Public shipment tracking |
| `POST /api/auth/login` / `logout` | anyone | Sign in and out |
| `GET /api/auth/me` | signed in | Current user |
| `POST /api/auth/password` | signed in | Change password |
| `GET /api/shipments` | signed in | Board, scoped by role |
| `POST /api/shipments` | dispatch | Create a shipment |
| `GET /api/shipments/:id` | assigned or dispatch | Detail, events, GPS trail |
| `PATCH /api/shipments/:id` | assigned or dispatch | Update |
| `POST /api/shipments/:id/shift/start` / `end` | assigned driver | Shift control |
| `POST /api/shipments/:id/locations` | assigned driver | GPS ping |
| `GET /api/employees` | dispatch | Roster |
| `GET /api/quotes`, `PATCH /api/quotes/:id` | dispatch | Request inbox |

### How the data is protected

- Passwords are stored as PBKDF2-SHA256 hashes (100,000 iterations, per-user salt).
  They are never stored or logged in readable form.
- Sessions live in a cookie that JavaScript cannot read, and the database stores
  only a hash of it, so a database copy hands over no usable sessions. Sessions
  expire after 12 hours.
- After 10 failed sign-ins from one address, that address waits 10 minutes.
- `/track` returns only public fields: status, cities, schedule, and the public
  note. Addresses, phone numbers, emails, internal notes, and driver identity are
  never sent to a customer.
- Drivers see only shipments assigned to them. They can update status and the
  customer note; the customer, route, and assignment are dispatch-only.
- GPS is accepted only while that driver has a shift running on that shipment, and
  the trail is hidden once a job is delivered or cancelled.
- Every permission rule above is covered by `npm run api:test`.

### Using it day to day

1. Sign in at `/login`.
2. Create a shipment from `/dashboard` and assign a driver. A tracking number
   (`PE-10001`, `PE-10002`, ...) is issued by the database, so two dispatchers can
   never create the same one.
3. Give the customer that number for `/track`.
4. The driver opens the phone app, taps `Start Shift`, and the customer sees status
   and position updates.
5. Website form submissions land in the dashboard's quote inbox and are emailed
   through Cloudflare Email Service to `petrucking96@gmail.com`. Reply to that
   email to reach the customer.

The dashboard and tracking page refresh themselves on a timer, so a status change
shows up without anyone reloading.

## Driver Mobile App

An Expo project in `mobile`.

```bash
cd mobile
npm install
npm run start
```

Copy `mobile/.env.example` to `mobile/.env` and set `EXPO_PUBLIC_API_URL` to the
site address. Drivers sign in with the same login as the website, pick an assigned
shipment, tap `Start Shift`, and send GPS updates while the app is open.

## Included Pages

- `/`
- `/services`
- `/quotes`
- `/track`
- `/login`
- `/dashboard`
- `/vehicle-transport-quotes`
- `/power-washing-quotes`
- `/washout-pricing`
- `/moving-services`
- `/careers`
- `/contact`

## Notes

- Forms post to `/api/quotes` and are stored in D1. Real submissions are also
  emailed with Cloudflare Email Service to `NOTIFY_EMAIL`
  (`petrucking96@gmail.com`). The sender (`NOTIFY_FROM`) must be an address on a
  domain in this Cloudflare account with Email Routing enabled, and that Gmail
  address must be a verified destination. Reply-To is the customer's address
  when they left one. Honeypot and too-fast submissions are dropped and not
  emailed.
- "Upload" fields capture file names as submitted text context; binary file
  storage is not configured.
- Database schema and demo data live in `db/`, the API in `worker/`, and setup
  scripts in `scripts/`.
