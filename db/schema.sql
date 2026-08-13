-- Polley Enterprise — Cloudflare D1 schema.
-- Safe to run more than once.

-- ---------------------------------------------------------------------------
-- Employees and logins
-- ---------------------------------------------------------------------------

create table if not exists users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  password_salt text not null,
  full_name text not null,
  phone text,
  role text not null default 'employee' check (role in ('admin', 'dispatcher', 'employee')),
  is_active integer not null default 1,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

create index if not exists users_role_idx on users (role);

-- Session ids are a SHA-256 hash of the cookie token, so a database leak does
-- not hand over usable sessions.
create table if not exists sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  expires_at text not null,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  user_agent text
);

create index if not exists sessions_user_idx on sessions (user_id);
create index if not exists sessions_expires_idx on sessions (expires_at);

-- Failed sign-ins are recorded so one address cannot be guessed forever.
create table if not exists login_attempts (
  id text primary key,
  ip text not null,
  email text,
  succeeded integer not null default 0,
  attempted_at text not null default (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

create index if not exists login_attempts_ip_idx on login_attempts (ip, attempted_at);

-- ---------------------------------------------------------------------------
-- Shipments
-- ---------------------------------------------------------------------------

-- Sequential tracking numbers, so two dispatchers can never collide.
create table if not exists counters (
  name text primary key,
  value integer not null
);

insert into counters (name, value)
select 'tracking_number', 10000
where not exists (select 1 from counters where name = 'tracking_number');

create table if not exists shipments (
  id text primary key,
  tracking_number text not null unique,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  service_type text not null check (service_type in (
    'vehicle_transport',
    'freight_hauling',
    'courier',
    'hot_shot',
    'black_truck_service',
    'luxury_car_cleaning',
    'eighteen_wheeler_cleaning',
    'personnel_transport',
    'moving_services',
    'power_washing',
    'trailer_washout'
  )),
  status text not null default 'created' check (status in (
    'created',
    'assigned',
    'shift_started',
    'picked_up',
    'in_transit',
    'arrived',
    'delivered',
    'delayed',
    'cancelled'
  )),
  pickup_city text not null,
  pickup_state text not null default 'TX',
  dropoff_city text not null,
  dropoff_state text not null default 'TX',
  pickup_address text,
  dropoff_address text,
  scheduled_for text,
  assigned_employee_id text references users(id) on delete set null,
  public_notes text,
  internal_notes text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

create index if not exists shipments_tracking_idx on shipments (tracking_number);
create index if not exists shipments_assigned_idx on shipments (assigned_employee_id);
create index if not exists shipments_status_idx on shipments (status);
create index if not exists shipments_updated_idx on shipments (updated_at desc);

create table if not exists shipment_events (
  id text primary key,
  shipment_id text not null references shipments(id) on delete cascade,
  actor_id text references users(id) on delete set null,
  status text not null,
  title text not null,
  message text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

create index if not exists shipment_events_shipment_idx
  on shipment_events (shipment_id, created_at desc);

create table if not exists shift_sessions (
  id text primary key,
  shipment_id text not null references shipments(id) on delete cascade,
  employee_id text not null references users(id) on delete cascade,
  started_at text not null default (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  ended_at text,
  is_active integer not null default 1
);

create index if not exists shift_sessions_employee_idx
  on shift_sessions (employee_id, is_active);

-- One open shift per driver per shipment.
create unique index if not exists shift_sessions_one_active_idx
  on shift_sessions (employee_id, shipment_id)
  where is_active = 1;

create table if not exists location_pings (
  id text primary key,
  shipment_id text not null references shipments(id) on delete cascade,
  employee_id text not null references users(id) on delete cascade,
  latitude real not null,
  longitude real not null,
  speed real,
  heading real,
  recorded_at text not null default (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

create index if not exists location_pings_shipment_idx
  on location_pings (shipment_id, recorded_at desc);

-- ---------------------------------------------------------------------------
-- Customer form submissions (replaces the old hosted form service)
-- ---------------------------------------------------------------------------

create table if not exists quote_requests (
  id text primary key,
  form text not null default 'quote',
  full_name text not null,
  email text,
  phone text,
  inquiry_type text,
  location text,
  preferred_date text,
  details text,
  extra text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

create index if not exists quote_requests_created_idx on quote_requests (created_at desc);
create index if not exists quote_requests_status_idx on quote_requests (status);
