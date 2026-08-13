import { badRequest, json, notFound } from "../lib/http";
import type { Env } from "../types";

type TrackedShipment = {
  tracking_number: string;
  status: string;
  service_type: string;
  pickup_city: string;
  pickup_state: string;
  dropoff_city: string;
  dropoff_state: string;
  scheduled_for: string | null;
  public_notes: string | null;
  updated_at: string;
};

/**
 * Public endpoint. It deliberately returns nothing that a stranger with a
 * tracking number should not see: no addresses, phone numbers, internal notes,
 * or driver identity.
 */
export async function trackShipment(url: URL, env: Env) {
  const raw = (url.searchParams.get("number") ?? "").trim().toUpperCase().replace(/\s+/g, "");

  if (raw.length < 4) {
    return badRequest("Enter the full tracking number.");
  }

  const shipment = await env.DB.prepare(
    `select tracking_number, status, service_type, pickup_city, pickup_state,
            dropoff_city, dropoff_state, scheduled_for, public_notes, updated_at
       from shipments
      where tracking_number = ?`
  )
    .bind(raw)
    .first<TrackedShipment>();

  if (!shipment) {
    return notFound("We could not find that tracking number. Please double check it.");
  }

  const [events, location] = await Promise.all([
    env.DB.prepare(
      `select status, title, message, created_at
         from shipment_events
        where shipment_id = (select id from shipments where tracking_number = ?)
        order by created_at desc
        limit 12`
    )
      .bind(raw)
      .all(),
    env.DB.prepare(
      `select latitude, longitude, recorded_at
         from location_pings
        where shipment_id = (select id from shipments where tracking_number = ?)
        order by recorded_at desc
        limit 1`
    )
      .bind(raw)
      .first<{ latitude: number; longitude: number; recorded_at: string }>(),
  ]);

  const isMoving = shipment.status !== "delivered" && shipment.status !== "cancelled";

  return json({
    ok: true,
    shipment,
    events: events.results ?? [],
    // Hide the trail once a job is closed out.
    location: isMoving ? location ?? null : null,
  });
}
