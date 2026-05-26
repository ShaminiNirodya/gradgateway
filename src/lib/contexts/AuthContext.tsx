'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserResponse, UserRole } from '@/lib/types/auth';
import { AuthService } from '@/lib/services/auth.service';
import { API_ENDPOINTS } from '@/lib/config';

interface AuthContextType {
  user: User | null;
  userData: UserResponse | null;
  loading: boolean;
  signIn: (email: string, password: string, expectedRole?: UserRole) => Promise<UserResponse>;
  register: (email: string, password: string, role: UserRole) => Promise<UserResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  syncUser: (role: UserRole) => Promise<UserResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserResponse | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem('gg_user_data');
      return raw ? (JSON.parse(raw) as UserResponse) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (mounted) {
        // Do not block route rendering while we fetch backend profile/role.
        setLoading(false);
      }

      if (firebaseUser) {
        try {
          const token = await AuthService.getIdToken();
          if (!token) {
            if (mounted) setUserData(null);
            return;
          }

          const response = await fetch(API_ENDPOINTS.AUTH.ME, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!mounted) return;

          if (response.ok) {
            const data: UserResponse = await response.json();
            setUserData(data);
            try {
              sessionStorage.setItem('gg_user_data', JSON.stringify(data));
            } catch {
              // ignore storage issues
            }
          } else {
            setUserData(null);
            try {
              sessionStorage.removeItem('gg_user_data');
            } catch {
              // ignore storage issues
            }
          }
        } catch {
          if (mounted && !userData) {
            setUserData(null);
          }
        }
      } else {
        if (mounted) {
          setUserData(null);
          try {
            sessionStorage.removeItem('gg_user_data');
          } catch {
            // ignore storage issues
          }
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, expectedRole?: UserRole) => {
    const userData = await AuthService.signIn(email, password, expectedRole);
    setUserData(userData);
    try {
      sessionStorage.setItem('gg_user_data', JSON.stringify(userData));
    } catch {
      // ignore storage issues
    }
    return userData;
  };

  const register = async (email: string, password: string, role: UserRole) => {
    const userData = await AuthService.register(email, password, role);
    setUserData(userData);
    try {
      sessionStorage.setItem('gg_user_data', JSON.stringify(userData));
    } catch {
      // ignore storage issues
    }
    return userData;
  };

  const signOut = async () => {
    await AuthService.signOut();
    setUserData(null);
    try {
      sessionStorage.removeItem('gg_user_data');
    } catch {
      // ignore storage issues
    }
  };

  const resetPassword = async (email: string) => {
    await AuthService.resetPassword(email);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await AuthService.changePassword(currentPassword, newPassword);
  };

  const syncUser = async (role: UserRole) => {
    const userData = await AuthService.syncUser(role);
    setUserData(userData);
    try {
      sessionStorage.setItem('gg_user_data', JSON.stringify(userData));
    } catch {
      // ignore storage issues
    }
    return userData;
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    signIn,
    register,
    signOut,
    resetPassword,
    changePassword,
    syncUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
