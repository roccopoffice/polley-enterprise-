"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Textarea } from "@/components/Textarea";
import { Button } from "@/components/Button";
import { ApiError, submitForm } from "@/lib/api";

const unifiedQuoteSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(7, "Phone is required"),
  inquiryType: z.string().min(2, "Please choose an inquiry type"),
  location: z.string().min(2, "Location is required"),
  preferredDate: z.string().optional(),
  details: z
    .string()
    .min(8, "Please add a few details")
    .max(1200, "Please keep details under 1200 characters"),
  companyWebsite: z.string().max(0).optional().default(""),
  submittedAt: z.number(),
});

type UnifiedQuoteInput = z.infer<typeof unifiedQuoteSchema>;

const inquiryOptions = [
  "Vehicle Transportation",
  "Freight / Hauling",
  "Trailer Washout",
  "Big Rig Cleaning",
  "Power Washing",
  "Moving Services",
  "Personnel Transportation",
  "General Question",
];

export function UnifiedQuoteForm() {
  const startedAtRef = useRef(Date.now());
  const [serverState, setServerState] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UnifiedQuoteInput>({
    resolver: zodResolver(unifiedQuoteSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      inquiryType: "",
      location: "",
      preferredDate: "",
      details: "",
      companyWebsite: "",
      submittedAt: startedAtRef.current,
    },
  });

  const onSubmit = async (values: UnifiedQuoteInput) => {
    setServerState(null);
    try {
      await submitForm({
        form: "quote",
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        inquiryType: values.inquiryType,
        location: values.location,
        preferredDate: values.preferredDate || "",
        details: values.details,
        companyWebsite: values.companyWebsite || "",
        submittedAt: startedAtRef.current,
      });

      reset();
      startedAtRef.current = Date.now();
      setServerState({
        type: "success",
        message: "Thanks. Your request is in. We will reach out soon.",
      });
    } catch (submitError) {
      setServerState({
        type: "error",
        message:
          submitError instanceof ApiError && submitError.status === 400
            ? submitError.message
            : "Could not submit right now. Please call (832) 960-4471.",
      });
    }
  };

  return (
    <>
      <form
        className="section-shell p-6 md:p-8"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <p className="mb-4 text-sm text-enterprise-gray">
          Prefer phone? Call <a href="tel:18329604471" className="font-semibold text-enterprise-blue">(832) 960-4471</a>.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            id="qFullName"
            label="Name"
            autoComplete="name"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <Input
            id="qEmail"
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            id="qPhone"
            label="Phone"
            type="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            id="qLocation"
            label="City / Area"
            autoComplete="address-level2"
            error={errors.location?.message}
            {...register("location")}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Select
            id="qInquiryType"
            label="What do you need?"
            options={inquiryOptions.map((item) => ({ label: item, value: item }))}
            error={errors.inquiryType?.message}
            {...register("inquiryType")}
          />
          <Input
            id="qPreferredDate"
            label="Preferred Date (Optional)"
            type="date"
            error={errors.preferredDate?.message}
            {...register("preferredDate")}
          />
        </div>

        <div className="mt-4">
          <Textarea
            id="qDetails"
            label="Quick details"
            rows={5}
            error={errors.details?.message}
            placeholder="What do you need help with?"
            {...register("details")}
          />
        </div>

        <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" {...register("companyWebsite")} />

        <div className="mt-5">
          <Button type="submit" disabled={isSubmitting} className="w-full rounded-sharp py-3.5 text-base">
            {isSubmitting ? "Sending..." : "Send Request"}
          </Button>
        </div>

        <div aria-live="polite" className="mt-3">
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
