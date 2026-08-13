import { newId } from "../lib/crypto";
import { badRequest, fail, forbidden, json, notFound, num, optionalStr, readJson, str } from "../lib/http";
import { nextTrackingNumber } from "../lib/session";
import { SQL_NOW, toIso } from "../lib/time";
import {
  SERVICE_TYPES,
  SHIPMENT_STATUSES,
  isDispatch,
  type Env,
  type SessionUser,
  type ServiceType,
  type ShipmentStatus,
} from "../types";

const statusTitles: Record<ShipmentStatus, string> = {
  created: "Created",
  assigned: "Assigned",
  shift_started: "Driver started the shift",
  picked_up: "Picked up",
  in_transit: "In transit",
  arrived: "Arrived",
  delivered: "Delivered",
  delayed: "Delayed",
  cancelled: "Cancelled",
};

function isServiceType(value: string): value is ServiceType {
  return (SERVICE_TYPES as readonly string[]).includes(value);
}

function isStatus(value: string): value is ShipmentStatus {
  return (SHIPMENT_STATUSES as readonly string[]).includes(value);
}

/** Drivers only ever see their own work; dispatch sees the whole board. */
async function loadShipmentFor(env: Env, user: SessionUser, id: string) {
  const shipment = await env.DB.prepare(`select * from shipments where id = ?`)
    .bind(id)
    .first<Record<string, unknown> & { assigned_employee_id: string | null; status: ShipmentStatus }>();

  if (!shipment) return { shipment: null, allowed: false as const };
  const allowed = isDispatch(user.role) || shipment.assigned_employee_id === user.id;
  return { shipment, allowed };
}

async function addEvent(
  env: Env,
  shipmentId: string,
  actorId: string | null,
  status: ShipmentStatus,
  title: string,
  message: string | null
) {
  await env.DB.prepare(
    `insert into shipment_events (id, shipment_id, actor_id, status, title, message)
     values (?, ?, ?, ?, ?, ?)`
  )
    .bind(newId(), shipmentId, actorId, status, title, message)
    .run();
}

export async function listShipments(env: Env, user: SessionUser) {
  const query = isDispatch(user.role)
    ? env.DB.prepare(`select * from shipments order by updated_at desc limit 200`)
    : env.DB.prepare(
        `select * from shipments where assigned_employee_id = ? order by updated_at desc limit 200`
      ).bind(user.id);

  const { results } = await query.all();
  return json({ ok: true, shipments: results ?? [] });
}

export async function shipmentDetail(env: Env, user: SessionUser, id: string) {
  const { shipment, allowed } = await loadShipmentFor(env, user, id);
  if (!shipment) return notFound("Shipment not found.");
  if (!allowed) return forbidden("That shipment is not assigned to you.");

  const [events, locations, shift] = await Promise.all([
    env.DB.prepare(
      `select * from shipment_events where shipment_id = ? order by created_at desc limit 15`
    )
      .bind(id)
      .all(),
    env.DB.prepare(
      `select * from location_pings where shipment_id = ? order by recorded_at desc limit 10`
    )
      .bind(id)
      .all(),
    env.DB.prepare(
      `select * from shift_sessions where shipment_id = ? and employee_id = ? and is_active = 1`
    )
      .bind(id, user.id)
      .first(),
  ]);

  return json({
    ok: true,
    shipment,
    events: events.results ?? [],
    locations: locations.results ?? [],
    activeShift: shift ?? null,
  });
}

export async function createShipment(request: Request, env: Env, user: SessionUser) {
  if (!isDispatch(user.role)) {
    return forbidden("Only dispatch can create shipments.");
  }

  const body = await readJson(request);
  if (!body) return badRequest();

  const customerName = str(body.customerName, 160);
  const serviceType = str(body.serviceType, 60);
  const pickupCity = str(body.pickupCity, 120);
  const dropoffCity = str(body.dropoffCity, 120);

  if (!customerName) return badRequest("Customer name is required.");
  if (!isServiceType(serviceType)) return badRequest("Choose a service type.");
  if (!pickupCity || !dropoffCity) return badRequest("Pickup and dropoff cities are required.");

  const assignedEmployeeId = optionalStr(body.assignedEmployeeId, 60);
  if (assignedEmployeeId) {
    const employee = await env.DB.prepare(`select id from users where id = ? and is_active = 1`)
      .bind(assignedEmployeeId)
      .first();
    if (!employee) return badRequest("That employee no longer exists.");
  }

  const requested = optionalStr(body.trackingNumber, 40);
  const trackingNumber = requested
    ? requested.toUpperCase().replace(/\s+/g, "")
    : await nextTrackingNumber(env);

  const id = newId();
  const status: ShipmentStatus = assignedEmployeeId ? "assigned" : "created";

  try {
    await env.DB.prepare(
      `insert into shipments (
         id, tracking_number, customer_name, customer_email, customer_phone, service_type, status,
         pickup_city, pickup_state, dropoff_city, dropoff_state, pickup_address, dropoff_address,
         scheduled_for, assigned_employee_id, public_notes, internal_notes
       ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        trackingNumber,
        customerName,
        optionalStr(body.customerEmail, 200),
        optionalStr(body.customerPhone, 40),
        serviceType,
        status,
        pickupCity,
        str(body.pickupState, 20) || "TX",
        dropoffCity,
        str(body.dropoffState, 20) || "TX",
        optionalStr(body.pickupAddress, 300),
        optionalStr(body.dropoffAddress, 300),
        toIso(body.scheduledFor),
        assignedEmployeeId,
        optionalStr(body.publicNotes, 1000),
        optionalStr(body.internalNotes, 1000)
      )
      .run();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE")) {
      return fail(409, "That tracking number is already in use.");
    }
    throw error;
  }

  await addEvent(env, id, user.id, status, statusTitles[status], "Shipment created by dispatch.");

  const shipment = await env.DB.prepare(`select * from shipments where id = ?`).bind(id).first();
  return json({ ok: true, shipment }, { status: 201 });
}

export async function updateShipment(request: Request, env: Env, user: SessionUser, id: string) {
  const { shipment, allowed } = await loadShipmentFor(env, user, id);
  if (!shipment) return notFound("Shipment not found.");
  if (!allowed) return forbidden("That shipment is not assigned to you.");

  const body = await readJson(request);
  if (!body) return badRequest();

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  const push = (column: string, value: string | number | null) => {
    updates.push(`${column} = ?`);
    values.push(value);
  };

  let nextStatus: ShipmentStatus | null = null;
  if (body.status !== undefined) {
    const status = str(body.status, 40);
    if (!isStatus(status)) return badRequest("That status is not allowed.");
    nextStatus = status;
    push("status", status);
  }

  if (body.publicNotes !== undefined) {
    push("public_notes", optionalStr(body.publicNotes, 1000));
  }

  // Drivers may report progress. Everything else — who the customer is, where
  // the load goes, who it belongs to — stays under dispatch control.
  if (isDispatch(user.role)) {
    const dispatchFields: [string, string, number][] = [
      ["customerName", "customer_name", 160],
      ["customerEmail", "customer_email", 200],
      ["customerPhone", "customer_phone", 40],
      ["pickupCity", "pickup_city", 120],
      ["pickupState", "pickup_state", 20],
      ["dropoffCity", "dropoff_city", 120],
      ["dropoffState", "dropoff_state", 20],
      ["pickupAddress", "pickup_address", 300],
      ["dropoffAddress", "dropoff_address", 300],
      ["internalNotes", "internal_notes", 1000],
    ];

    for (const [key, column, max] of dispatchFields) {
      if (body[key] !== undefined) push(column, optionalStr(body[key], max));
    }

    if (body.serviceType !== undefined) {
      const serviceType = str(body.serviceType, 60);
      if (!isServiceType(serviceType)) return badRequest("Choose a valid service type.");
      push("service_type", serviceType);
    }

    if (body.scheduledFor !== undefined) push("scheduled_for", toIso(body.scheduledFor));

    if (body.assignedEmployeeId !== undefined) {
      const assignedEmployeeId = optionalStr(body.assignedEmployeeId, 60);
      if (assignedEmployeeId) {
        const employee = await env.DB.prepare(`select id from users where id = ? and is_active = 1`)
          .bind(assignedEmployeeId)
          .first();
        if (!employee) return badRequest("That employee no longer exists.");
      }
      push("assigned_employee_id", assignedEmployeeId);
    }
  } else {
    const blocked = [
      "customerName",
      "customerEmail",
      "customerPhone",
      "pickupCity",
      "dropoffCity",
      "pickupAddress",
      "dropoffAddress",
      "serviceType",
      "scheduledFor",
      "assignedEmployeeId",
      "internalNotes",
      "trackingNumber",
    ].filter((key) => body[key] !== undefined);

    if (blocked.length > 0) {
      return forbidden("Drivers can update status and customer notes only.");
    }
  }

  if (updates.length === 0) return badRequest("Nothing to update.");

  await env.DB.prepare(
    `update shipments set ${updates.join(", ")}, updated_at = ${SQL_NOW} where id = ?`
  )
    .bind(...values, id)
    .run();

  if (nextStatus) {
    await addEvent(
      env,
      id,
      user.id,
      nextStatus,
      statusTitles[nextStatus],
      optionalStr(body.eventMessage, 500)
    );
  }

  const updated = await env.DB.prepare(`select * from shipments where id = ?`).bind(id).first();
  return json({ ok: true, shipment: updated });
}

export async function startShift(env: Env, user: SessionUser, id: string) {
  const { shipment, allowed } = await loadShipmentFor(env, user, id);
  if (!shipment) return notFound("Shipment not found.");
  if (!allowed) return forbidden("That shipment is not assigned to you.");

  const existing = await env.DB.prepare(
    `select id from shift_sessions where shipment_id = ? and employee_id = ? and is_active = 1`
  )
    .bind(id, user.id)
    .first<{ id: string }>();

  if (existing) {
    return json({ ok: true, shiftId: existing.id, alreadyActive: true });
  }

  const shiftId = newId();
  await env.DB.batch([
    env.DB.prepare(
      `insert into shift_sessions (id, shipment_id, employee_id) values (?, ?, ?)`
    ).bind(shiftId, id, user.id),
    env.DB.prepare(
      `update shipments set status = 'shift_started', updated_at = ${SQL_NOW} where id = ?`
    ).bind(id),
  ]);

  await addEvent(env, id, user.id, "shift_started", statusTitles.shift_started, null);
  return json({ ok: true, shiftId });
}

export async function endShift(env: Env, user: SessionUser, id: string) {
  const { shipment, allowed } = await loadShipmentFor(env, user, id);
  if (!shipment) return notFound("Shipment not found.");
  if (!allowed) return forbidden("That shipment is not assigned to you.");

  const result = await env.DB.prepare(
    `update shift_sessions
        set is_active = 0, ended_at = ${SQL_NOW}
      where shipment_id = ? and employee_id = ? and is_active = 1`
  )
    .bind(id, user.id)
    .run();

  if (!result.meta.changes) {
    return badRequest("No shift is running for this shipment.");
  }

  await addEvent(env, id, user.id, shipment.status, "Driver ended the shift", null);
  return json({ ok: true });
}

export async function recordLocation(request: Request, env: Env, user: SessionUser, id: string) {
  const { shipment, allowed } = await loadShipmentFor(env, user, id);
  if (!shipment) return notFound("Shipment not found.");
  if (!allowed) return forbidden("That shipment is not assigned to you.");

  const body = await readJson(request);
  if (!body) return badRequest();

  const latitude = num(body.latitude);
  const longitude = num(body.longitude);

  if (latitude === null || longitude === null) return badRequest("Latitude and longitude are required.");
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return badRequest("Those coordinates are out of range.");
  }

  // GPS is only accepted while a shift is running, so the app cannot keep
  // reporting a driver's position after they clock out.
  const shift = await env.DB.prepare(
    `select id from shift_sessions where shipment_id = ? and employee_id = ? and is_active = 1`
  )
    .bind(id, user.id)
    .first();

  if (!shift) return fail(409, "Start your shift before sending location updates.");

  await env.DB.prepare(
    `insert into location_pings (id, shipment_id, employee_id, latitude, longitude, speed, heading)
     values (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(newId(), id, user.id, latitude, longitude, num(body.speed), num(body.heading))
    .run();

  return json({ ok: true });
}

export async function listEmployees(env: Env, user: SessionUser) {
  if (!isDispatch(user.role)) return forbidden("Only dispatch can view the roster.");

  const { results } = await env.DB.prepare(
    `select id, full_name, email, phone, role from users where is_active = 1 order by full_name`
  ).all();

  return json({ ok: true, employees: results ?? [] });
}
