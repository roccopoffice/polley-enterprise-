# Polley Driver App

Expo starter app for Polley Enterprise employees.

## Setup

```bash
npm install
npm run start
```

Create `mobile/.env` from `.env.example`:

```bash
EXPO_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your-public-anon-key"
```

## How Tracking Works

1. Employee logs in with Supabase Auth.
2. App loads shipments assigned to that employee.
3. Employee taps `Start Shift`.
4. App requests foreground location permission.
5. App inserts GPS points into `location_pings`.
6. The website `/track` page shows the latest shipment status and location.

For true background tracking after the first version is stable, add Expo background location tasks and complete iOS/Android background permission setup.
