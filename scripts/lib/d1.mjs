import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pbkdf2Sync, randomBytes, randomUUID } from "node:crypto";

export const DATABASE_NAME = "polley-enterprise";

/**
 * Mirrors the PBKDF2 settings the Worker uses in worker/lib/crypto.ts, so a
 * password created here verifies at login.
 */
export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, Buffer.from(salt, "hex"), 100_000, 32, "sha256").toString("hex");
  return { hash, salt };
}

export function newId() {
  return randomUUID();
}

export function sqlLiteral(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** Runs SQL through wrangler so we use the same credentials as deploys. */
export function runSql(sql, { local = false, quiet = true } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "polley-sql-"));
  const file = join(dir, "statement.sql");
  writeFileSync(file, sql, "utf8");

  try {
    const result = spawnSync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      [
        "wrangler",
        "d1",
        "execute",
        DATABASE_NAME,
        local ? "--local" : "--remote",
        "--file",
        file,
        "--json",
      ],
      { encoding: "utf8", shell: process.platform === "win32" }
    );

    if (result.status !== 0) {
      const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
      throw new Error(`wrangler d1 execute failed:\n${output}`);
    }

    if (!quiet && result.stderr) process.stderr.write(result.stderr);

    const jsonStart = result.stdout.indexOf("[");
    if (jsonStart === -1) return [];
    try {
      return JSON.parse(result.stdout.slice(jsonStart));
    } catch {
      return [];
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function applySchema({ local = false } = {}) {
  const args = [
    "wrangler",
    "d1",
    "execute",
    DATABASE_NAME,
    local ? "--local" : "--remote",
    "--file",
    "db/schema.sql",
  ];

  const result = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", args, {
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    throw new Error(`Could not apply schema:\n${result.stdout ?? ""}${result.stderr ?? ""}`);
  }
}

export function upsertUser({ email, password, fullName, role, phone = null, local = false }) {
  const { hash, salt } = hashPassword(password);
  const normalizedEmail = email.trim().toLowerCase();

  const sql = `
insert into users (id, email, password_hash, password_salt, full_name, phone, role)
values (
  ${sqlLiteral(newId())},
  ${sqlLiteral(normalizedEmail)},
  ${sqlLiteral(hash)},
  ${sqlLiteral(salt)},
  ${sqlLiteral(fullName)},
  ${sqlLiteral(phone)},
  ${sqlLiteral(role)}
)
on conflict(email) do update set
  password_hash = excluded.password_hash,
  password_salt = excluded.password_salt,
  full_name = excluded.full_name,
  phone = excluded.phone,
  role = excluded.role,
  is_active = 1,
  updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now');
`;

  runSql(sql, { local });
  return { email: normalizedEmail, role };
}
