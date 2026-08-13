import { fail, json, notFound, unauthorized } from "./lib/http";
import { currentUser } from "./lib/session";
import { changePassword, login, logout, me } from "./routes/auth";
import { listQuotes, submitQuote, updateQuote } from "./routes/quotes";
import {
  createShipment,
  endShift,
  listEmployees,
  listShipments,
  recordLocation,
  shipmentDetail,
  startShift,
  updateShipment,
} from "./routes/shipments";
import { trackShipment } from "./routes/tracking";
import type { Env, SessionUser } from "./types";

/**
 * The driver app authenticates with a bearer token, so cross-origin reads are
 * allowed. Credentials are never allowed cross-origin, which keeps the
 * cookie-based website session same-origin only.
 */
const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PATCH, OPTIONS",
  "access-control-allow-headers": "content-type, authorization",
  "access-control-max-age": "86400",
};

async function handleApi(request: Request, env: Env, url: URL): Promise<Response> {
  const method = request.method.toUpperCase();
  const segments = url.pathname.replace(/^\/api\/?/, "").replace(/\/$/, "").split("/").filter(Boolean);
  const [resource, second, third, fourth] = segments;

  if (resource === "health") {
    return json({ ok: true, service: "polley-enterprise", time: new Date().toISOString() });
  }

  // ---- Public ----------------------------------------------------------
  if (resource === "track" && method === "GET") {
    return trackShipment(url, env);
  }

  if (resource === "quotes" && method === "POST") {
    return submitQuote(request, env);
  }

  if (resource === "auth" && second === "login" && method === "POST") {
    return login(request, env);
  }

  if (resource === "auth" && second === "logout" && method === "POST") {
    return logout(request, env);
  }

  // ---- Signed in -------------------------------------------------------
  const user: SessionUser | null = await currentUser(env, request);
  if (!user) return unauthorized();

  if (resource === "auth" && second === "me" && method === "GET") {
    return me(request, env);
  }

  if (resource === "auth" && second === "password" && method === "POST") {
    return changePassword(request, env);
  }

  if (resource === "employees" && method === "GET") {
    return listEmployees(env, user);
  }

  if (resource === "quotes") {
    if (method === "GET" && !second) return listQuotes(env, user, url);
    if (method === "PATCH" && second) return updateQuote(request, env, user, second);
  }

  if (resource === "shipments") {
    if (!second) {
      if (method === "GET") return listShipments(env, user);
      if (method === "POST") return createShipment(request, env, user);
    } else if (!third) {
      if (method === "GET") return shipmentDetail(env, user, second);
      if (method === "PATCH") return updateShipment(request, env, user, second);
    } else if (third === "shift" && method === "POST") {
      if (fourth === "start") return startShift(env, user, second);
      if (fourth === "end") return endShift(env, user, second);
    } else if (third === "locations" && method === "POST") {
      return recordLocation(request, env, user, second);
    }
  }

  return notFound("Unknown endpoint.");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    if (request.method.toUpperCase() === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    let response: Response;
    try {
      response = await handleApi(request, env, url);
    } catch (error) {
      console.error("API error", error);
      response = fail(500, "Something went wrong on our side. Please try again.");
    }

    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value);
    return new Response(response.body, { status: response.status, headers });
  },
} satisfies ExportedHandler<Env>;
