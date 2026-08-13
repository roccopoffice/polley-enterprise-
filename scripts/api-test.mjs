#!/usr/bin/env node
/**
 * End-to-end check of the Worker API.
 *
 *   npx wrangler dev            (in one terminal)
 *   npm run api:test            (in another)
 *
 * Pass a different base URL to test a deployed site:
 *   npm run api:test -- https://polley-enterprise.workers.dev
 *
 * Against a local dev server the script seeds its own test accounts. Against a
 * deployed site it only runs the checks that need no seeding.
 */
import { applySchema, runSql, upsertUser } from "./lib/d1.mjs";

const baseUrl = (process.argv[2] ?? "http://127.0.0.1:8787").replace(/\/$/, "");
const isLocal = /127\.0\.0\.1|localhost/.test(baseUrl);

const ADMIN = { email: "test-admin@polleyenterprise.com", password: "test-admin-password-1" };
const DRIVER = { email: "test-driver@polleyenterprise.com", password: "test-driver-password-1" };
const OTHER_DRIVER = { email: "test-driver2@polleyenterprise.com", password: "test-driver2-password-1" };

let passed = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  ok   ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function call(path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  return { status: response.status, data, headers: response.headers };
}

async function login(account) {
  const result = await call("/api/auth/login", { method: "POST", body: account });
  return result;
}

async function main() {
  console.log(`\nTesting ${baseUrl}\n`);

  const health = await call("/api/health");
  if (health.status !== 200) {
    console.error(`The API is not responding at ${baseUrl}. Start it with: npx wrangler dev`);
    process.exit(1);
  }
  check("health endpoint responds", health.data?.ok === true);

  if (isLocal) {
    console.log("\nSeeding local test data");
    applySchema({ local: true });
    // Start from a clean slate so repeat runs are identical.
    runSql(
      `delete from shipments where customer_name like 'API Test%';
       delete from quote_requests where full_name like 'API Test%';
       delete from login_attempts;`,
      { local: true }
    );
    upsertUser({ email: ADMIN.email, password: ADMIN.password, fullName: "API Test Admin", role: "admin", local: true });
    upsertUser({ email: DRIVER.email, password: DRIVER.password, fullName: "API Test Driver", role: "employee", local: true });
    upsertUser({ email: OTHER_DRIVER.email, password: OTHER_DRIVER.password, fullName: "API Test Driver Two", role: "employee", local: true });
  }

  console.log("\nPublic form intake");
  const quote = await call("/api/quotes", {
    method: "POST",
    body: {
      form: "quote",
      fullName: "API Test Customer",
      email: "customer@example.com",
      phone: "832-555-0100",
      inquiryType: "Freight / Hauling",
      location: "Houston, TX",
      details: "Testing the intake endpoint.",
      submittedAt: Date.now() - 10_000,
    },
  });
  check("quote request is accepted", quote.status === 201, `status ${quote.status}`);

  const missingContact = await call("/api/quotes", {
    method: "POST",
    body: { fullName: "API Test NoContact", details: "no way to reach me", submittedAt: Date.now() - 10_000 },
  });
  check("quote without phone or email is rejected", missingContact.status === 400);

  const spam = await call("/api/quotes", {
    method: "POST",
    body: {
      fullName: "API Test Spam",
      email: "spam@example.com",
      details: "spam",
      companyWebsite: "http://spam.example",
      submittedAt: Date.now() - 10_000,
    },
  });
  check("honeypot submission is silently dropped", spam.status === 200);

  console.log("\nAuthentication");
  const badLogin = await login({ email: ADMIN.email, password: "wrong-password" });
  check("wrong password is rejected", badLogin.status === 401);

  const unknownUser = await login({ email: "nobody@example.com", password: "whatever-password" });
  check(
    "unknown email gives the same message as a wrong password",
    unknownUser.status === 401 && unknownUser.data?.error === badLogin.data?.error
  );

  const noAuth = await call("/api/shipments");
  check("shipment list requires a login", noAuth.status === 401);

  if (!isLocal) {
    console.log("\nSkipping signed-in checks: they need the local test accounts.");
    summarize();
    return;
  }

  const adminLogin = await login(ADMIN);
  check("admin can sign in", adminLogin.status === 200 && Boolean(adminLogin.data?.token));
  const setCookie = adminLogin.headers.get("set-cookie") ?? "";
  check(
    "session cookie is HttpOnly, Secure and SameSite",
    setCookie.includes("HttpOnly") && setCookie.includes("Secure") && setCookie.includes("SameSite=Lax"),
    setCookie
  );
  const adminToken = adminLogin.data?.token;

  const roster = await call("/api/employees", { token: adminToken });
  check("admin can read the roster", roster.status === 200 && Array.isArray(roster.data?.employees));
  const driver = roster.data?.employees?.find((row) => row.email === DRIVER.email);
  const otherDriver = roster.data?.employees?.find((row) => row.email === OTHER_DRIVER.email);
  check("roster includes the test driver", Boolean(driver));

  console.log("\nDispatch");
  const created = await call("/api/shipments", {
    method: "POST",
    token: adminToken,
    body: {
      customerName: "API Test Customer",
      customerPhone: "832-555-0101",
      serviceType: "hot_shot",
      pickupCity: "Houston",
      dropoffCity: "Austin",
      pickupAddress: "1200 Private Pickup Rd",
      assignedEmployeeId: driver?.id,
      publicNotes: "Driver assigned.",
      internalNotes: "Internal only.",
    },
  });
  check("dispatch can create a shipment", created.status === 201, `status ${created.status}`);
  const shipment = created.data?.shipment;
  check("tracking number is generated", /^PE-\d+$/.test(shipment?.tracking_number ?? ""), shipment?.tracking_number);
  check("assigning a driver sets status to assigned", shipment?.status === "assigned");

  const secondCreated = await call("/api/shipments", {
    method: "POST",
    token: adminToken,
    body: {
      customerName: "API Test Customer Two",
      serviceType: "freight_hauling",
      pickupCity: "Houston",
      dropoffCity: "Dallas",
      assignedEmployeeId: otherDriver?.id,
    },
  });
  check(
    "tracking numbers do not repeat",
    secondCreated.data?.shipment?.tracking_number !== shipment?.tracking_number
  );

  const badService = await call("/api/shipments", {
    method: "POST",
    token: adminToken,
    body: { customerName: "API Test Bad", serviceType: "teleportation", pickupCity: "Houston", dropoffCity: "Dallas" },
  });
  check("an unknown service type is rejected", badService.status === 400);

  console.log("\nPublic tracking");
  const tracked = await call(`/api/track?number=${shipment?.tracking_number}`);
  check("tracking number returns the shipment", tracked.status === 200);
  check("tracking shows the status", tracked.data?.shipment?.status === "assigned");
  const trackedKeys = Object.keys(tracked.data?.shipment ?? {});
  check(
    "tracking hides addresses, contact details and internal notes",
    !trackedKeys.some((key) =>
      ["pickup_address", "dropoff_address", "customer_phone", "customer_email", "internal_notes", "assigned_employee_id"].includes(key)
    ),
    trackedKeys.join(", ")
  );

  const missingTracking = await call("/api/track?number=PE-000000000");
  check("unknown tracking number returns not found", missingTracking.status === 404);
  const shortTracking = await call("/api/track?number=PE");
  check("too-short tracking number is rejected", shortTracking.status === 400);

  console.log("\nDriver permissions");
  const driverLogin = await login(DRIVER);
  check("driver can sign in", driverLogin.status === 200);
  const driverToken = driverLogin.data?.token;

  const driverList = await call("/api/shipments", { token: driverToken });
  const driverShipments = driverList.data?.shipments ?? [];
  check(
    "driver only sees shipments assigned to them",
    driverShipments.length > 0 && driverShipments.every((row) => row.assigned_employee_id === driver?.id),
    `${driverShipments.length} rows`
  );

  const otherShipmentId = secondCreated.data?.shipment?.id;
  const peek = await call(`/api/shipments/${otherShipmentId}`, { token: driverToken });
  check("driver cannot open another driver's shipment", peek.status === 403, `status ${peek.status}`);

  const reassign = await call(`/api/shipments/${shipment?.id}`, {
    method: "PATCH",
    token: driverToken,
    body: { assignedEmployeeId: otherDriver?.id },
  });
  check("driver cannot reassign a shipment", reassign.status === 403);

  const rename = await call(`/api/shipments/${shipment?.id}`, {
    method: "PATCH",
    token: driverToken,
    body: { customerName: "Changed By Driver" },
  });
  check("driver cannot edit customer details", rename.status === 403);

  const earlyPing = await call(`/api/shipments/${shipment?.id}/locations`, {
    method: "POST",
    token: driverToken,
    body: { latitude: 29.76, longitude: -95.37 },
  });
  check("location is refused before the shift starts", earlyPing.status === 409, `status ${earlyPing.status}`);

  const shiftStart = await call(`/api/shipments/${shipment?.id}/shift/start`, { method: "POST", token: driverToken });
  check("driver can start a shift", shiftStart.status === 200);

  const repeatStart = await call(`/api/shipments/${shipment?.id}/shift/start`, { method: "POST", token: driverToken });
  check("starting twice does not create a second shift", repeatStart.data?.alreadyActive === true);

  const ping = await call(`/api/shipments/${shipment?.id}/locations`, {
    method: "POST",
    token: driverToken,
    body: { latitude: 29.7604, longitude: -95.3698, speed: 31 },
  });
  check("driver can send a location during a shift", ping.status === 200);

  const badPing = await call(`/api/shipments/${shipment?.id}/locations`, {
    method: "POST",
    token: driverToken,
    body: { latitude: 999, longitude: -95.37 },
  });
  check("impossible coordinates are rejected", badPing.status === 400);

  const statusUpdate = await call(`/api/shipments/${shipment?.id}`, {
    method: "PATCH",
    token: driverToken,
    body: { status: "in_transit", eventMessage: "Rolling on I-10." },
  });
  check("driver can update status", statusUpdate.status === 200 && statusUpdate.data?.shipment?.status === "in_transit");

  const badStatus = await call(`/api/shipments/${shipment?.id}`, {
    method: "PATCH",
    token: driverToken,
    body: { status: "teleported" },
  });
  check("an unknown status is rejected", badStatus.status === 400);

  const detail = await call(`/api/shipments/${shipment?.id}`, { token: driverToken });
  check("shipment detail includes the event history", (detail.data?.events ?? []).length >= 2);
  check("shipment detail includes the location trail", (detail.data?.locations ?? []).length >= 1);

  const publicAfterUpdate = await call(`/api/track?number=${shipment?.tracking_number}`);
  check("customer tracking reflects the driver update", publicAfterUpdate.data?.shipment?.status === "in_transit");
  check("customer tracking shows the live position", Boolean(publicAfterUpdate.data?.location));

  const shiftEnd = await call(`/api/shipments/${shipment?.id}/shift/end`, { method: "POST", token: driverToken });
  check("driver can end the shift", shiftEnd.status === 200);

  const pingAfterShift = await call(`/api/shipments/${shipment?.id}/locations`, {
    method: "POST",
    token: driverToken,
    body: { latitude: 29.9, longitude: -95.4 },
  });
  check("location is refused after the shift ends", pingAfterShift.status === 409);

  console.log("\nRequest inbox");
  const quotesForDriver = await call("/api/quotes", { token: driverToken });
  check("driver cannot read customer requests", quotesForDriver.status === 403);

  const quotesForAdmin = await call("/api/quotes", { token: adminToken });
  const storedQuote = (quotesForAdmin.data?.requests ?? []).find((row) => row.full_name === "API Test Customer");
  check("dispatch sees the submitted request", Boolean(storedQuote));
  check(
    "honeypot submission never reached the database",
    !(quotesForAdmin.data?.requests ?? []).some((row) => row.full_name === "API Test Spam")
  );

  if (storedQuote) {
    const marked = await call(`/api/quotes/${storedQuote.id}`, {
      method: "PATCH",
      token: adminToken,
      body: { status: "contacted" },
    });
    check("dispatch can mark a request as contacted", marked.status === 200);
  }

  console.log("\nSessions");
  const meBefore = await call("/api/auth/me", { token: driverToken });
  check("session identifies the signed-in user", meBefore.data?.user?.email === DRIVER.email);

  const logout = await call("/api/auth/logout", { method: "POST", token: driverToken });
  check("logout succeeds", logout.status === 200);

  const meAfter = await call("/api/auth/me", { token: driverToken });
  check("token stops working after logout", meAfter.status === 401);

  summarize();
}

function summarize() {
  console.log(`\n${passed} checks passed, ${failures.length} failed.`);
  if (failures.length > 0) {
    console.log("\nFailures:");
    for (const failure of failures) console.log(`  - ${failure}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
