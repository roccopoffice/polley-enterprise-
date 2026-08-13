"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, MapPin, PackageSearch, RefreshCw } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { formatDateTime, formatTrackingNumber, serviceTypeLabels, shipmentStatusLabels } from "@/lib/tracking";
import { ApiError, trackShipment } from "@/lib/api";
import type { TrackingResult } from "@/lib/types";

export function TrackShipmentForm() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function loadShipment(rawTrackingNumber = trackingNumber, quiet = false) {
    const formattedTrackingNumber = formatTrackingNumber(rawTrackingNumber);
    if (!formattedTrackingNumber) {
      setError("Enter a tracking number to continue.");
      return;
    }

    if (!quiet) setIsLoading(true);
    setError("");

    try {
      const response = await trackShipment(formattedTrackingNumber);
      setTrackingNumber(formattedTrackingNumber);
      setResult({
        shipment: response.shipment,
        events: response.events,
        location: response.location,
      });
    } catch (trackError) {
      if (trackError instanceof ApiError && trackError.status !== 0) {
        // Keep any shipment already on screen when a refresh fails.
        if (!quiet) setResult(null);
        setError(trackError.message);
      } else if (!quiet) {
        setError("Tracking is unavailable right now. Please call Polley Enterprise for help.");
      }
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadShipment();
  }

  const activeTrackingNumber = result?.shipment.tracking_number;

  useEffect(() => {
    if (!activeTrackingNumber) return;

    const interval = window.setInterval(() => {
      void loadShipment(activeTrackingNumber, true);
    }, 30000);

    return () => window.clearInterval(interval);
    // Refreshes the currently viewed tracking number without restarting on every input change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrackingNumber]);

  const shipment = result?.shipment;
  const latestEvent = result?.events[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <form onSubmit={onSubmit} className="section-shell h-fit p-6 md:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-sharp bg-enterprise-blue/10 text-enterprise-blue">
          <PackageSearch className="h-6 w-6" />
        </div>
        <h2 className="font-display mt-5 text-3xl font-bold uppercase tracking-[0.01em] text-enterprise-charcoal">
          Enter your tracking number
        </h2>
        <p className="mt-3 text-enterprise-gray">
          Use the number provided by Polley Enterprise to see the latest shipment status.
        </p>
        <div className="mt-6">
          <Input
            id="tracking-number"
            label="Tracking number"
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            placeholder="PE-10482"
            autoComplete="off"
          />
        </div>
        {error ? (
          <p className="mt-4 flex gap-2 rounded-sharp border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        ) : null}
        <Button type="submit" className="mt-6 w-full rounded-sharp" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Track Shipment
        </Button>
        <p className="mt-4 text-sm text-enterprise-gray">
          Need help? Call <a className="font-semibold text-enterprise-blue" href="tel:18329604471">(832) 960-4471</a>.
        </p>
      </form>

      <div className="section-shell min-h-[28rem] p-6 md:p-8">
        {shipment ? (
          <div>
            <div className="flex flex-col gap-4 border-b border-enterprise-border pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-enterprise-blue">
                  {shipment.tracking_number}
                </p>
                <h3 className="font-display mt-2 text-3xl font-bold uppercase tracking-[0.01em] text-enterprise-charcoal">
                  {shipmentStatusLabels[shipment.status]}
                </h3>
                <p className="mt-2 text-enterprise-gray">{serviceTypeLabels[shipment.service_type]}</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="rounded-sharp px-4 py-3 text-sm"
                onClick={() => void loadShipment(shipment.tracking_number)}
                disabled={isLoading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoCard label="Pickup" value={`${shipment.pickup_city}, ${shipment.pickup_state}`} />
              <InfoCard label="Dropoff" value={`${shipment.dropoff_city}, ${shipment.dropoff_state}`} />
              <InfoCard label="Scheduled" value={formatDateTime(shipment.scheduled_for)} />
              <InfoCard label="Last updated" value={formatDateTime(shipment.updated_at)} />
            </div>

            <div className="mt-6 rounded-card border border-enterprise-border bg-enterprise-light/70 p-5">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-enterprise-blue" />
                <div>
                  <h4 className="font-bold text-enterprise-charcoal">
                    {latestEvent?.title ?? "Shipment is being monitored"}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-enterprise-gray">
                    {latestEvent?.message ??
                      shipment.public_notes ??
                      "Check back here for updates as the shipment moves forward."}
                  </p>
                  {latestEvent ? (
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-enterprise-blue">
                      {formatDateTime(latestEvent.created_at)}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {result && result.events.length > 1 ? (
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-enterprise-blue">
                  Shipment history
                </h4>
                <ol className="mt-4 space-y-3 border-l border-enterprise-border pl-5">
                  {result.events.slice(1).map((event, index) => (
                    <li key={`${event.created_at}-${index}`} className="relative">
                      <span className="absolute -left-[1.44rem] top-2 h-2 w-2 rounded-full bg-enterprise-blue/50" />
                      <p className="font-semibold text-enterprise-charcoal">{event.title}</p>
                      {event.message ? (
                        <p className="mt-1 text-sm text-enterprise-gray">{event.message}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-enterprise-gray">{formatDateTime(event.created_at)}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {result?.location ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${result.location.latitude},${result.location.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex items-center justify-between gap-4 rounded-card border border-enterprise-border bg-white p-5 transition hover:border-enterprise-blue"
              >
                <span className="flex gap-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-enterprise-blue" />
                  <span>
                    <span className="block font-bold text-enterprise-charcoal">Last known location</span>
                    <span className="mt-1 block text-sm text-enterprise-gray">
                      Updated {formatDateTime(result.location.recorded_at)}
                    </span>
                  </span>
                </span>
                <span className="text-sm font-semibold text-enterprise-blue">Open map</span>
              </a>
            ) : null}
          </div>
        ) : (
          <div className="flex min-h-[24rem] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-card bg-enterprise-blue/10 text-enterprise-blue">
              <MapPin className="h-8 w-8" />
            </div>
            <h3 className="font-display mt-5 text-2xl font-bold uppercase tracking-[0.01em] text-enterprise-charcoal">Shipment details appear here</h3>
            <p className="mt-3 max-w-md text-enterprise-gray">
              Customers can check shipment status, route progress, and the latest public update from the Polley Enterprise team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sharp border border-enterprise-border bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-enterprise-blue">{label}</p>
      <p className="mt-2 font-semibold text-enterprise-charcoal">{value}</p>
    </div>
  );
}
