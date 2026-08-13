import type {
  Employee,
  LocationPing,
  QuoteRequest,
  SessionUser,
  Shipment,
  ShipmentEvent,
  ShipmentStatus,
  TrackingResult,
} from "@/lib/types";

/**
 * Every call goes to the Cloudflare Worker that serves this site, so requests
 * are same-origin and the session cookie travels automatically.
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`/api${path}`, {
      ...init,
      credentials: "same-origin",
      headers: {
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError("We could not reach the server. Please check your connection.", 0);
  }

  const payload = (await response.json().catch(() => null)) as
    | ({ ok?: boolean; error?: string } & Record<string, unknown>)
    | null;

  if (!response.ok) {
    throw new ApiError(payload?.error ?? "Something went wrong. Please try again.", response.status);
  }

  return (payload ?? {}) as T;
}

function post(body?: unknown): RequestInit {
  return { method: "POST", body: body ? JSON.stringify(body) : undefined };
}

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export function submitForm(payload: Record<string, unknown>) {
  return request<{ ok: true }>("/quotes", post(payload));
}

export function trackShipment(trackingNumber: string) {
  return request<TrackingResult & { ok: true }>(
    `/track?number=${encodeURIComponent(trackingNumber)}`
  );
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export function login(email: string, password: string) {
  return request<{ ok: true; user: SessionUser; token: string }>(
    "/auth/login",
    post({ email, password })
  );
}

export function logout() {
  return request<{ ok: true }>("/auth/logout", { method: "POST" });
}

export function fetchSession() {
  return request<{ ok: true; user: SessionUser }>("/auth/me");
}

export function changePassword(currentPassword: string, newPassword: string) {
  return request<{ ok: true }>("/auth/password", post({ currentPassword, newPassword }));
}

// ---------------------------------------------------------------------------
// Dispatch and drivers
// ---------------------------------------------------------------------------

export function fetchShipments() {
  return request<{ ok: true; shipments: Shipment[] }>("/shipments");
}

export function fetchShipmentDetail(id: string) {
  return request<{
    ok: true;
    shipment: Shipment;
    events: ShipmentEvent[];
    locations: LocationPing[];
    activeShift: { id: string } | null;
  }>(`/shipments/${id}`);
}

export type NewShipmentInput = {
  trackingNumber?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceType: string;
  pickupCity: string;
  pickupState?: string;
  dropoffCity: string;
  dropoffState?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  scheduledFor?: string;
  assignedEmployeeId?: string;
  publicNotes?: string;
  internalNotes?: string;
};

export function createShipment(input: NewShipmentInput) {
  return request<{ ok: true; shipment: Shipment }>("/shipments", post(input));
}

export function updateShipment(
  id: string,
  patch: Partial<NewShipmentInput> & {
    status?: ShipmentStatus;
    eventMessage?: string;
  }
) {
  return request<{ ok: true; shipment: Shipment }>(`/shipments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function startShift(id: string) {
  return request<{ ok: true; shiftId: string; alreadyActive?: boolean }>(
    `/shipments/${id}/shift/start`,
    { method: "POST" }
  );
}

export function endShift(id: string) {
  return request<{ ok: true }>(`/shipments/${id}/shift/end`, { method: "POST" });
}

export function sendLocation(
  id: string,
  coords: { latitude: number; longitude: number; speed?: number | null; heading?: number | null }
) {
  return request<{ ok: true }>(`/shipments/${id}/locations`, post(coords));
}

export function fetchEmployees() {
  return request<{ ok: true; employees: Employee[] }>("/employees");
}

export function fetchQuoteRequests(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return request<{ ok: true; requests: QuoteRequest[] }>(`/quotes${query}`);
}

export function updateQuoteRequest(id: string, status: "new" | "contacted" | "closed") {
  return request<{ ok: true }>(`/quotes/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
