export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  EMAIL?: SendEmail;
  /** Session lifetime in hours. Defaults to 12 (one shift). */
  SESSION_HOURS?: string;
  /** Inbox that receives website form submissions. */
  NOTIFY_EMAIL?: string;
  /**
   * Must be an address on a domain onboarded to Cloudflare Email Service,
   * for example quotes@yourdomain.com.
   */
  NOTIFY_FROM?: string;
}

export type Role = "admin" | "dispatcher" | "employee";

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
  full_name: string;
  phone: string | null;
  role: Role;
  is_active: number;
  created_at: string;
  updated_at: string;
};

export type SessionUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: Role;
};

export const SERVICE_TYPES = [
  "vehicle_transport",
  "freight_hauling",
  "courier",
  "hot_shot",
  "black_truck_service",
  "luxury_car_cleaning",
  "eighteen_wheeler_cleaning",
  "personnel_transport",
  "moving_services",
  "power_washing",
  "trailer_washout",
] as const;

export const SHIPMENT_STATUSES = [
  "created",
  "assigned",
  "shift_started",
  "picked_up",
  "in_transit",
  "arrived",
  "delivered",
  "delayed",
  "cancelled",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export function isDispatch(role: Role) {
  return role === "admin" || role === "dispatcher";
}
