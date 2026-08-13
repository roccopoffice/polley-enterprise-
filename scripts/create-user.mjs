#!/usr/bin/env node
import { randomBytes } from "node:crypto";
import { upsertUser } from "./lib/d1.mjs";

const ROLES = new Set(["admin", "dispatcher", "employee"]);

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "local") {
      args.local = true;
      continue;
    }
    args[key] = argv[i + 1];
    i += 1;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

if (!args.email || !args.name) {
  console.log(`
Create or update an employee login.

  npm run users:create -- --email owner@polleyenterprise.com --name "Owner Name" --role admin
  npm run users:create -- --email driver@polleyenterprise.com --name "Driver Name" --role employee --password "chosen-password"

Options
  --email     required
  --name      required
  --role      admin | dispatcher | employee   (default: employee)
  --password  optional; a strong one is generated and printed if omitted
  --phone     optional
  --local     write to the local test database instead of Cloudflare
`);
  process.exit(1);
}

const role = (args.role ?? "employee").toLowerCase();
if (!ROLES.has(role)) {
  console.error(`Role must be one of: ${[...ROLES].join(", ")}`);
  process.exit(1);
}

const generated = !args.password;
const password = args.password ?? randomBytes(12).toString("base64url");

if (password.length < 10) {
  console.error("Use a password of at least 10 characters.");
  process.exit(1);
}

upsertUser({
  email: args.email,
  password,
  fullName: args.name,
  role,
  phone: args.phone ?? null,
  local: Boolean(args.local),
});

console.log(`\nLogin ready${args.local ? " (local database)" : ""}:`);
console.log(`  Email:    ${args.email.trim().toLowerCase()}`);
console.log(`  Password: ${password}${generated ? "   <- generated, save it now" : ""}`);
console.log(`  Role:     ${role}`);
console.log(`\nSign in at /login on the site.`);
