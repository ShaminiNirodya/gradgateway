export type UserRole = 'Admin' | 'Student' | 'Company';

export interface UserResponse {
  email: string;
  role: UserRole;
  firebaseUid: string;
  isActive?: boolean;
}

export interface UserRegistration {
  email: string;
  firebaseUid: string;
  role: UserRole;
}
