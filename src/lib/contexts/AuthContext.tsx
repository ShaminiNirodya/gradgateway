'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserResponse, UserRole } from '@/lib/types/auth';
import { AuthService } from '@/lib/services/auth.service';
import { API_ENDPOINTS } from '@/lib/config';
import {
  ACCOUNT_BLOCKED_MESSAGE,
  isAccountBlockedResponse,
  isBlockedUserData,
} from '@/lib/utils/account-blocked';

interface AuthContextType {
  user: User | null;
  userData: UserResponse | null;
  loading: boolean;
  accountBlocked: boolean;
  blockedMessage: string;
  refreshAccountStatus: (message?: string) => Promise<void>;
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
  const [accountBlocked, setAccountBlocked] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = sessionStorage.getItem('gg_user_data');
      const parsed = raw ? (JSON.parse(raw) as UserResponse) : null;
      return isBlockedUserData(parsed);
    } catch {
      return false;
    }
  });
  const [blockedMessage, setBlockedMessage] = useState(ACCOUNT_BLOCKED_MESSAGE);

  const persistUserData = useCallback((data: UserResponse | null) => {
    setUserData(data);
    if (data) {
      try {
        sessionStorage.setItem('gg_user_data', JSON.stringify(data));
      } catch {
        // ignore storage issues
      }
      if (isBlockedUserData(data)) {
        setAccountBlocked(true);
        setBlockedMessage(ACCOUNT_BLOCKED_MESSAGE);
      } else if (data.role !== 'Admin') {
        setAccountBlocked(false);
      }
    } else {
      try {
        sessionStorage.removeItem('gg_user_data');
      } catch {
        // ignore storage issues
      }
      setAccountBlocked(false);
      setBlockedMessage(ACCOUNT_BLOCKED_MESSAGE);
    }
  }, []);

  const refreshAccountStatus = useCallback(
    async (message?: string) => {
      const token = await AuthService.getIdToken();
      if (!token) return;

      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = (await response.json()) as UserResponse;
        persistUserData(data);
        if (isBlockedUserData(data)) {
          setAccountBlocked(true);
          if (message) setBlockedMessage(message);
        }
        return;
      }

      if (isAccountBlockedResponse(response.status, await response.json().catch(() => null))) {
        setAccountBlocked(true);
        setBlockedMessage(message ?? ACCOUNT_BLOCKED_MESSAGE);
      }
    },
    [persistUserData]
  );

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const previousUid = sessionStorage.getItem('gg_firebase_uid');
        if (previousUid !== firebaseUser.uid && mounted) {
          persistUserData(null);
        }
        try {
          sessionStorage.setItem('gg_firebase_uid', firebaseUser.uid);
        } catch {
          // ignore storage issues
        }
      }

      if (mounted) {
        setLoading(false);
      }

      if (firebaseUser) {
        try {
          await refreshAccountStatus();
        } catch {
          if (mounted && !userData) {
            persistUserData(null);
          }
        }
      } else if (mounted) {
        persistUserData(null);
        try {
          sessionStorage.removeItem('gg_firebase_uid');
        } catch {
          // ignore storage issues
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [persistUserData, refreshAccountStatus]);

  const signIn = async (email: string, password: string, expectedRole?: UserRole) => {
    const nextUserData = await AuthService.signIn(email, password, expectedRole);
    persistUserData(nextUserData);
    return nextUserData;
  };

  const register = async (email: string, password: string, role: UserRole) => {
    const nextUserData = await AuthService.register(email, password, role);
    persistUserData(nextUserData);
    return nextUserData;
  };

  const signOut = async () => {
    await AuthService.signOut();
    setUser(null);
    persistUserData(null);
    setAccountBlocked(false);
    setBlockedMessage(ACCOUNT_BLOCKED_MESSAGE);
    try {
      sessionStorage.removeItem('gg_firebase_uid');
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
    const nextUserData = await AuthService.syncUser(role);
    persistUserData(nextUserData);
    return nextUserData;
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    accountBlocked,
    blockedMessage,
    refreshAccountStatus,
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
