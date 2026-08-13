import { newId } from "../lib/crypto";
import { badRequest, forbidden, json, notFound, optionalStr, readJson, str } from "../lib/http";
import { isDispatch, type Env, type SessionUser } from "../types";

const KNOWN_FIELDS = new Set([
  "form",
  "fullName",
  "email",
  "phone",
  "inquiryType",
  "location",
  "preferredDate",
  "details",
  "companyWebsite",
  "submittedAt",
]);

/** Public form intake. Everything a customer submits lands in the database. */
export async function submitQuote(request: Request, env: Env) {
  const body = await readJson(request);
  if (!body) return badRequest();

  // Honeypot: the field is hidden, so only a bot fills it in.
  const honeypot = str(body.companyWebsite, 200);
  const startedAt = Number.parseInt(String(body.submittedAt ?? ""), 10);
  const tooFast = Number.isFinite(startedAt) && Date.now() - startedAt < 2500;

  if (honeypot.length > 0 || tooFast) {
    // Report success without storing, so spam tools get no useful signal.
    return json({ ok: true });
  }

  const fullName = str(body.fullName, 160);
  const email = optionalStr(body.email, 200);
  const phone = optionalStr(body.phone, 40);
  const details = optionalStr(body.details, 2000);

  if (!fullName) return badRequest("Please add your name.");
  if (!email && !phone) return badRequest("Please add a phone number or an email so we can reply.");

  // Anything a specific form sends beyond the shared fields is kept as JSON so
  // no answer is ever silently dropped.
  const extra: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    if (!KNOWN_FIELDS.has(key) && value !== null && value !== undefined && value !== "") {
      extra[key] = String(value).slice(0, 500);
    }
  }

  await env.DB.prepare(
    `insert into quote_requests (
       id, form, full_name, email, phone, inquiry_type, location, preferred_date, details, extra
     ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      newId(),
      str(body.form, 60) || "quote",
      fullName,
      email,
      phone,
      optionalStr(body.inquiryType, 120),
      optionalStr(body.location, 160),
      optionalStr(body.preferredDate, 60),
      details,
      Object.keys(extra).length > 0 ? JSON.stringify(extra) : null
    )
    .run();

  return json({ ok: true }, { status: 201 });
}

export async function listQuotes(env: Env, user: SessionUser, url: URL) {
  if (!isDispatch(user.role)) return forbidden("Only dispatch can view requests.");

  const status = url.searchParams.get("status");
  const query =
    status && ["new", "contacted", "closed"].includes(status)
      ? env.DB.prepare(
          `select * from quote_requests where status = ? order by created_at desc limit 200`
        ).bind(status)
      : env.DB.prepare(`select * from quote_requests order by created_at desc limit 200`);

  const { results } = await query.all();
  return json({ ok: true, requests: results ?? [] });
}

export async function updateQuote(request: Request, env: Env, user: SessionUser, id: string) {
  if (!isDispatch(user.role)) return forbidden("Only dispatch can update requests.");

  const body = await readJson(request);
  const status = str(body?.status, 20);
  if (!["new", "contacted", "closed"].includes(status)) {
    return badRequest("Status must be new, contacted, or closed.");
  }

  const result = await env.DB.prepare(`update quote_requests set status = ? where id = ?`)
    .bind(status, id)
    .run();

  if (!result.meta.changes) return notFound("Request not found.");
  return json({ ok: true });
}
