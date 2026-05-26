import { z } from "zod";

export const inquiryTypes = [
  "General",
  "Support",
  "Billing",
  "Partnership",
  "Feedback",
] as const;

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .regex(/^\+94\d{9}$/i, "Must be a valid Sri Lankan number (+94...)")
    .optional()
    .or(z.literal("")),
  type: z.enum(inquiryTypes),
  message: z.string().min(10, "Please provide more details (min 10 characters)").max(1000, "Keep it under 1000 characters"),
  attachment: z
    .object({ name: z.string(), size: z.number().max(5 * 1024 * 1024), type: z.string().optional() })
    .optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
