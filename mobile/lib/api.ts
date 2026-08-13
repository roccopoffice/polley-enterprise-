import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Shipment, ShipmentStatus } from "./tracking";

const TOKEN_KEY = "polley.driver.token";

/**
 * Points at the Cloudflare Worker that serves the website. Set
 * EXPO_PUBLIC_API_URL in mobile/.env (for example
 * https://polley-enterprise.workers.dev).
 */
export const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export function hasApiConfig() {
  return apiUrl.length > 0;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let cachedToken: string | null = null;

export async function getToken() {
  if (cachedToken) return cachedToken;
  cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
  return cachedToken;
}

async function setToken(token: string | null) {
  cachedToken = token;
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!hasApiConfig()) {
    throw new ApiError("Set EXPO_PUBLIC_API_URL before using the driver app.", 0);
  }

  const token = await getToken();
  let response: Response;

  try {
    response = await fetch(`${apiUrl}/api${path}`, {
      ...init,
      headers: {
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError("No connection. Your update will need to be sent again.", 0);
  }

  const payload = (await response.json().catch(() => null)) as
    | ({ error?: string } & Record<string, unknown>)
    | null;

  if (response.status === 401) {
    await setToken(null);
    throw new ApiError(payload?.error ?? "Please sign in again.", 401);
  }

  if (!response.ok) {
    throw new ApiError(payload?.error ?? "Something went wrong. Please try again.", response.status);
  }

  return (payload ?? {}) as T;
}

export async function login(email: string, password: string) {
  const result = await request<{ token: string; user: { id: string; full_name: string } }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );

  await setToken(result.token);
  return result.user;
}

export async function logout() {
  try {
    await request("/auth/logout", { method: "POST" });
  } finally {
    await setToken(null);
  }
}

export function fetchSession() {
  return request<{ user: { id: string; full_name: string; role: string } }>("/auth/me");
}

export function fetchShipments() {
  return request<{ shipments: Shipment[] }>("/shipments");
}

export function startShift(shipmentId: string) {
  return request<{ shiftId: string; alreadyActive?: boolean }>(
    `/shipments/${shipmentId}/shift/start`,
    { method: "POST" }
  );
}

export function endShift(shipmentId: string) {
  return request(`/shipments/${shipmentId}/shift/end`, { method: "POST" });
}

export function updateStatus(shipmentId: string, status: ShipmentStatus, eventMessage?: string) {
  return request<{ shipment: Shipment }>(`/shipments/${shipmentId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, eventMessage }),
  });
}

export function sendLocation(
  shipmentId: string,
  coords: { latitude: number; longitude: number; speed?: number | null; heading?: number | null }
) {
  return request(`/shipments/${shipmentId}/locations`, {
    method: "POST",
    body: JSON.stringify(coords),
  });
}
