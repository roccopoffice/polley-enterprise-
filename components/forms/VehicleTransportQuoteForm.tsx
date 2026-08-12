"use client";

import { useId } from "react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleQuoteSchema, type VehicleQuoteInput } from "@/lib/validation";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";

export function VehicleTransportQuoteForm() {
  const formId = useId().replace(/:/g, "");
  const startedAtRef = useRef(Date.now());
  const [serverState, setServerState] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleQuoteInput>({
    resolver: zodResolver(vehicleQuoteSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      pickupLocation: "",
      deliveryLocation: "",
      vehicleYear: "",
      vehicleMake: "",
      vehicleModel: "",
      trailerType: undefined,
      additionalNotes: "",
      companyWebsite: "",
      submittedAt: startedAtRef.current,
    },
  });

  const onSubmit = async (values: VehicleQuoteInput) => {
    setServerState(null);
    try {
      const netlifyFormName = "vehicle-transport-quote-form";
      const body = new URLSearchParams({
        "form-name": netlifyFormName,
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        pickupLocation: values.pickupLocation,
        deliveryLocation: values.deliveryLocation,
        vehicleYear: values.vehicleYear,
        vehicleMake: values.vehicleMake,
        vehicleModel: values.vehicleModel,
        trailerType: values.trailerType,
        additionalNotes: values.additionalNotes || "",
        companyWebsite: values.companyWebsite || "",
        submittedAt: String(startedAtRef.current),
      });

      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!response.ok) throw new Error("Unable to send quote request.");

      reset();
      startedAtRef.current = Date.now();
      setServerState({
        type: "success",
        message:
          "Thank you. Your vehicle transport quote request has been sent. Polley Enterprise will contact you soon.",
      });
    } catch {
      setServerState({
        type: "error",
        message: "Unable to send quote request.",
      });
    }
  };

  return (
    <>
      <form
        name="vehicle-transport-quote-form"
        data-netlify="true"
        data-netlify-honeypot="companyWebsite"
        hidden
      >
        <input type="text" name="fullName" />
        <input type="email" name="email" />
        <input type="tel" name="phoneNumber" />
        <input type="text" name="pickupLocation" />
        <input type="text" name="deliveryLocation" />
        <input type="text" name="vehicleYear" />
        <input type="text" name="vehicleMake" />
        <input type="text" name="vehicleModel" />
        <input type="text" name="trailerType" />
        <textarea name="additionalNotes" />
        <input type="text" name="companyWebsite" />
        <input type="text" name="submittedAt" />
      </form>
      <form
        id={formId}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-3xl border border-enterprise-border bg-white p-6 shadow-card md:p-8"
        noValidate
      >
      <Input id="fullName" label="Full Name" error={errors.fullName?.message} {...register("fullName")} />
      <Input id="email" label="Email" type="email" error={errors.email?.message} {...register("email")} />
      <Input id="phoneNumber" label="Phone Number" type="tel" error={errors.phoneNumber?.message} {...register("phoneNumber")} />
      <Input id="pickupLocation" label="Pickup Location" error={errors.pickupLocation?.message} {...register("pickupLocation")} />
      <Input id="deliveryLocation" label="Delivery Location" error={errors.deliveryLocation?.message} {...register("deliveryLocation")} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input id="vehicleYear" label="Vehicle Year" error={errors.vehicleYear?.message} {...register("vehicleYear")} />
        <Input id="vehicleMake" label="Vehicle Make" error={errors.vehicleMake?.message} {...register("vehicleMake")} />
        <Input id="vehicleModel" label="Vehicle Model" error={errors.vehicleModel?.message} {...register("vehicleModel")} />
      </div>
      <Select
        id="trailerType"
        label="Open Trailer or Enclosed Trailer"
        options={[
          { label: "Open Trailer", value: "Open Trailer" },
          { label: "Enclosed Trailer", value: "Enclosed Trailer" },
        ]}
        error={errors.trailerType?.message}
        {...register("trailerType")}
      />
      <Textarea id="additionalNotes" label="Additional Notes" rows={4} error={errors.additionalNotes?.message} {...register("additionalNotes")} />
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" {...register("companyWebsite")} />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Sending..." : "Submit Quote Request"}
      </Button>
      <div aria-live="polite">
        {serverState ? (
          <p className={serverState.type === "success" ? "text-sm font-medium text-enterprise-success" : "text-sm font-medium text-red-600"}>
            {serverState.message}
          </p>
        ) : null}
      </div>
      </form>
    </>
  );
}
