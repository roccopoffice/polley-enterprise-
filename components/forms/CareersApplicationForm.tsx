"use client";

import { useId } from "react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { careersApplicationSchema, type CareersApplicationInput } from "@/lib/validation";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Select } from "@/components/Select";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/Button";

const positions = [
  "Drivers",
  "Transport Specialists",
  "Laborers",
  "Washout Technicians",
  "Power Washing Technicians",
  "General Operations",
];

export function CareersApplicationForm() {
  const formId = useId().replace(/:/g, "");
  const startedAtRef = useRef(Date.now());
  const [serverState, setServerState] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [resumeFileName, setResumeFileName] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CareersApplicationInput>({
    resolver: zodResolver(careersApplicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      positionApplyingFor: "",
      yearsOfExperience: "",
      resumeFileName: "",
      certifications: "",
      coverLetter: "",
      availability: "",
      companyWebsite: "",
      submittedAt: startedAtRef.current,
    },
  });

  const onSubmit = async (values: CareersApplicationInput) => {
    setServerState(null);
    try {
      const netlifyFormName = "careers-application-form";
      const body = new URLSearchParams({
        "form-name": netlifyFormName,
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: values.address,
        positionApplyingFor: values.positionApplyingFor,
        yearsOfExperience: values.yearsOfExperience,
        resumeFileName: resumeFileName || "Not provided",
        certifications: values.certifications || "",
        coverLetter: values.coverLetter || "",
        availability: values.availability,
        companyWebsite: values.companyWebsite || "",
        submittedAt: String(startedAtRef.current),
      });

      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!response.ok) throw new Error("Unable to submit application.");

      reset();
      setResumeFileName("");
      startedAtRef.current = Date.now();
      setServerState({
        type: "success",
        message: "Thank you for applying. Your application has been sent to Polley Enterprise.",
      });
    } catch {
      setServerState({
        type: "error",
        message: "Unable to submit application.",
      });
    }
  };

  return (
    <>
      <form
        name="careers-application-form"
        data-netlify="true"
        data-netlify-honeypot="companyWebsite"
        hidden
      >
        <input type="text" name="fullName" />
        <input type="email" name="email" />
        <input type="tel" name="phoneNumber" />
        <input type="text" name="address" />
        <input type="text" name="positionApplyingFor" />
        <input type="text" name="yearsOfExperience" />
        <input type="text" name="resumeFileName" />
        <input type="text" name="certifications" />
        <textarea name="coverLetter" />
        <input type="text" name="availability" />
        <input type="text" name="companyWebsite" />
        <input type="text" name="submittedAt" />
      </form>
      <form
        id={formId}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-3xl border border-enterprise-border bg-white p-6 shadow-card md:p-8"
        noValidate
      >
      <Input id="careerFullName" label="Full Name" error={errors.fullName?.message} {...register("fullName")} />
      <Input id="careerEmail" label="Email" type="email" error={errors.email?.message} {...register("email")} />
      <Input id="careerPhone" label="Phone Number" type="tel" error={errors.phoneNumber?.message} {...register("phoneNumber")} />
      <Input id="careerAddress" label="Address" error={errors.address?.message} {...register("address")} />
      <Select
        id="positionApplyingFor"
        label="Position Applying For"
        options={positions.map((position) => ({ label: position, value: position }))}
        error={errors.positionApplyingFor?.message}
        {...register("positionApplyingFor")}
      />
      <Input id="yearsOfExperience" label="Years of Experience" error={errors.yearsOfExperience?.message} {...register("yearsOfExperience")} />
      <FileUpload
        id="resumeUpload"
        label="Resume Upload"
        helpText={resumeFileName ? `Selected: ${resumeFileName}` : "Optional but recommended"}
        onChange={(fileName) => {
          setResumeFileName(fileName);
          setValue("resumeFileName", fileName);
        }}
      />
      <Input id="certifications" label="Certifications" error={errors.certifications?.message} {...register("certifications")} />
      <Textarea id="coverLetter" label="Cover Letter" rows={4} error={errors.coverLetter?.message} {...register("coverLetter")} />
      <Input id="availability" label="Availability" error={errors.availability?.message} {...register("availability")} />
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" {...register("companyWebsite")} />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Sending..." : "Apply Now"}
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
