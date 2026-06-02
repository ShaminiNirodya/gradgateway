import { z } from "zod";

// Step 1: Personal Info
export const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+94\d{9}$/, "Must be a valid Sri Lankan number (+94...)"),
  // Optional base64 data URL for preview/upload handoff
  photoDataUrl: z.string().optional(),
});

// Step 2: Academic Info
export const academicInfoSchema = z.object({
  university: z.string().min(1, "Please select your university"),
  fieldOfMajor: z.string().min(1, "Please select your field of major"),
  degree: z.string().min(1, "Please select your degree program"),
  currentYear: z.number().min(1, "Please select your current year").max(4, "Invalid year"),
  gradYear: z.string()
    .min(4, "Please enter graduation year")
    .refine((val) => {
      const year = parseInt(val);
      return year >= 2020 && year <= 2040;
    }, "Graduation year must be between 2020 and 2040"),
  gpa: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 4.0;
  }, "GPA must be between 0.0 and 4.0"),
});

// Step 3: Security
export const securitySchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Types
export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type AcademicInfoData = z.infer<typeof academicInfoSchema>;
export type SecurityData = z.infer<typeof securitySchema>;
