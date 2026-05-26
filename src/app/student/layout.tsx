'use client';

import ProtectedRoute from '@/components/features/auth/ProtectedRoute';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['Student']}>{children}</ProtectedRoute>;
}
