"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, db } from './firebase';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Store user data in Firestore
  const createUserDocument = async (user: User, name?: string) => {
    if (!user.uid) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    // Only create document if it doesn't exist
    if (!userSnap.exists()) {
      const { email, photoURL} = user;
      const userData = {
        name: name || user.displayName || email?.split('@')[0] || 'User',
        email,
        photoURL: photoURL || null,
        createdAt: serverTimestamp(),
      };

      try {
        await setDoc(userRef, userData);

        // Update profile if name was provided and displayName is empty
        if (name && !user.displayName) {
          await updateProfile(user, { displayName: name });
        }
      } catch (error) {
        console.error('Error creating user document:', error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // No need to create document on sign in, but we could update last login time if needed
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Store the user data in Firestore
      await createUserDocument(userCredential.user, name);
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      // Store the user data in Firestore
      await createUserDocument(userCredential.user);
      router.push('/dashboard');
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
      <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, logout }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
