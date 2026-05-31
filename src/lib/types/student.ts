export interface StudentRegistration {
  email: string;
  firebaseUid: string;
  fullName: string;
  phone: string;
  photoDataUrl?: string;
  university: string;
  studentId?: string;
  degree: string;
  gradYear: string;
  currentYear: number;
  gpa: string;
  certifications?: string[];
  awards?: string[];
}

export interface StudentProfile {
  email: string;
  firebaseUid: string;
  fullName: string;
  phone: string;
  photoDataUrl?: string;
  university: string;
  studentId: string;
  degree: string;
  gradYear: number;
  currentYear: number;
  gpa: number;
  certifications: string[];
  awards: string[];
}
