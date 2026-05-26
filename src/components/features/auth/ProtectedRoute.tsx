'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { UserRole } from '@/lib/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If not authenticated, redirect to login
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // If roles are specified and user doesn't have access
      if (allowedRoles && userData && !allowedRoles.includes(userData.role as UserRole)) {
        // Redirect based on their actual role
        switch(userData.role) {
          case 'Admin':
            router.push('/dashboard/admin');
            break;
          case 'Student':
            router.push('/dashboard/student');
            break;
          case 'Company':
            router.push('/dashboard/company');
            break;
          default:
            router.push('/');
        }
      }
    }
  }, [user, userData, loading, allowedRoles, router, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C5DD3]"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  // Don't render if role check fails
  if (allowedRoles && userData && !allowedRoles.includes(userData.role as UserRole)) {
    return null;
  }

  return <>{children}</>;
}
