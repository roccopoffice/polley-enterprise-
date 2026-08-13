const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH_BITS = 256;

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function randomHex(bytes = 32) {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)).buffer);
}

export function newId() {
  return crypto.randomUUID();
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return toHex(digest);
}

async function derive(password: string, saltHex: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: fromHex(saltHex),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    KEY_LENGTH_BITS
  );

  return toHex(bits);
}

export async function hashPassword(password: string, existingSalt?: string) {
  const salt = existingSalt ?? randomHex(16);
  return { hash: await derive(password, salt), salt };
}

/** Length-safe comparison so timing does not reveal how much of a hash matched. */
function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function verifyPassword(password: string, hash: string, salt: string) {
  const candidate = await derive(password, salt);
  return timingSafeEqual(candidate, hash);
}
