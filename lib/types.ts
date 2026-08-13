export type UserRole = "admin" | "dispatcher" | "employee";

export type ServiceType =
  | "vehicle_transport"
  | "freight_hauling"
  | "courier"
  | "hot_shot"
  | "black_truck_service"
  | "luxury_car_cleaning"
  | "eighteen_wheeler_cleaning"
  | "personnel_transport"
  | "moving_services"
  | "power_washing"
  | "trailer_washout";

export type ShipmentStatus =
  | "created"
  | "assigned"
  | "shift_started"
  | "picked_up"
  | "in_transit"
  | "arrived"
  | "delivered"
  | "delayed"
  | "cancelled";

export type SessionUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
};

export type Employee = SessionUser;

export type Shipment = {
  id: string;
  tracking_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  service_type: ServiceType;
  status: ShipmentStatus;
  pickup_city: string;
  pickup_state: string;
  dropoff_city: string;
  dropoff_state: string;
  pickup_address: string | null;
  dropoff_address: string | null;
  scheduled_for: string | null;
  assigned_employee_id: string | null;
  public_notes: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ShipmentEvent = {
  id: string;
  shipment_id: string;
  actor_id: string | null;
  status: ShipmentStatus;
  title: string;
  message: string | null;
  created_at: string;
};

export type LocationPing = {
  id: string;
  shipment_id: string;
  employee_id: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  recorded_at: string;
};

/** The trimmed-down shape the public tracking endpoint returns. */
export type TrackedShipment = {
  tracking_number: string;
  status: ShipmentStatus;
  service_type: ServiceType;
  pickup_city: string;
  pickup_state: string;
  dropoff_city: string;
  dropoff_state: string;
  scheduled_for: string | null;
  public_notes: string | null;
  updated_at: string;
};

export type TrackedEvent = {
  status: ShipmentStatus;
  title: string;
  message: string | null;
  created_at: string;
};

export type TrackingResult = {
  shipment: TrackedShipment;
  events: TrackedEvent[];
  location: { latitude: number; longitude: number; recorded_at: string } | null;
};

export type QuoteRequest = {
  id: string;
  form: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  inquiry_type: string | null;
  location: string | null;
  preferred_date: string | null;
  details: string | null;
  extra: string | null;
  status: "new" | "contacted" | "closed";
  created_at: string;
};
