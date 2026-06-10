import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { API_ENDPOINTS } from '@/lib/config';
import { UserResponse, UserRegistration, UserRole } from '@/lib/types/auth';
import { EmailLogService } from '@/lib/services/email-log.service';

export class AuthService {
  private static cachedToken: { uid: string; token: string; expiresAt: number } | null = null;

  private static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private static decodeTokenExpiry(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload?.exp) return null;
      return Number(payload.exp) * 1000;
    } catch {
      return null;
    }
  }

  private static cacheToken(uid: string, token: string): void {
    const expiry = this.decodeTokenExpiry(token);
    const fallbackExpiry = Date.now() + 5 * 60 * 1000;
    this.cachedToken = {
      uid,
      token,
      // keep a safety buffer so we refresh before token expiry
      expiresAt: (expiry ?? fallbackExpiry) - 30_000,
    };
  }

  private static getFirebaseErrorMessage(
    error: any,
    context: 'signIn' | 'register' | 'resetPassword' | 'confirmReset' | 'sync' = 'signIn'
  ): string {
    const isNetworkError =
      error instanceof TypeError &&
      (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError'));

    if (isNetworkError) {
      return `Cannot reach backend API at ${API_ENDPOINTS.AUTH.ME}. Ensure the GradGateway API is running and NEXT_PUBLIC_API_URL is correct.`;
    }

    const code = error?.code as string | undefined;

    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. If this is your account, use the same password to continue or reset your password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/user-not-found':
        if (context === 'resetPassword') {
          return 'If an account exists for this email, a reset link will be sent shortly.';
        }
        return 'No account was found for this email. Please register first.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a few minutes and try again.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        if (context === 'register') {
          return 'This email already exists with a different password. Please log in or reset your password.';
        }

        return 'Invalid email or password. Please try again or reset your password.';
      default:
        return error?.message || 'Authentication failed. Please try again.';
    }
  }

  private static async syncFirebaseUserWithBackend(token: string, email: string, firebaseUid: string, role: UserRole): Promise<UserResponse> {
    const registrationData: UserRegistration = {
      email,
      firebaseUid,
      role
    };

    const response = await fetch(API_ENDPOINTS.AUTH.SYNC, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationData)
    });

    if (!response.ok) {
      throw new Error('Failed to sync user with backend');
    }

    const userData: UserResponse = await response.json();
    return userData;
  }

  private static async trackEmailEvent(payload: {
    toEmail: string;
    templateType: string;
    purpose: string;
    status: 'Queued' | 'Sent' | 'Failed' | 'Simulated';
    provider?: string;
    payloadJson?: string;
    error?: string;
  }): Promise<void> {
    try {
      const token = await this.getIdToken();
      if (!token) return;

      await EmailLogService.track(token, {
        toEmail: payload.toEmail,
        templateType: payload.templateType,
        purpose: payload.purpose,
        status: payload.status,
        provider: payload.provider ?? 'FirebaseAuth',
        payloadJson: payload.payloadJson,
        error: payload.error,
        sentAt: payload.status === 'Sent' ? new Date().toISOString() : undefined,
      });
    } catch {
      // Best-effort logging: never block auth flows
    }
  }

  /**
   * Sign in with email and password, then sync with backend
   */
  static async signIn(email: string, password: string, expectedRole?: UserRole): Promise<UserResponse> {
    try {
      const normalizedEmail = this.normalizeEmail(email);
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const token = await userCredential.user.getIdToken();
      
      // Get user info from backend
      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(
          (errBody?.message as string) || 'Failed to get user information from backend'
        );
      }

      const userData: UserResponse = await response.json();

      if (userData.isActive === false && userData.role !== 'Admin') {
        return userData;
      }

      if (expectedRole && userData.role !== expectedRole) {
        await firebaseSignOut(auth);
        this.cachedToken = null;
        throw new Error(`Role mismatch: this account is registered as ${userData.role}. Please use the ${userData.role} login.`);
      }

      return userData;
    } catch (error) {
      console.warn('Sign in failed');
      if (error instanceof Error && error.message.startsWith('Role mismatch:')) {
        throw error;
      }
      throw new Error(this.getFirebaseErrorMessage(error, 'signIn'));
    }
  }

  /**
   * Register a new user with Firebase and sync with backend
   */
  static async register(
    email: string, 
    password: string, 
    role: UserRole
  ): Promise<UserResponse> {
    const normalizedEmail = this.normalizeEmail(email);

    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const token = await userCredential.user.getIdToken();

      return await this.syncFirebaseUserWithBackend(
        token,
        userCredential.user.email!,
        userCredential.user.uid,
        role
      );
    } catch (error: any) {
      if (error && error.code === 'auth/email-already-in-use') {
        try {
          const existingUserCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
          const token = await existingUserCredential.user.getIdToken();

          return await this.syncFirebaseUserWithBackend(
            token,
            existingUserCredential.user.email!,
            existingUserCredential.user.uid,
            role
          );
        } catch (recoveryError) {
          console.warn('Registration recovery failed');
          throw new Error(this.getFirebaseErrorMessage(recoveryError, 'register'));
        }
      }

      console.warn('Registration failed');
      throw new Error(this.getFirebaseErrorMessage(error, 'register'));
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      this.cachedToken = null;
    } catch (error) {
      console.warn('Sign out failed');
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);

    try {
      await sendPasswordResetEmail(auth, normalizedEmail);

      await this.trackEmailEvent({
        toEmail: normalizedEmail,
        templateType: 'PasswordReset',
        purpose: 'Password reset requested',
        status: 'Sent',
        payloadJson: JSON.stringify({ source: 'AuthService.resetPassword' }),
      });
    } catch (error) {
      await this.trackEmailEvent({
        toEmail: normalizedEmail,
        templateType: 'PasswordReset',
        purpose: 'Password reset requested',
        status: 'Failed',
        error: (error as any)?.message ?? 'Unknown error',
        payloadJson: JSON.stringify({ source: 'AuthService.resetPassword' }),
      });

      console.warn('Password reset failed');
      throw new Error(this.getFirebaseErrorMessage(error, 'resetPassword'));
    }
  }

  /**
   * Change password for current user with mandatory recent-auth check.
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const currentUser = auth.currentUser;
    const email = currentUser?.email ? this.normalizeEmail(currentUser.email) : undefined;

    if (!currentUser || !email) {
      throw new Error('No authenticated user found. Please log in again.');
    }

    try {
      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);

      await this.trackEmailEvent({
        toEmail: email,
        templateType: 'PasswordChanged',
        purpose: 'Password changed from account settings',
        status: 'Sent',
        payloadJson: JSON.stringify({ source: 'AuthService.changePassword' }),
      });
    } catch (error: any) {
      await this.trackEmailEvent({
        toEmail: email,
        templateType: 'PasswordChanged',
        purpose: 'Password changed from account settings',
        status: 'Failed',
        error: error?.message ?? 'Unknown error',
        payloadJson: JSON.stringify({ source: 'AuthService.changePassword' }),
      });

      const code = error?.code as string | undefined;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        throw new Error('Current password is incorrect.');
      }
      if (code === 'auth/weak-password') {
        throw new Error('New password is too weak. Use at least 6 characters.');
      }
      if (code === 'auth/requires-recent-login') {
        throw new Error('Please log in again, then retry changing your password.');
      }
      throw new Error(error?.message || 'Failed to change password.');
    }
  }

  /**
   * Get the current user's ID token
   */
  static async getIdToken(forceRefresh = false): Promise<string | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    if (!forceRefresh && this.cachedToken?.uid === currentUser.uid && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken.token;
    }

    try {
      const token = await currentUser.getIdToken(forceRefresh);
      this.cacheToken(currentUser.uid, token);
      return token;
    } catch (error) {
      console.warn('Failed to get token');
      return null;
    }
  }

  /**
   * Sync existing Firebase user with backend (for users who registered before backend was set up)
   */
  static async syncUser(role: UserRole): Promise<UserResponse> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      const token = await currentUser.getIdToken();

      const registrationData: UserRegistration = {
        email: currentUser.email!,
        firebaseUid: currentUser.uid,
        role
      };

      const response = await fetch(API_ENDPOINTS.AUTH.SYNC, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        throw new Error('Failed to sync user with backend');
      }

      const userData: UserResponse = await response.json();
      return userData;
    } catch (error) {
      console.warn('Sync user failed');
      throw new Error(this.getFirebaseErrorMessage(error, 'sync'));
    }
  }
}
