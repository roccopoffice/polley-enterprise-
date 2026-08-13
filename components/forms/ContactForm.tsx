"use client";

import { useId } from "react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormInput } from "@/lib/validation";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Button } from "@/components/Button";
import { submitForm } from "@/lib/api";

export function ContactForm() {
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
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      companyWebsite: "",
      submittedAt: startedAtRef.current,
    },
  });

  const onSubmit = async (values: ContactFormInput) => {
    setServerState(null);
    try {
      await submitForm({
        form: "contact",
        fullName: values.name,
        email: values.email,
        phone: values.phone || "",
        inquiryType: values.subject,
        details: values.message,
        companyWebsite: values.companyWebsite || "",
        submittedAt: startedAtRef.current,
      });

      reset();
      startedAtRef.current = Date.now();
      setServerState({
        type: "success",
        message: "Thank you. Your message has been sent. Polley Enterprise will contact you soon.",
      });
    } catch {
      setServerState({
        type: "error",
        message: "Unable to send message. Please try again.",
      });
    }
  };

  return (
    <>
      <form
        id={formId}
        className="space-y-4 rounded-card border border-enterprise-border bg-white p-6 shadow-card md:p-8"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
      <Input id="name" label="Name" error={errors.name?.message} {...register("name")} />
      <Input id="email" label="Email" type="email" error={errors.email?.message} {...register("email")} />
      <Input id="phone" label="Phone" type="tel" error={errors.phone?.message} {...register("phone")} />
      <Input id="subject" label="Subject" error={errors.subject?.message} {...register("subject")} />
      <Textarea id="message" label="Message" rows={5} error={errors.message?.message} {...register("message")} />
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" {...register("companyWebsite")} />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Sending..." : "Send Message"}
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
