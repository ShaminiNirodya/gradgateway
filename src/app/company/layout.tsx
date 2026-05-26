'use client';

import ProtectedRoute from '@/components/features/auth/ProtectedRoute';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['Company']}>{children}</ProtectedRoute>;
}
