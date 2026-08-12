create extension if not exists pgcrypto;

create type user_role as enum ('admin', 'dispatcher', 'employee');
create type shipment_status as enum (
  'created',
  'assigned',
  'shift_started',
  'picked_up',
  'in_transit',
  'arrived',
  'delivered',
  'delayed',
  'cancelled'
);
create type service_type as enum (
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
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role user_role not null default 'employee',
  created_at timestamptz not null default now()
);

create table shipments (
  id uuid primary key default gen_random_uuid(),
  tracking_number text not null unique,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  service_type service_type not null,
  status shipment_status not null default 'created',
  pickup_city text not null,
  pickup_state text not null default 'TX',
  dropoff_city text not null,
  dropoff_state text not null default 'TX',
  pickup_address text,
  dropoff_address text,
  scheduled_for timestamptz,
  assigned_employee_id uuid references profiles(id) on delete set null,
  public_notes text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references shipments(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  status shipment_status not null,
  title text not null,
  message text,
  created_at timestamptz not null default now()
);

create table shift_sessions (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references shipments(id) on delete cascade,
  employee_id uuid not null references profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  is_active boolean not null default true
);

create table location_pings (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references shipments(id) on delete cascade,
  employee_id uuid not null references profiles(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  speed double precision,
  heading double precision,
  recorded_at timestamptz not null default now()
);

create index shipments_tracking_number_idx on shipments (tracking_number);
create index shipments_assigned_employee_id_idx on shipments (assigned_employee_id);
create index shipment_events_shipment_id_created_at_idx on shipment_events (shipment_id, created_at desc);
create index location_pings_shipment_id_recorded_at_idx on location_pings (shipment_id, recorded_at desc);
create index shift_sessions_employee_active_idx on shift_sessions (employee_id, is_active);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger shipments_set_updated_at
before update on shipments
for each row execute function set_updated_at();

create or replace function current_user_role()
returns user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function is_dispatch_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(current_user_role() in ('admin', 'dispatcher'), false)
$$;

create or replace function track_shipment(search_tracking_number text)
returns table (
  id uuid,
  tracking_number text,
  service_type service_type,
  status shipment_status,
  pickup_city text,
  pickup_state text,
  dropoff_city text,
  dropoff_state text,
  scheduled_for timestamptz,
  public_notes text,
  updated_at timestamptz,
  latest_event_title text,
  latest_event_message text,
  latest_event_at timestamptz,
  latitude double precision,
  longitude double precision,
  location_recorded_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    s.id,
    s.tracking_number,
    s.service_type,
    s.status,
    s.pickup_city,
    s.pickup_state,
    s.dropoff_city,
    s.dropoff_state,
    s.scheduled_for,
    s.public_notes,
    s.updated_at,
    e.title as latest_event_title,
    e.message as latest_event_message,
    e.created_at as latest_event_at,
    l.latitude,
    l.longitude,
    l.recorded_at as location_recorded_at
  from shipments s
  left join lateral (
    select title, message, created_at
    from shipment_events
    where shipment_id = s.id
    order by created_at desc
    limit 1
  ) e on true
  left join lateral (
    select latitude, longitude, recorded_at
    from location_pings
    where shipment_id = s.id
    order by recorded_at desc
    limit 1
  ) l on true
  where upper(s.tracking_number) = upper(trim(search_tracking_number))
  limit 1;
$$;

alter table profiles enable row level security;
alter table shipments enable row level security;
alter table shipment_events enable row level security;
alter table shift_sessions enable row level security;
alter table location_pings enable row level security;

create policy "profiles can read own profile"
on profiles for select
using (id = auth.uid() or is_dispatch_user());

create policy "dispatch can manage profiles"
on profiles for all
using (is_dispatch_user())
with check (is_dispatch_user());

create policy "employees read assigned shipments"
on shipments for select
using (assigned_employee_id = auth.uid() or is_dispatch_user());

create policy "dispatch can manage shipments"
on shipments for all
using (is_dispatch_user())
with check (is_dispatch_user());

create policy "employees update assigned shipment status"
on shipments for update
using (assigned_employee_id = auth.uid() or is_dispatch_user())
with check (assigned_employee_id = auth.uid() or is_dispatch_user());

create policy "employees read shipment events"
on shipment_events for select
using (
  is_dispatch_user()
  or exists (
    select 1 from shipments
    where shipments.id = shipment_events.shipment_id
    and shipments.assigned_employee_id = auth.uid()
  )
);

create policy "employees create shipment events"
on shipment_events for insert
with check (
  is_dispatch_user()
  or exists (
    select 1 from shipments
    where shipments.id = shipment_events.shipment_id
    and shipments.assigned_employee_id = auth.uid()
  )
);

create policy "employees read own shifts"
on shift_sessions for select
using (employee_id = auth.uid() or is_dispatch_user());

create policy "employees manage own shifts"
on shift_sessions for all
using (employee_id = auth.uid() or is_dispatch_user())
with check (employee_id = auth.uid() or is_dispatch_user());

create policy "employees read assigned locations"
on location_pings for select
using (
  is_dispatch_user()
  or exists (
    select 1 from shipments
    where shipments.id = location_pings.shipment_id
    and shipments.assigned_employee_id = auth.uid()
  )
);

create policy "employees write active shipment locations"
on location_pings for insert
with check (
  employee_id = auth.uid()
  and exists (
    select 1 from shift_sessions
    where shift_sessions.shipment_id = location_pings.shipment_id
    and shift_sessions.employee_id = auth.uid()
    and shift_sessions.is_active = true
  )
);

grant execute on function track_shipment(text) to anon, authenticated;
