-- Optional demo shipments so the tracking page has something to show.
-- Safe to run more than once.

insert into shipments (
  id, tracking_number, customer_name, customer_phone, service_type, status,
  pickup_city, pickup_state, dropoff_city, dropoff_state, public_notes
)
select
  'demo-shipment-1', 'PE-DEMO1', 'Demo Customer', '832-960-4471', 'hot_shot', 'in_transit',
  'Houston', 'TX', 'Dallas', 'TX', 'Driver is en route. Updates post here automatically.'
where not exists (select 1 from shipments where tracking_number = 'PE-DEMO1');

insert into shipments (
  id, tracking_number, customer_name, customer_phone, service_type, status,
  pickup_city, pickup_state, dropoff_city, dropoff_state, public_notes
)
select
  'demo-shipment-2', 'PE-DEMO2', 'Demo Fleet Account', '832-960-4471', 'trailer_washout', 'created',
  'Houston', 'TX', 'Houston', 'TX', 'Washout scheduled. We will confirm the bay time.'
where not exists (select 1 from shipments where tracking_number = 'PE-DEMO2');

insert into shipment_events (id, shipment_id, status, title, message)
select
  'demo-event-1', 'demo-shipment-1', 'in_transit', 'Load picked up', 'Driver left the Houston yard.'
where not exists (select 1 from shipment_events where id = 'demo-event-1');
