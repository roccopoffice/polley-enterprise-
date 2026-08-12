# Polley Enterprise Website

Production-ready Next.js 15 App Router site for Polley Enterprise, a Houston, TX transportation and service company.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Netlify Forms (form submissions)
- Supabase (employee auth, shipment database, live tracking)
- Framer Motion

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy by Drag-and-Drop to Netlify

1. Build static files:

```bash
npm install
npm run build
```

2. After build completes, drag the generated `out` folder into Netlify Drop.

That is it. No server runtime required.

## Environment Variables

Marketing pages and Netlify forms still work as static files. The fleet tracking system requires:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-public-anon-key"
```

Add the same values in Netlify environment variables before deploying the tracking dashboard.

## Included Pages

- `/`
- `/services`
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

- Forms are wired to Netlify Forms with honeypot field (`companyWebsite`) and client-side validation.
- "Upload" fields capture file names as submitted text context (binary file storage is not configured).
- Supabase setup SQL is in `supabase/schema.sql`.
- The native driver app starter is in `mobile`.

## Fleet Tracking Setup

1. Create a Supabase project.
2. Open the Supabase SQL editor and run `supabase/schema.sql`.
3. Create employee users in Supabase Auth.
4. Add matching rows in the `profiles` table with `admin`, `dispatcher`, or `employee` roles.
5. Add the Supabase URL and anon key to Netlify.
6. Use `/dashboard` as admin/dispatch to create shipments and assign employees.
7. Give customers the generated tracking number and send them to `/track`.

## Driver Mobile App

The mobile app is an Expo project in `mobile`.

```bash
cd mobile
npm install
npm run start
```

Copy `mobile/.env.example` to `mobile/.env` and add the same Supabase URL and anon key. Drivers can log in, choose an assigned shipment, tap `Start Shift`, and send GPS updates while tracking is active.
