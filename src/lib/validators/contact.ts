import { z } from "zod";

export const inquiryTypes = [
  "GENERAL",
  "SECURITY",
  "SUPPORT",
  "FEEDBACK",
  "COMPANY",
  "UNIVERSITY",
  "STUDENT",
  "OTHER",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^\+94\d{9}$/.test(value),
      "Use a valid Sri Lankan number (+94 followed by 9 digits)"
    ),
  type: z.enum(inquiryTypes, { message: "Please choose an inquiry type" }),
  message: z
    .string()
    .trim()
    .min(10, "Please provide more details (min 10 characters)")
    .max(1000, "Keep it under 1000 characters"),
  attachment: z
    .object({
      name: z.string(),
      size: z.number().max(5 * 1024 * 1024),
      type: z.string().optional(),
    })
    .optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
