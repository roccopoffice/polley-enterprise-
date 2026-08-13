import { newId, randomHex, sha256Hex } from "./crypto";
import { SQL_NOW, isoSeconds } from "./time";
import type { Env, SessionUser } from "../types";

export const SESSION_COOKIE = "pe_session";
const DEFAULT_SESSION_HOURS = 12;

function sessionHours(env: Env) {
  const parsed = Number.parseInt(env.SESSION_HOURS ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SESSION_HOURS;
}

function serializeCookie(value: string, maxAgeSeconds: number) {
  return [
    `${SESSION_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ].join("; ");
}

export function sessionCookie(token: string, env: Env) {
  return serializeCookie(token, sessionHours(env) * 3600);
}

export function clearedCookie() {
  return serializeCookie("", 0);
}

function tokenFromRequest(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) return rest.join("=");
  }
  return null;
}

export async function createSession(env: Env, userId: string, userAgent: string | null) {
  const token = randomHex(32);
  const expiresAt = isoSeconds(new Date(Date.now() + sessionHours(env) * 3600 * 1000));

  await env.DB.prepare(
    `insert into sessions (id, user_id, expires_at, user_agent) values (?, ?, ?, ?)`
  )
    .bind(await sha256Hex(token), userId, expiresAt, userAgent?.slice(0, 200) ?? null)
    .run();

  return { token, expiresAt };
}

export async function currentUser(env: Env, request: Request): Promise<SessionUser | null> {
  const token = tokenFromRequest(request);
  if (!token) return null;

  const row = await env.DB.prepare(
    `select u.id, u.email, u.full_name, u.phone, u.role
       from sessions s
       join users u on u.id = s.user_id
      where s.id = ?
        and s.expires_at > ${SQL_NOW}
        and u.is_active = 1`
  )
    .bind(await sha256Hex(token))
    .first<SessionUser>();

  return row ?? null;
}

export async function endSession(env: Env, request: Request) {
  const token = tokenFromRequest(request);
  if (!token) return;
  await env.DB.prepare(`delete from sessions where id = ?`).bind(await sha256Hex(token)).run();
}

/** Housekeeping so expired rows do not pile up. */
export async function pruneSessions(env: Env) {
  await env.DB.prepare(`delete from sessions where expires_at <= ${SQL_NOW}`).run();
}

export async function nextTrackingNumber(env: Env) {
  const row = await env.DB.prepare(
    `update counters set value = value + 1 where name = 'tracking_number' returning value`
  ).first<{ value: number }>();

  if (row) return `PE-${row.value}`;

  // Counter row missing (fresh database): create it, then retry once.
  await env.DB.prepare(
    `insert into counters (name, value) values ('tracking_number', 10001)`
  ).run();
  return "PE-10001";
}

export { newId };
