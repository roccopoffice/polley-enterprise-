"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  LogOut,
  MapPin,
  Play,
  PlusCircle,
  Square,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Textarea } from "@/components/Textarea";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { LocationPing, Profile, Shipment, ShipmentEvent, ShipmentStatus } from "@/lib/supabase/types";
import {
  createTrackingNumber,
  formatDateTime,
  serviceTypeLabels,
  serviceTypeOptions,
  shipmentStatusLabels,
  shipmentStatusOptions,
} from "@/lib/tracking";

type DashboardState = {
  profile: Profile | null;
  shipments: Shipment[];
  employees: Profile[];
  events: ShipmentEvent[];
  locations: LocationPing[];
};

const emptyForm = {
  trackingNumber: createTrackingNumber(),
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  serviceType: "vehicle_transport",
  pickupCity: "Houston",
  pickupState: "TX",
  dropoffCity: "",
  dropoffState: "TX",
  pickupAddress: "",
  dropoffAddress: "",
  scheduledFor: "",
  assignedEmployeeId: "",
  publicNotes: "",
  internalNotes: "",
};

export function EmployeeDashboard() {
  const [state, setState] = useState<DashboardState>({
    profile: null,
    shipments: [],
    employees: [],
    events: [],
    locations: [],
  });
  const [selectedShipmentId, setSelectedShipmentId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>("in_transit");
  const [newEventMessage, setNewEventMessage] = useState("");
  const [form, setForm] = useState(emptyForm);
  const isConfigured = hasSupabaseConfig();

  const selectedShipment = useMemo(
    () => state.shipments.find((shipment) => shipment.id === selectedShipmentId) ?? state.shipments[0],
    [selectedShipmentId, state.shipments]
  );

  const canDispatch = state.profile?.role === "admin" || state.profile?.role === "dispatcher";

  const loadDashboard = useCallback(async () => {
    if (!isConfigured) {
      setError("Dashboard is ready, but Supabase keys still need to be added in Netlify.");
      setIsLoading(false);
      return;
    }

    setError("");
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData) {
      setError("Your account exists, but it needs a profile row in Supabase before dashboard access works.");
      setIsLoading(false);
      return;
    }

    const profile = profileData as Profile;
    const shipmentQuery = supabase.from("shipments").select("*").order("updated_at", { ascending: false });
    const { data: shipmentData, error: shipmentError } =
      profile.role === "employee"
        ? await shipmentQuery.eq("assigned_employee_id", user.id)
        : await shipmentQuery;

    if (shipmentError) {
      setError("Could not load shipments. Please check Supabase policies.");
      setIsLoading(false);
      return;
    }

    let employees: Profile[] = [];
    if (profile.role === "admin" || profile.role === "dispatcher") {
      const { data: employeeData } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["employee", "dispatcher", "admin"])
        .order("full_name", { ascending: true });
      employees = (employeeData ?? []) as Profile[];
    }

    const shipments = (shipmentData ?? []) as Shipment[];
    const firstShipmentId = selectedShipmentId || shipments[0]?.id || "";
    setState((current) => ({
      ...current,
      profile,
      shipments,
      employees,
    }));
    setSelectedShipmentId(firstShipmentId);
    setIsLoading(false);
  }, [isConfigured, selectedShipmentId]);

  const loadShipmentDetails = useCallback(async (shipmentId: string) => {
    if (!shipmentId || !isConfigured) return;

    const supabase = getSupabaseBrowserClient();
    const [{ data: eventData }, { data: locationData }] = await Promise.all([
      supabase
        .from("shipment_events")
        .select("*")
        .eq("shipment_id", shipmentId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("location_pings")
        .select("*")
        .eq("shipment_id", shipmentId)
        .order("recorded_at", { ascending: false })
        .limit(5),
    ]);

    setState((current) => ({
      ...current,
      events: (eventData ?? []) as ShipmentEvent[],
      locations: (locationData ?? []) as LocationPing[],
    }));
  }, [isConfigured]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!selectedShipment?.id) return;
    void loadShipmentDetails(selectedShipment.id);
  }, [loadShipmentDetails, selectedShipment?.id]);

  useEffect(() => {
    if (!isConfigured || !state.profile) return;

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("dashboard-shipments")
      .on("postgres_changes", { event: "*", schema: "public", table: "shipments" }, () => {
        void loadDashboard();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "shipment_events" }, () => {
        if (selectedShipment?.id) void loadShipmentDetails(selectedShipment.id);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "location_pings" }, () => {
        if (selectedShipment?.id) void loadShipmentDetails(selectedShipment.id);
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isConfigured, loadDashboard, loadShipmentDetails, selectedShipment?.id, state.profile]);

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function addShipmentEvent(shipmentId: string, status: ShipmentStatus, title: string, message?: string) {
    const supabase = getSupabaseBrowserClient();
    await supabase.from("shipment_events").insert({
      shipment_id: shipmentId,
      actor_id: state.profile?.id ?? null,
      status,
      title,
      message: message || null,
    });
  }

  async function startShift() {
    if (!selectedShipment || !state.profile) return;

    setIsSaving(true);
    setStatusMessage("");
    const supabase = getSupabaseBrowserClient();
    await supabase.from("shift_sessions").insert({
      shipment_id: selectedShipment.id,
      employee_id: state.profile.id,
      is_active: true,
    });
    await supabase.from("shipments").update({ status: "shift_started" }).eq("id", selectedShipment.id);
    await addShipmentEvent(selectedShipment.id, "shift_started", "Driver started the shift");
    setStatusMessage("Shift started. The customer tracker will show the new status.");
    await loadDashboard();
    setIsSaving(false);
  }

  async function endShift() {
    if (!selectedShipment || !state.profile) return;

    setIsSaving(true);
    const supabase = getSupabaseBrowserClient();
    await supabase
      .from("shift_sessions")
      .update({ is_active: false, ended_at: new Date().toISOString() })
      .eq("shipment_id", selectedShipment.id)
      .eq("employee_id", state.profile.id)
      .eq("is_active", true);
    await addShipmentEvent(selectedShipment.id, selectedShipment.status, "Driver ended the shift");
    setStatusMessage("Shift ended.");
    await loadShipmentDetails(selectedShipment.id);
    setIsSaving(false);
  }

  async function updateShipmentStatus() {
    if (!selectedShipment) return;

    setIsSaving(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.from("shipments").update({ status: newStatus }).eq("id", selectedShipment.id);
    await addShipmentEvent(
      selectedShipment.id,
      newStatus,
      shipmentStatusLabels[newStatus],
      newEventMessage
    );
    setNewEventMessage("");
    setStatusMessage("Shipment status updated.");
    await loadDashboard();
    await loadShipmentDetails(selectedShipment.id);
    setIsSaving(false);
  }

  async function createShipment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage("");

    const supabase = getSupabaseBrowserClient();
    const { error: createError } = await supabase.from("shipments").insert({
      tracking_number: form.trackingNumber,
      customer_name: form.customerName,
      customer_email: form.customerEmail || null,
      customer_phone: form.customerPhone || null,
      service_type: form.serviceType,
      status: form.assignedEmployeeId ? "assigned" : "created",
      pickup_city: form.pickupCity,
      pickup_state: form.pickupState,
      dropoff_city: form.dropoffCity,
      dropoff_state: form.dropoffState,
      pickup_address: form.pickupAddress || null,
      dropoff_address: form.dropoffAddress || null,
      scheduled_for: form.scheduledFor ? new Date(form.scheduledFor).toISOString() : null,
      assigned_employee_id: form.assignedEmployeeId || null,
      public_notes: form.publicNotes || null,
      internal_notes: form.internalNotes || null,
    });

    if (createError) {
      setError("Could not create shipment. Check required fields and tracking number uniqueness.");
      setIsSaving(false);
      return;
    }

    setForm({ ...emptyForm, trackingNumber: createTrackingNumber() });
    setStatusMessage("Shipment created and ready for tracking.");
    await loadDashboard();
    setIsSaving(false);
  }

  if (isLoading) {
    return (
      <div className="section-shell flex min-h-[22rem] items-center justify-center p-8 text-enterprise-blue">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-shell p-6 md:p-8">
        <p className="flex gap-2 text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </p>
        <Link href="/login" className="mt-5 inline-flex font-semibold text-enterprise-blue">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="section-shell flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-enterprise-blue">
            {state.profile?.role ?? "employee"}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-enterprise-charcoal">
            Welcome, {state.profile?.full_name}
          </h2>
          <p className="mt-2 text-enterprise-gray">
            Manage assigned shipments and keep customers updated.
          </p>
        </div>
        <Button variant="secondary" className="rounded-2xl" onClick={() => void signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {statusMessage ? (
        <p className="flex gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {statusMessage}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <aside className="section-shell h-fit p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl font-bold text-enterprise-charcoal">Shipments</h3>
            <ClipboardList className="h-5 w-5 text-enterprise-blue" />
          </div>
          <div className="mt-5 space-y-3">
            {state.shipments.length ? (
              state.shipments.map((shipment) => (
                <button
                  key={shipment.id}
                  type="button"
                  onClick={() => setSelectedShipmentId(shipment.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedShipment?.id === shipment.id
                      ? "border-enterprise-blue bg-enterprise-blue/5"
                      : "border-enterprise-border bg-white hover:border-enterprise-blue/50"
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-enterprise-blue">
                    {shipment.tracking_number}
                  </span>
                  <span className="mt-2 block font-bold text-enterprise-charcoal">
                    {shipment.customer_name}
                  </span>
                  <span className="mt-1 block text-sm text-enterprise-gray">
                    {shipmentStatusLabels[shipment.status]} · {shipment.dropoff_city}, {shipment.dropoff_state}
                  </span>
                </button>
              ))
            ) : (
              <p className="rounded-2xl border border-enterprise-border bg-white p-4 text-sm text-enterprise-gray">
                No shipments are assigned yet.
              </p>
            )}
          </div>
        </aside>

        <section className="section-shell p-6 md:p-8">
          {selectedShipment ? (
            <ShipmentDetail
              shipment={selectedShipment}
              events={state.events}
              locations={state.locations}
              newStatus={newStatus}
              setNewStatus={setNewStatus}
              newEventMessage={newEventMessage}
              setNewEventMessage={setNewEventMessage}
              isSaving={isSaving}
              onStartShift={startShift}
              onEndShift={endShift}
              onUpdateStatus={updateShipmentStatus}
            />
          ) : (
            <div className="flex min-h-[20rem] flex-col items-center justify-center text-center">
              <MapPin className="h-10 w-10 text-enterprise-blue" />
              <h3 className="mt-4 text-2xl font-bold text-enterprise-charcoal">
                Select a shipment
              </h3>
              <p className="mt-2 text-enterprise-gray">
                Shipment route, status updates, and live location details appear here.
              </p>
            </div>
          )}
        </section>
      </div>

      {canDispatch ? (
        <DispatchPanel
          form={form}
          setForm={setForm}
          employees={state.employees}
          isSaving={isSaving}
          onCreateShipment={createShipment}
        />
      ) : null}
    </div>
  );
}

function ShipmentDetail({
  shipment,
  events,
  locations,
  newStatus,
  setNewStatus,
  newEventMessage,
  setNewEventMessage,
  isSaving,
  onStartShift,
  onEndShift,
  onUpdateStatus,
}: {
  shipment: Shipment;
  events: ShipmentEvent[];
  locations: LocationPing[];
  newStatus: ShipmentStatus;
  setNewStatus: (value: ShipmentStatus) => void;
  newEventMessage: string;
  setNewEventMessage: (value: string) => void;
  isSaving: boolean;
  onStartShift: () => Promise<void>;
  onEndShift: () => Promise<void>;
  onUpdateStatus: () => Promise<void>;
}) {
  const lastLocation = locations[0];

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-enterprise-border pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-enterprise-blue">
            {shipment.tracking_number}
          </p>
          <h3 className="mt-2 text-3xl font-bold text-enterprise-charcoal">
            {shipment.customer_name}
          </h3>
          <p className="mt-2 text-enterprise-gray">
            {serviceTypeLabels[shipment.service_type]} · {shipmentStatusLabels[shipment.status]}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="rounded-2xl" onClick={() => void onStartShift()} disabled={isSaving}>
            <Play className="mr-2 h-4 w-4" />
            Start Shift
          </Button>
          <Button
            variant="secondary"
            className="rounded-2xl"
            onClick={() => void onEndShift()}
            disabled={isSaving}
          >
            <Square className="mr-2 h-4 w-4" />
            End Shift
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <DetailCard label="Pickup" value={`${shipment.pickup_city}, ${shipment.pickup_state}`} />
        <DetailCard label="Dropoff" value={`${shipment.dropoff_city}, ${shipment.dropoff_state}`} />
        <DetailCard label="Scheduled" value={formatDateTime(shipment.scheduled_for)} />
        <DetailCard label="Updated" value={formatDateTime(shipment.updated_at)} />
      </div>

      <div className="mt-6 rounded-3xl border border-enterprise-border bg-white p-5">
        <h4 className="text-xl font-bold text-enterprise-charcoal">Update status</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-[0.7fr_1fr]">
          <Select
            id="shipment-status"
            label="New status"
            value={newStatus}
            onChange={(event) => setNewStatus(event.target.value as ShipmentStatus)}
            options={shipmentStatusOptions}
          />
          <Input
            id="event-message"
            label="Customer update note"
            value={newEventMessage}
            onChange={(event) => setNewEventMessage(event.target.value)}
            placeholder="Example: Driver is on the way."
          />
        </div>
        <Button className="mt-5 rounded-2xl" onClick={() => void onUpdateStatus()} disabled={isSaving}>
          Save Status Update
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-enterprise-border bg-enterprise-light/70 p-5">
          <h4 className="text-xl font-bold text-enterprise-charcoal">Latest events</h4>
          <div className="mt-4 space-y-3">
            {events.length ? (
              events.map((event) => (
                <div key={event.id} className="rounded-2xl bg-white p-4">
                  <p className="font-bold text-enterprise-charcoal">{event.title}</p>
                  {event.message ? <p className="mt-1 text-sm text-enterprise-gray">{event.message}</p> : null}
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-enterprise-blue">
                    {formatDateTime(event.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-enterprise-gray">No events yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-enterprise-border bg-enterprise-light/70 p-5">
          <h4 className="text-xl font-bold text-enterprise-charcoal">Location</h4>
          {lastLocation ? (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lastLocation.latitude},${lastLocation.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block rounded-2xl bg-white p-4 hover:text-enterprise-blue"
            >
              <p className="font-bold text-enterprise-charcoal">Last known position</p>
              <p className="mt-1 text-sm text-enterprise-gray">
                {lastLocation.latitude.toFixed(5)}, {lastLocation.longitude.toFixed(5)}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-enterprise-blue">
                {formatDateTime(lastLocation.recorded_at)}
              </p>
            </a>
          ) : (
            <p className="mt-4 text-sm text-enterprise-gray">
              Location will appear after the driver app starts sending GPS updates.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DispatchPanel({
  form,
  setForm,
  employees,
  isSaving,
  onCreateShipment,
}: {
  form: typeof emptyForm;
  setForm: (form: typeof emptyForm) => void;
  employees: Profile[];
  isSaving: boolean;
  onCreateShipment: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  const employeeOptions = employees.map((employee) => ({
    label: `${employee.full_name} (${employee.role})`,
    value: employee.id,
  }));

  return (
    <form onSubmit={onCreateShipment} className="section-shell p-6 md:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-enterprise-blue/10 text-enterprise-blue">
          <PlusCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-enterprise-blue">Dispatch</p>
          <h3 className="text-2xl font-bold text-enterprise-charcoal">Create shipment</h3>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Input
          id="new-tracking-number"
          label="Tracking number"
          value={form.trackingNumber}
          onChange={(event) => setForm({ ...form, trackingNumber: event.target.value.toUpperCase() })}
          required
        />
        <Select
          id="new-service-type"
          label="Service"
          value={form.serviceType}
          onChange={(event) => setForm({ ...form, serviceType: event.target.value })}
          options={serviceTypeOptions}
          required
        />
        <Input
          id="new-customer-name"
          label="Customer name"
          value={form.customerName}
          onChange={(event) => setForm({ ...form, customerName: event.target.value })}
          required
        />
        <Input
          id="new-customer-phone"
          label="Customer phone"
          value={form.customerPhone}
          onChange={(event) => setForm({ ...form, customerPhone: event.target.value })}
        />
        <Input
          id="new-customer-email"
          label="Customer email"
          type="email"
          value={form.customerEmail}
          onChange={(event) => setForm({ ...form, customerEmail: event.target.value })}
        />
        <Input
          id="new-scheduled-for"
          label="Scheduled time"
          type="datetime-local"
          value={form.scheduledFor}
          onChange={(event) => setForm({ ...form, scheduledFor: event.target.value })}
        />
        <Input
          id="new-pickup-city"
          label="Pickup city"
          value={form.pickupCity}
          onChange={(event) => setForm({ ...form, pickupCity: event.target.value })}
          required
        />
        <Input
          id="new-pickup-state"
          label="Pickup state"
          value={form.pickupState}
          onChange={(event) => setForm({ ...form, pickupState: event.target.value })}
          required
        />
        <Input
          id="new-dropoff-city"
          label="Dropoff city"
          value={form.dropoffCity}
          onChange={(event) => setForm({ ...form, dropoffCity: event.target.value })}
          required
        />
        <Input
          id="new-dropoff-state"
          label="Dropoff state"
          value={form.dropoffState}
          onChange={(event) => setForm({ ...form, dropoffState: event.target.value })}
          required
        />
        <Input
          id="new-pickup-address"
          label="Pickup address"
          value={form.pickupAddress}
          onChange={(event) => setForm({ ...form, pickupAddress: event.target.value })}
        />
        <Input
          id="new-dropoff-address"
          label="Dropoff address"
          value={form.dropoffAddress}
          onChange={(event) => setForm({ ...form, dropoffAddress: event.target.value })}
        />
        <Select
          id="new-assigned-employee"
          label="Assigned employee"
          value={form.assignedEmployeeId}
          onChange={(event) => setForm({ ...form, assignedEmployeeId: event.target.value })}
          options={employeeOptions}
        />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Textarea
          id="new-public-notes"
          label="Public customer note"
          value={form.publicNotes}
          onChange={(event) => setForm({ ...form, publicNotes: event.target.value })}
          rows={4}
        />
        <Textarea
          id="new-internal-notes"
          label="Internal dispatch notes"
          value={form.internalNotes}
          onChange={(event) => setForm({ ...form, internalNotes: event.target.value })}
          rows={4}
        />
      </div>

      <Button type="submit" className="mt-6 rounded-2xl" disabled={isSaving}>
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Create Shipment
      </Button>
    </form>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-enterprise-border bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-enterprise-blue">{label}</p>
      <p className="mt-2 font-semibold text-enterprise-charcoal">{value}</p>
    </div>
  );
}
