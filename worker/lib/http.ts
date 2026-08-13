const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

export function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  for (const [key, value] of Object.entries(JSON_HEADERS)) {
    if (!headers.has(key)) headers.set(key, value);
  }
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function fail(status: number, message: string, extra: Record<string, unknown> = {}) {
  return json({ ok: false, error: message, ...extra }, { status });
}

export const badRequest = (message = "Invalid request.") => fail(400, message);
export const unauthorized = (message = "Please sign in.") => fail(401, message);
export const forbidden = (message = "You do not have access to that.") => fail(403, message);
export const notFound = (message = "Not found.") => fail(404, message);

export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      return (await request.json()) as T;
    }
    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const form = await request.formData();
      return Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)])) as T;
    }
    const text = await request.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    return null;
  }
}

export function str(value: unknown, max = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function optionalStr(value: unknown, max = 500) {
  const cleaned = str(value, max);
  return cleaned.length > 0 ? cleaned : null;
}

export function num(value: unknown) {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : null;
}
