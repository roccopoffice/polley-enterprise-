import { z } from "zod";

const honeypotField = z.string().max(0).optional().default("");
const submitTs = z.number().optional();

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  message: z
    .string()
    .min(10, "Message is required")
    .max(1500, "Message must be under 1500 characters"),
  companyWebsite: honeypotField,
  submittedAt: submitTs,
});

export const vehicleQuoteSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(7, "Phone number is required"),
  pickupLocation: z.string().min(2, "Pickup location is required"),
  deliveryLocation: z.string().min(2, "Delivery location is required"),
  vehicleYear: z.string().min(2, "Vehicle year is required"),
  vehicleMake: z.string().min(2, "Vehicle make is required"),
  vehicleModel: z.string().min(2, "Vehicle model is required"),
  trailerType: z.enum(["Open Trailer", "Enclosed Trailer"], {
    errorMap: () => ({ message: "Trailer type is required" }),
  }),
  additionalNotes: z.string().max(1500).optional().default(""),
  companyWebsite: honeypotField,
  submittedAt: submitTs,
});

export const powerWashingQuoteSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(7, "Phone number is required"),
  propertyAddress: z.string().min(3, "Property address is required"),
  serviceType: z.string().min(2, "Service type is required"),
  description: z
    .string()
    .min(10, "Description is required")
    .max(1500, "Description must be under 1500 characters"),
  photoUrls: z.array(z.string().url()).optional().default([]),
  preferredServiceDate: z.string().optional().default(""),
  companyWebsite: honeypotField,
  submittedAt: submitTs,
});

export const careersApplicationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(7, "Phone number is required"),
  address: z.string().min(3, "Address is required"),
  positionApplyingFor: z.string().min(2, "Position is required"),
  yearsOfExperience: z.string().min(1, "Years of experience is required"),
  resumeFileName: z.string().optional().default("Not provided"),
  certifications: z.string().optional().default(""),
  coverLetter: z.string().max(2000).optional().default(""),
  availability: z.string().min(2, "Availability is required"),
  companyWebsite: honeypotField,
  submittedAt: submitTs,
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type VehicleQuoteInput = z.infer<typeof vehicleQuoteSchema>;
export type PowerWashingQuoteInput = z.infer<typeof powerWashingQuoteSchema>;
export type CareersApplicationInput = z.infer<typeof careersApplicationSchema>;
