"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Inbox,
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
import {
  ApiError,
  createShipment as createShipmentRequest,
  endShift as endShiftRequest,
  fetchEmployees,
  fetchQuoteRequests,
  fetchSession,
  fetchShipmentDetail,
  fetchShipments,
  logout as logoutRequest,
  startShift as startShiftRequest,
  updateQuoteRequest,
  updateShipment,
} from "@/lib/api";
import type {
  Employee,
  LocationPing,
  QuoteRequest,
  SessionUser,
  Shipment,
  ShipmentEvent,
  ShipmentStatus,
} from "@/lib/types";
import {
  formatDateTime,
  serviceTypeLabels,
  serviceTypeOptions,
  shipmentStatusLabels,
  shipmentStatusOptions,
} from "@/lib/tracking";

const REFRESH_MS = 20000;

type DashboardState = {
  user: SessionUser | null;
  shipments: Shipment[];
  employees: Employee[];
  events: ShipmentEvent[];
  locations: LocationPing[];
  quotes: QuoteRequest[];
  hasActiveShift: boolean;
};

const emptyForm = {
  trackingNumber: "",
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
    user: null,
    shipments: [],
    employees: [],
    events: [],
    locations: [],
    quotes: [],
    hasActiveShift: false,
  });
  const [selectedShipmentId, setSelectedShipmentId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>("in_transit");
  const [newEventMessage, setNewEventMessage] = useState("");
  const [form, setForm] = useState(emptyForm);
  const selectedRef = useRef("");

  const selectedShipment = useMemo(
    () => state.shipments.find((shipment) => shipment.id === selectedShipmentId) ?? state.shipments[0],
    [selectedShipmentId, state.shipments]
  );

  const canDispatch = state.user?.role === "admin" || state.user?.role === "dispatcher";

  function reportError(caught: unknown, fallback: string) {
    if (caught instanceof ApiError && caught.status === 401) {
      window.location.href = "/login";
      return;
    }
    setError(caught instanceof ApiError ? caught.message : fallback);
  }

  const loadDashboard = useCallback(async (options: { quiet?: boolean } = {}) => {
    try {
      const [{ user }, { shipments }] = await Promise.all([fetchSession(), fetchShipments()]);
      const isDispatch = user.role === "admin" || user.role === "dispatcher";

      const [employees, quotes] = await Promise.all([
        isDispatch ? fetchEmployees().then((result) => result.employees) : Promise.resolve([]),
        isDispatch ? fetchQuoteRequests().then((result) => result.requests) : Promise.resolve([]),
      ]);

      setState((current) => ({ ...current, user, shipments, employees, quotes }));
      setSelectedShipmentId((current) => current || shipments[0]?.id || "");
      setError("");
    } catch (caught) {
      if (!options.quiet) reportError(caught, "Could not load the dashboard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadShipmentDetails = useCallback(async (shipmentId: string) => {
    if (!shipmentId) return;

    try {
      const detail = await fetchShipmentDetail(shipmentId);
      // Ignore a slow response for a shipment the user already navigated away from.
      if (selectedRef.current !== shipmentId) return;

      setState((current) => ({
        ...current,
        events: detail.events,
        locations: detail.locations,
        hasActiveShift: Boolean(detail.activeShift),
      }));
    } catch (caught) {
      reportError(caught, "Could not load shipment details.");
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    selectedRef.current = selectedShipment?.id ?? "";
    if (!selectedShipment?.id) return;
    void loadShipmentDetails(selectedShipment.id);
  }, [loadShipmentDetails, selectedShipment?.id]);

  // D1 has no push channel, so the board refreshes on a timer instead.
  useEffect(() => {
    if (!state.user) return;

    const interval = window.setInterval(() => {
      void loadDashboard({ quiet: true });
      if (selectedRef.current) void loadShipmentDetails(selectedRef.current);
    }, REFRESH_MS);

    return () => window.clearInterval(interval);
  }, [loadDashboard, loadShipmentDetails, state.user]);

  async function signOut() {
    try {
      await logoutRequest();
    } finally {
      window.location.href = "/login";
    }
  }

  async function refreshAll() {
    await loadDashboard({ quiet: true });
    if (selectedRef.current) await loadShipmentDetails(selectedRef.current);
  }

  async function startShift() {
    if (!selectedShipment) return;

    setIsSaving(true);
    setStatusMessage("");
    try {
      const result = await startShiftRequest(selectedShipment.id);
      setStatusMessage(
        result.alreadyActive
          ? "Your shift is already running for this shipment."
          : "Shift started. The customer tracker now shows the new status."
      );
      await refreshAll();
    } catch (caught) {
      reportError(caught, "Could not start the shift.");
    } finally {
      setIsSaving(false);
    }
  }

  async function endShift() {
    if (!selectedShipment) return;

    setIsSaving(true);
    try {
      await endShiftRequest(selectedShipment.id);
      setStatusMessage("Shift ended.");
      await refreshAll();
    } catch (caught) {
      reportError(caught, "Could not end the shift.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateShipmentStatus() {
    if (!selectedShipment) return;

    setIsSaving(true);
    try {
      await updateShipment(selectedShipment.id, {
        status: newStatus,
        eventMessage: newEventMessage || undefined,
      });
      setNewEventMessage("");
      setStatusMessage("Shipment status updated. Customers see this on the tracking page.");
      await refreshAll();
    } catch (caught) {
      reportError(caught, "Could not update the shipment.");
    } finally {
      setIsSaving(false);
    }
  }

  async function createShipment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage("");

    try {
      const { shipment } = await createShipmentRequest({
        trackingNumber: form.trackingNumber || undefined,
        customerName: form.customerName,
        customerEmail: form.customerEmail || undefined,
        customerPhone: form.customerPhone || undefined,
        serviceType: form.serviceType,
        pickupCity: form.pickupCity,
        pickupState: form.pickupState,
        dropoffCity: form.dropoffCity,
        dropoffState: form.dropoffState,
        pickupAddress: form.pickupAddress || undefined,
        dropoffAddress: form.dropoffAddress || undefined,
        scheduledFor: form.scheduledFor || undefined,
        assignedEmployeeId: form.assignedEmployeeId || undefined,
        publicNotes: form.publicNotes || undefined,
        internalNotes: form.internalNotes || undefined,
      });

      setForm({ ...emptyForm });
      setSelectedShipmentId(shipment.id);
      setStatusMessage(`Shipment created. Tracking number ${shipment.tracking_number}.`);
      await refreshAll();
    } catch (caught) {
      reportError(caught, "Could not create the shipment.");
    } finally {
      setIsSaving(false);
    }
  }

  async function markQuote(id: string, status: "new" | "contacted" | "closed") {
    try {
      await updateQuoteRequest(id, status);
      await loadDashboard({ quiet: true });
    } catch (caught) {
      reportError(caught, "Could not update that request.");
    }
  }

  if (isLoading) {
    return (
      <div className="section-shell flex min-h-[22rem] items-center justify-center p-8 text-enterprise-blue">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
        Loading dashboard...
      </div>
    );
  }

  if (error && !state.user) {
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
            {state.user?.role ?? "employee"}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-[0.01em] text-enterprise-charcoal">
            Welcome, {state.user?.full_name}
          </h2>
          <p className="mt-2 text-enterprise-gray">
            Manage assigned shipments and keep customers updated.
          </p>
        </div>
        <Button variant="secondary" className="rounded-sharp" onClick={() => void signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {statusMessage ? (
        <p className="flex gap-2 rounded-sharp border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {statusMessage}
        </p>
      ) : null}

      {error ? (
        <p className="flex gap-2 rounded-sharp border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <aside className="section-shell h-fit p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-2xl font-bold uppercase tracking-[0.01em] text-enterprise-charcoal">Shipments</h3>
            <ClipboardList className="h-5 w-5 text-enterprise-blue" />
          </div>
          <div className="mt-5 space-y-3">
            {state.shipments.length ? (
              state.shipments.map((shipment) => (
                <button
                  key={shipment.id}
                  type="button"
                  onClick={() => setSelectedShipmentId(shipment.id)}
                  className={`w-full rounded-sharp border p-4 text-left transition ${
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
              <p className="rounded-sharp border border-enterprise-border bg-white p-4 text-sm text-enterprise-gray">
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
              hasActiveShift={state.hasActiveShift}
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
              <h3 className="mt-4 font-display text-2xl font-bold uppercase tracking-[0.01em] text-enterprise-charcoal">
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
        <>
          <QuoteInbox quotes={state.quotes} onMark={markQuote} />
          <DispatchPanel
            form={form}
            setForm={setForm}
            employees={state.employees}
            isSaving={isSaving}
            onCreateShipment={createShipment}
          />
        </>
      ) : null}
    </div>
  );
}

function ShipmentDetail({
  shipment,
  events,
  locations,
  hasActiveShift,
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
  hasActiveShift: boolean;
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
          <h3 className="mt-2 font-display text-3xl font-bold uppercase tracking-[0.01em] text-enterprise-charcoal">
            {shipment.customer_name}
          </h3>
          <p className="mt-2 text-enterprise-gray">
            {serviceTypeLabels[shipment.service_type]} · {shipmentStatusLabels[shipment.status]}
          </p>
          {hasActiveShift ? (
            <p className="mt-3 inline-flex items-center gap-2 rounded-sharp border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-600" />
              Shift running
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="rounded-sharp"
            onClick={() => void onStartShift()}
            disabled={isSaving || hasActiveShift}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Shift
          </Button>
          <Button
            variant="secondary"
            className="rounded-sharp"
            onClick={() => void onEndShift()}
            disabled={isSaving || !hasActiveShift}
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

      <div className="mt-6 rounded-card border border-enterprise-border bg-white p-5">
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
        <Button className="mt-5 rounded-sharp" onClick={() => void onUpdateStatus()} disabled={isSaving}>
          Save Status Update
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-enterprise-border bg-enterprise-light/70 p-5">
          <h4 className="text-xl font-bold text-enterprise-charcoal">Latest events</h4>
          <div className="mt-4 space-y-3">
            {events.length ? (
              events.map((event) => (
                <div key={event.id} className="rounded-sharp bg-white p-4">
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

        <div className="rounded-card border border-enterprise-border bg-enterprise-light/70 p-5">
          <h4 className="text-xl font-bold text-enterprise-charcoal">Location</h4>
          {lastLocation ? (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lastLocation.latitude},${lastLocation.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block rounded-sharp bg-white p-4 hover:text-enterprise-blue"
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

function QuoteInbox({
  quotes,
  onMark,
}: {
  quotes: QuoteRequest[];
  onMark: (id: string, status: "new" | "contacted" | "closed") => Promise<void>;
}) {
  const open = quotes.filter((quote) => quote.status !== "closed");

  return (
    <section className="section-shell p-6 md:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-sharp bg-enterprise-blue/10 text-enterprise-blue">
          <Inbox className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-enterprise-blue">Website requests</p>
          <h3 className="font-display text-2xl font-bold uppercase tracking-[0.01em] text-enterprise-charcoal">
            Quote inbox {open.length ? `(${open.length} open)` : ""}
          </h3>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {open.length ? (
          open.map((quote) => (
            <article
              key={quote.id}
              className="rounded-sharp border border-enterprise-border bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-enterprise-charcoal">{quote.full_name}</p>
                  <p className="mt-1 text-sm text-enterprise-gray">
                    {[quote.inquiry_type, quote.location].filter(Boolean).join(" · ") || "General request"}
                  </p>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-enterprise-blue">
                  {formatDateTime(quote.created_at)}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                {quote.phone ? (
                  <a href={`tel:${quote.phone}`} className="font-semibold text-enterprise-blue">
                    {quote.phone}
                  </a>
                ) : null}
                {quote.email ? (
                  <a href={`mailto:${quote.email}`} className="font-semibold text-enterprise-blue">
                    {quote.email}
                  </a>
                ) : null}
              </div>

              {quote.details ? (
                <p className="mt-3 text-sm leading-relaxed text-enterprise-gray">{quote.details}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {quote.status === "new" ? (
                  <Button
                    variant="secondary"
                    className="rounded-sharp px-4 py-2 text-xs"
                    onClick={() => void onMark(quote.id, "contacted")}
                  >
                    Mark Contacted
                  </Button>
                ) : (
                  <span className="inline-flex items-center rounded-sharp border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-green-700">
                    Contacted
                  </span>
                )}
                <Button
                  variant="ghost"
                  className="rounded-sharp px-4 py-2 text-xs"
                  onClick={() => void onMark(quote.id, "closed")}
                >
                  Close
                </Button>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-sharp border border-enterprise-border bg-white p-4 text-sm text-enterprise-gray">
            No open requests. New submissions from the website appear here.
          </p>
        )}
      </div>
    </section>
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
  employees: Employee[];
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
        <div className="flex h-11 w-11 items-center justify-center rounded-sharp bg-enterprise-blue/10 text-enterprise-blue">
          <PlusCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-enterprise-blue">Dispatch</p>
          <h3 className="font-display text-2xl font-bold uppercase tracking-[0.01em] text-enterprise-charcoal">Create shipment</h3>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Input
          id="new-tracking-number"
          label="Tracking number (optional)"
          value={form.trackingNumber}
          onChange={(event) => setForm({ ...form, trackingNumber: event.target.value.toUpperCase() })}
          placeholder="Leave blank to generate automatically"
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

      <Button type="submit" className="mt-6 rounded-sharp" disabled={isSaving}>
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Create Shipment
      </Button>
    </form>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sharp border border-enterprise-border bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-enterprise-blue">{label}</p>
      <p className="mt-2 font-semibold text-enterprise-charcoal">{value}</p>
    </div>
  );
}
