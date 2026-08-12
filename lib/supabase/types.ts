export type UserRole = "admin" | "dispatcher" | "employee";

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

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
};

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

export type ShiftSession = {
  id: string;
  shipment_id: string;
  employee_id: string;
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
};

export type PublicTrackingResult = Pick<
  Shipment,
  | "id"
  | "tracking_number"
  | "service_type"
  | "status"
  | "pickup_city"
  | "pickup_state"
  | "dropoff_city"
  | "dropoff_state"
  | "scheduled_for"
  | "public_notes"
  | "updated_at"
> & {
  shipment_events?: ShipmentEvent[];
  location_pings?: Pick<LocationPing, "latitude" | "longitude" | "recorded_at">[];
};

export type DashboardShipment = Shipment & {
  shipment_events?: ShipmentEvent[];
  location_pings?: LocationPing[];
};
