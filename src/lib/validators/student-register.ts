import { z } from "zod";

// Step 1: Personal Info
export const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+94\d{9}$/, "Must be a valid Sri Lankan number (+94...)"),
  // We'll handle the image file separately in the component state
});

// Step 2: Academic Info
export const academicInfoSchema = z.object({
  university: z.string().min(1, "Please select your university"),
  studentId: z.string().min(4, "Student ID is required"),
  degree: z.string().min(1, "Please select your degree program"),
  gradYear: z.string().min(4, "Please select graduation year"),
  gpa: z.string().refine((val) => {
    const num = parseFloat(val);
    return num >= 0 && num <= 4.0;
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
