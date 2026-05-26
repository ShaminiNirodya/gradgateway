import { z } from "zod";

// Step 1: Company Info
export const companyInfoSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyEmail: z.string().email("Invalid company email address"),
  phone: z.string().regex(/^\+94\d{9}$/i, "Must be a valid Sri Lankan number (+94...)"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  industry: z.string().min(1, "Please select an industry"),
  // Optional base64 data URL for company logo preview/upload handoff
  logoDataUrl: z.string().optional(),
});

// Step 2: Recruiter / Contact Info
export const recruiterInfoSchema = z.object({
  recruiterName: z.string().min(2, "Name must be at least 2 characters"),
  recruiterEmail: z.string().email("Invalid email address"),
  recruiterPhone: z.string().regex(/^\+94\d{9}$/i, "Must be a valid Sri Lankan number (+94...)"),
  position: z.string().min(2, "Position is required"),
});

// Step 3: Security
export const companySecuritySchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CompanyInfoData = z.infer<typeof companyInfoSchema>;
export type RecruiterInfoData = z.infer<typeof recruiterInfoSchema>;
export type CompanySecurityData = z.infer<typeof companySecuritySchema>;
