"use client";

import { useId } from "react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { powerWashingQuoteSchema, type PowerWashingQuoteInput } from "@/lib/validation";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { FileUpload } from "@/components/FileUpload";

const serviceOptions = [
  "House Washing",
  "Driveway",
  "Sidewalk",
  "Patio",
  "Garage",
  "Exterior Surfaces",
  "Multiple Services",
  "Other",
];

export function PowerWashingQuoteForm() {
  const formId = useId().replace(/:/g, "");
  const startedAtRef = useRef(Date.now());
  const [serverState, setServerState] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [photoName, setPhotoName] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PowerWashingQuoteInput>({
    resolver: zodResolver(powerWashingQuoteSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      propertyAddress: "",
      serviceType: "",
      description: "",
      photoUrls: [],
      preferredServiceDate: "",
      companyWebsite: "",
      submittedAt: startedAtRef.current,
    },
  });

  const onSubmit = async (values: PowerWashingQuoteInput) => {
    setServerState(null);
    try {
      const netlifyFormName = "power-washing-quote-form";
      const body = new URLSearchParams({
        "form-name": netlifyFormName,
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        propertyAddress: values.propertyAddress,
        serviceType: values.serviceType,
        description: values.description,
        preferredServiceDate: values.preferredServiceDate || "",
        uploadedPhotos: photoName || "",
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
      setPhotoName("");
      startedAtRef.current = Date.now();
      setServerState({
        type: "success",
        message:
          "Thank you. Your power washing quote request has been sent. Polley Enterprise will contact you soon.",
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
        name="power-washing-quote-form"
        data-netlify="true"
        data-netlify-honeypot="companyWebsite"
        hidden
      >
        <input type="text" name="fullName" />
        <input type="email" name="email" />
        <input type="tel" name="phoneNumber" />
        <input type="text" name="propertyAddress" />
        <input type="text" name="serviceType" />
        <textarea name="description" />
        <input type="text" name="preferredServiceDate" />
        <input type="text" name="uploadedPhotos" />
        <input type="text" name="companyWebsite" />
        <input type="text" name="submittedAt" />
      </form>
      <form
        id={formId}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-3xl border border-enterprise-border bg-white p-6 shadow-card md:p-8"
        noValidate
      >
      <Input id="pwFullName" label="Full Name" error={errors.fullName?.message} {...register("fullName")} />
      <Input id="pwEmail" label="Email" type="email" error={errors.email?.message} {...register("email")} />
      <Input id="pwPhoneNumber" label="Phone Number" type="tel" error={errors.phoneNumber?.message} {...register("phoneNumber")} />
      <Input id="propertyAddress" label="Property Address" error={errors.propertyAddress?.message} {...register("propertyAddress")} />
      <Select
        id="serviceType"
        label="Type of Service Needed"
        options={serviceOptions.map((option) => ({ label: option, value: option }))}
        error={errors.serviceType?.message}
        {...register("serviceType")}
      />
      <Textarea id="description" label="Description" rows={5} error={errors.description?.message} {...register("description")} />
      <Input id="preferredServiceDate" label="Preferred Service Date" type="date" error={errors.preferredServiceDate?.message} {...register("preferredServiceDate")} />
      <FileUpload
        id="uploadPhotos"
        label="Upload Photos"
        helpText={photoName ? `Selected: ${photoName}` : "Optional: include a photo file name for context."}
        onChange={(fileName) => {
          setPhotoName(fileName);
          setValue("photoUrls", fileName ? [fileName] : []);
        }}
      />
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
