import type { ServiceType, ShipmentStatus } from "@/lib/types";

export const serviceTypeLabels: Record<ServiceType, string> = {
  vehicle_transport: "Vehicle Transportation",
  freight_hauling: "Freight Hauling",
  courier: "Courier Service",
  hot_shot: "Hot Shot",
  black_truck_service: "Black Truck Service",
  luxury_car_cleaning: "Luxury Car Cleaning",
  eighteen_wheeler_cleaning: "18 Wheeler Cleaning",
  personnel_transport: "Personnel Transport",
  moving_services: "Moving Services",
  power_washing: "Power Washing",
  trailer_washout: "Trailer Washout",
};

export const shipmentStatusLabels: Record<ShipmentStatus, string> = {
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

export const shipmentStatusOptions: { label: string; value: ShipmentStatus }[] = [
  { label: "Assigned", value: "assigned" },
  { label: "Driver Started", value: "shift_started" },
  { label: "Picked Up", value: "picked_up" },
  { label: "In Transit", value: "in_transit" },
  { label: "Arrived", value: "arrived" },
  { label: "Delivered", value: "delivered" },
  { label: "Delayed", value: "delayed" },
];

export const serviceTypeOptions: { label: string; value: ServiceType }[] = Object.entries(
  serviceTypeLabels
).map(([value, label]) => ({ value: value as ServiceType, label }));

export function formatTrackingNumber(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function formatDateTime(value?: string | null) {
  if (!value) return "Not scheduled";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
