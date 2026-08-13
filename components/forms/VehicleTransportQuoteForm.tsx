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
import { submitForm } from "@/lib/api";

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
      await submitForm({
        form: "vehicle-transport",
        fullName: values.fullName,
        email: values.email,
        phone: values.phoneNumber,
        inquiryType: "Vehicle Transportation",
        location: `${values.pickupLocation} to ${values.deliveryLocation}`,
        details: values.additionalNotes || "",
        pickupLocation: values.pickupLocation,
        deliveryLocation: values.deliveryLocation,
        vehicleYear: values.vehicleYear,
        vehicleMake: values.vehicleMake,
        vehicleModel: values.vehicleModel,
        trailerType: values.trailerType,
        companyWebsite: values.companyWebsite || "",
        submittedAt: startedAtRef.current,
      });

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
        id={formId}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-card border border-enterprise-border bg-white p-6 shadow-card md:p-8"
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
