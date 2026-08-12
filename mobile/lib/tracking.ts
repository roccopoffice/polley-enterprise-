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

export type Shipment = {
  id: string;
  tracking_number: string;
  customer_name: string;
  service_type: string;
  status: ShipmentStatus;
  pickup_city: string;
  pickup_state: string;
  dropoff_city: string;
  dropoff_state: string;
  updated_at: string;
};

export const statusLabels: Record<ShipmentStatus, string> = {
  created: "Created",
  assigned: "Assigned",
  shift_started: "Driver Started",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  arrived: "Arrived",
  delivered: "Delivered",
  delayed: "Delayed",
  cancelled: "Cancelled",
};

export const driverStatuses: { label: string; value: ShipmentStatus }[] = [
  { label: "Picked Up", value: "picked_up" },
  { label: "In Transit", value: "in_transit" },
  { label: "Arrived", value: "arrived" },
  { label: "Delivered", value: "delivered" },
  { label: "Delayed", value: "delayed" },
];
