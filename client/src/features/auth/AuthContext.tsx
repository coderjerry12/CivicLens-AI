import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { type UserRole } from '@/types';

// ─── Types ───

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role: UserRole;
  profileCompleted: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerification: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ─── Context ───

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ─── Provider ───

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Build basic auth user from Firebase user (no Firestore)
  const buildBasicUser = (fbUser: FirebaseUser): AuthUser => ({
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: fbUser.displayName,
    photoURL: fbUser.photoURL,
    emailVerified: fbUser.emailVerified,
    role: 'citizen',
    profileCompleted: false,
  });

  // Fetch user profile from Firestore (safe — never throws)
  const fetchUserProfile = useCallback(async (fbUser: FirebaseUser): Promise<AuthUser> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: data.name || fbUser.displayName,
          photoURL: data.photoURL || fbUser.photoURL,
          emailVerified: fbUser.emailVerified,
          role: data.role || 'citizen',
          profileCompleted: data.profileCompleted || false,
        };
      }
    } catch (err) {
      console.warn('[Auth] Firestore profile fetch failed:', err);
    }
    return buildBasicUser(fbUser);
  }, []);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          setFirebaseUser(fbUser);
          const profile = await fetchUserProfile(fbUser);
          setUser(profile);
        } else {
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (err) {
        console.error('[Auth] Auth state change error:', err);
        if (fbUser) {
          setFirebaseUser(fbUser);
          setUser(buildBasicUser(fbUser));
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  // Sign in with email/password
  const signIn = async (email: string, password: string, rememberMe = false) => {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Sign up with email/password + create Firestore doc
  const signUp = async (email: string, password: string, displayName: string, role: UserRole) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });

    // Create Firestore user document (don't let this crash signup)
    try {
      await setDoc(doc(db, 'users', credential.user.uid), {
        uid: credential.user.uid,
        name: displayName,
        email: email,
        role: role,
        profileCompleted: false,
        photoURL: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('[Auth] Firestore user doc creation failed:', err);
    }

    // Send verification email (don't let this crash signup)
    try {
      await sendEmailVerification(credential.user);
    } catch (err) {
      console.warn('[Auth] Verification email failed:', err);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);

    // Check if user doc exists, if not create one
    try {
      const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', credential.user.uid), {
          uid: credential.user.uid,
          name: credential.user.displayName || '',
          email: credential.user.email || '',
          role: 'citizen',
          profileCompleted: false,
          photoURL: credential.user.photoURL || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('[Auth] Google sign-in Firestore setup failed:', err);
    }
  };

  // Sign out
  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  // Reset password
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Resend verification email
  const sendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  // Refresh user state
  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const profile = await fetchUserProfile(auth.currentUser);
      setFirebaseUser(auth.currentUser);
      setUser(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        sendVerification,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
