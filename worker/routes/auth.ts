import { hashPassword, newId, verifyPassword } from "../lib/crypto";
import { badRequest, fail, json, readJson, str, unauthorized } from "../lib/http";
import { clearedCookie, createSession, currentUser, endSession, pruneSessions, sessionCookie } from "../lib/session";
import { SQL_NOW } from "../lib/time";
import type { Env, UserRow } from "../types";

const MAX_FAILURES = 10;
const LOCKOUT_MINUTES = 10;

function clientIp(request: Request) {
  return request.headers.get("cf-connecting-ip") ?? "unknown";
}

async function recordAttempt(env: Env, ip: string, email: string, succeeded: boolean) {
  await env.DB.batch([
    env.DB.prepare(
      `insert into login_attempts (id, ip, email, succeeded) values (?, ?, ?, ?)`
    ).bind(newId(), ip, email.slice(0, 200), succeeded ? 1 : 0),
    env.DB.prepare(
      `delete from login_attempts where attempted_at < strftime('%Y-%m-%dT%H:%M:%SZ','now','-1 day')`
    ),
  ]);
}

export async function login(request: Request, env: Env) {
  const body = await readJson(request);
  if (!body) return badRequest();

  const email = str(body.email, 200).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const ip = clientIp(request);

  if (!email || !password) {
    return badRequest("Enter your email and password.");
  }

  const recent = await env.DB.prepare(
    `select count(*) as failures
       from login_attempts
      where ip = ?
        and succeeded = 0
        and attempted_at > strftime('%Y-%m-%dT%H:%M:%SZ','now','-${LOCKOUT_MINUTES} minutes')`
  )
    .bind(ip)
    .first<{ failures: number }>();

  if ((recent?.failures ?? 0) >= MAX_FAILURES) {
    return fail(429, `Too many attempts. Please wait ${LOCKOUT_MINUTES} minutes and try again.`);
  }

  const user = await env.DB.prepare(`select * from users where email = ?`)
    .bind(email)
    .first<UserRow>();

  // Same response for unknown email and wrong password, so the form cannot be
  // used to discover which addresses are real.
  const invalid = unauthorized("Email or password is incorrect.");
  if (!user || user.is_active !== 1) {
    await recordAttempt(env, ip, email, false);
    return invalid;
  }

  const matches = await verifyPassword(password, user.password_hash, user.password_salt);
  if (!matches) {
    await recordAttempt(env, ip, email, false);
    return invalid;
  }

  await recordAttempt(env, ip, email, true);
  const { token } = await createSession(env, user.id, request.headers.get("user-agent"));
  await pruneSessions(env);

  return json(
    {
      ok: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
      },
    },
    { headers: { "set-cookie": sessionCookie(token, env) } }
  );
}

export async function logout(request: Request, env: Env) {
  await endSession(env, request);
  return json({ ok: true }, { headers: { "set-cookie": clearedCookie() } });
}

export async function me(request: Request, env: Env) {
  const user = await currentUser(env, request);
  if (!user) return unauthorized();
  return json({ ok: true, user });
}

export async function changePassword(request: Request, env: Env) {
  const user = await currentUser(env, request);
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (!body) return badRequest();

  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (newPassword.length < 10) {
    return badRequest("Use at least 10 characters for the new password.");
  }

  const row = await env.DB.prepare(`select * from users where id = ?`)
    .bind(user.id)
    .first<UserRow>();
  if (!row) return unauthorized();

  const matches = await verifyPassword(currentPassword, row.password_hash, row.password_salt);
  if (!matches) return fail(403, "Current password is incorrect.");

  const { hash, salt } = await hashPassword(newPassword);
  await env.DB.batch([
    env.DB.prepare(
      `update users set password_hash = ?, password_salt = ?, updated_at = ${SQL_NOW} where id = ?`
    ).bind(hash, salt, user.id),
    // Signing out everywhere is the safe default after a password change.
    env.DB.prepare(`delete from sessions where user_id = ?`).bind(user.id),
  ]);

  return json({ ok: true }, { headers: { "set-cookie": clearedCookie() } });
}
