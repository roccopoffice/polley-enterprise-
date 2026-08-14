import type { Env } from "../types";

export type QuoteNotice = {
  form: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  inquiryType: string | null;
  location: string | null;
  preferredDate: string | null;
  details: string | null;
  extra: Record<string, string>;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formLabel(form: string) {
  const labels: Record<string, string> = {
    quote: "Quote request",
    contact: "Contact message",
    careers: "Job application",
    "vehicle-transport": "Vehicle transport quote",
    "power-washing": "Power washing quote",
  };
  return labels[form] ?? form;
}

function line(label: string, value: string | null) {
  if (!value) return "";
  return `${label}: ${value}\n`;
}

function row(label: string, value: string | null) {
  if (!value) return "";
  return `<tr><td style="padding:8px 12px;color:#4F5B6B;width:140px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 12px;color:#16202E;">${escapeHtml(value)}</td></tr>`;
}

export async function emailQuoteNotice(env: Env, notice: QuoteNotice) {
  if (notice.fullName.startsWith("API Test")) return;

  if (!env.EMAIL) {
    console.warn("EMAIL binding is missing; the request was saved but not emailed.");
    return;
  }

  const to = env.NOTIFY_EMAIL || "petrucking96@gmail.com";
  const from = env.NOTIFY_FROM;
  if (!from) {
    console.warn("NOTIFY_FROM is not set; add a Cloudflare Email domain, then set quotes@yourdomain.com.");
    return;
  }

  const subject = `New ${formLabel(notice.form)} from ${notice.fullName}`;

  const extraText = Object.entries(notice.extra)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  const text = [
    `A new ${formLabel(notice.form).toLowerCase()} was submitted on the website.`,
    "",
    line("Name", notice.fullName),
    line("Email", notice.email),
    line("Phone", notice.phone),
    line("Need", notice.inquiryType),
    line("Location", notice.location),
    line("Preferred date", notice.preferredDate),
    notice.details ? `Details:\n${notice.details}\n` : "",
    extraText ? `More:\n${extraText}\n` : "",
    "This request is also in the employee dashboard inbox.",
  ]
    .filter(Boolean)
    .join("\n");

  const extraRows = Object.entries(notice.extra)
    .map(([key, value]) => row(key, value))
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#F6F5F2;padding:24px;">
      <p style="margin:0 0 16px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#153F86;">Polley Enterprise</p>
      <h1 style="margin:0 0 16px;font-size:22px;color:#061024;">${escapeHtml(formLabel(notice.form))}</h1>
      <table style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #D8D7D1;">
        ${row("Name", notice.fullName)}
        ${row("Email", notice.email)}
        ${row("Phone", notice.phone)}
        ${row("Need", notice.inquiryType)}
        ${row("Location", notice.location)}
        ${row("Preferred date", notice.preferredDate)}
        ${notice.details ? row("Details", notice.details) : ""}
        ${extraRows}
      </table>
      <p style="margin:16px 0 0;font-size:13px;color:#4F5B6B;">This request is also in the employee dashboard inbox. Reply to this email to reach the customer when they left an address.</p>
    </div>
  `;

  await env.EMAIL.send({
    to,
    from,
    subject,
    text,
    html,
    ...(notice.email ? { replyTo: notice.email } : {}),
  });
}
