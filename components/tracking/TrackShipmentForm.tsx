"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, MapPin, PackageSearch, RefreshCw } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { formatDateTime, formatTrackingNumber, serviceTypeLabels, shipmentStatusLabels } from "@/lib/tracking";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { ServiceType, ShipmentStatus } from "@/lib/supabase/types";

type TrackingResponse = {
  id: string;
  tracking_number: string;
  service_type: ServiceType;
  status: ShipmentStatus;
  pickup_city: string;
  pickup_state: string;
  dropoff_city: string;
  dropoff_state: string;
  scheduled_for: string | null;
  public_notes: string | null;
  updated_at: string;
  latest_event_title: string | null;
  latest_event_message: string | null;
  latest_event_at: string | null;
  latitude: number | null;
  longitude: number | null;
  location_recorded_at: string | null;
};

export function TrackShipmentForm() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState<TrackingResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isConfigured = hasSupabaseConfig();

  async function loadShipment(rawTrackingNumber = trackingNumber) {
    const formattedTrackingNumber = formatTrackingNumber(rawTrackingNumber);
    if (!formattedTrackingNumber) {
      setError("Enter a tracking number to continue.");
      return;
    }

    if (!isConfigured) {
      setError("Tracking is ready, but Supabase keys still need to be added in Netlify.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: requestError } = await supabase.rpc("track_shipment", {
        search_tracking_number: formattedTrackingNumber,
      });

      if (requestError) throw requestError;

      const shipment = Array.isArray(data) ? (data[0] as TrackingResponse | undefined) : undefined;
      if (!shipment) {
        setResult(null);
        setError("We could not find that tracking number. Please check it and try again.");
        return;
      }

      setTrackingNumber(formattedTrackingNumber);
      setResult(shipment);
    } catch {
      setError("Tracking is unavailable right now. Please call Polley Enterprise for help.");
    } finally {
      setIsLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadShipment();
  }

  useEffect(() => {
    if (!result) return;

    const interval = window.setInterval(() => {
      void loadShipment(result.tracking_number);
    }, 30000);

    return () => window.clearInterval(interval);
    // Refreshes the currently viewed tracking number without restarting on every input change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.tracking_number]);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <form onSubmit={onSubmit} className="section-shell h-fit p-6 md:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-enterprise-blue/10 text-enterprise-blue">
          <PackageSearch className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-3xl font-bold tracking-tight text-enterprise-charcoal">
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
          <p className="mt-4 flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        ) : null}
        <Button type="submit" className="mt-6 w-full rounded-2xl" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Track Shipment
        </Button>
        <p className="mt-4 text-sm text-enterprise-gray">
          Need help? Call <a className="font-semibold text-enterprise-blue" href="tel:18329604471">(832) 960-4471</a>.
        </p>
      </form>

      <div className="section-shell min-h-[28rem] p-6 md:p-8">
        {result ? (
          <div>
            <div className="flex flex-col gap-4 border-b border-enterprise-border pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-enterprise-blue">
                  {result.tracking_number}
                </p>
                <h3 className="mt-2 text-3xl font-bold text-enterprise-charcoal">
                  {shipmentStatusLabels[result.status]}
                </h3>
                <p className="mt-2 text-enterprise-gray">{serviceTypeLabels[result.service_type]}</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="rounded-2xl px-4 py-3 text-sm"
                onClick={() => void loadShipment(result.tracking_number)}
                disabled={isLoading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoCard label="Pickup" value={`${result.pickup_city}, ${result.pickup_state}`} />
              <InfoCard label="Dropoff" value={`${result.dropoff_city}, ${result.dropoff_state}`} />
              <InfoCard label="Scheduled" value={formatDateTime(result.scheduled_for)} />
              <InfoCard label="Last updated" value={formatDateTime(result.updated_at)} />
            </div>

            <div className="mt-6 rounded-3xl border border-enterprise-border bg-enterprise-light/70 p-5">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-enterprise-blue" />
                <div>
                  <h4 className="font-bold text-enterprise-charcoal">
                    {result.latest_event_title ?? "Shipment is being monitored"}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-enterprise-gray">
                    {result.latest_event_message ??
                      result.public_notes ??
                      "Check back here for updates as the shipment moves forward."}
                  </p>
                  {result.latest_event_at ? (
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-enterprise-blue">
                      {formatDateTime(result.latest_event_at)}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {result.latitude && result.longitude ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${result.latitude},${result.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex items-center justify-between gap-4 rounded-3xl border border-enterprise-border bg-white p-5 shadow-sm transition hover:border-enterprise-blue"
              >
                <span className="flex gap-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-enterprise-blue" />
                  <span>
                    <span className="block font-bold text-enterprise-charcoal">Last known location</span>
                    <span className="mt-1 block text-sm text-enterprise-gray">
                      Updated {formatDateTime(result.location_recorded_at)}
                    </span>
                  </span>
                </span>
                <span className="text-sm font-semibold text-enterprise-blue">Open map</span>
              </a>
            ) : null}
          </div>
        ) : (
          <div className="flex min-h-[24rem] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-enterprise-blue/10 text-enterprise-blue">
              <MapPin className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-enterprise-charcoal">Shipment details appear here</h3>
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
    <div className="rounded-2xl border border-enterprise-border bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-enterprise-blue">{label}</p>
      <p className="mt-2 font-semibold text-enterprise-charcoal">{value}</p>
    </div>
  );
}
