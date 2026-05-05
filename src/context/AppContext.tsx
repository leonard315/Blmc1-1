"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { ROLES, type UserRole } from '@/lib/mock-data';

// ── App User type ──────────────────────────────────────────────────────────
export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'deactivated';
  savings: number;
  debt: number;
  joinedDate: string;
}

// ── Context type ───────────────────────────────────────────────────────────
interface AppContextType {
  currentUser: AppUser | null;
  setCurrentUser: (user: AppUser | null) => void;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { auth, firestore } = initializeFirebase();

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            // Check if account is deactivated
            if (data.status === 'deactivated') {
              await signOut(auth);
              setCurrentUser(null);
            } else {
              setCurrentUser({
                id: firebaseUser.uid,
                name: data.name ?? firebaseUser.displayName ?? 'User',
                email: firebaseUser.email ?? '',
                role: data.role ?? ROLES.MEMBER,
                status: data.status ?? 'active',
                savings: data.savings ?? 0,
                debt: data.debt ?? 0,
                joinedDate: data.joinedDate ?? new Date().toISOString().slice(0, 10),
              });
            }
          } else {
            // No Firestore profile — create a basic one
            const newUser: AppUser = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'User',
              email: firebaseUser.email ?? '',
              role: ROLES.MEMBER,
              status: 'active',
              savings: 0,
              debt: 0,
              joinedDate: new Date().toISOString().slice(0, 10),
            };
            await setDoc(doc(firestore, 'users', firebaseUser.uid), newUser);
            setCurrentUser(newUser);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback: use Firebase user data only
          setCurrentUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName ?? 'User',
            email: firebaseUser.email ?? '',
            role: ROLES.MEMBER,
            status: 'active',
            savings: 0,
            debt: 0,
            joinedDate: new Date().toISOString().slice(0, 10),
          });
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      // Check Firestore for deactivated status
      const userDoc = await getDoc(doc(firestore, 'users', credential.user.uid));
      if (userDoc.exists() && userDoc.data().status === 'deactivated') {
        await signOut(auth);
        setIsLoading(false);
        return false;
      }
      // onAuthStateChanged will handle setting currentUser
      return true;
    } catch (error: any) {
      console.error('Login error:', error?.code, error?.message);
      setIsLoading(false);
      return false;
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  // ── Password Reset ───────────────────────────────────────────────────────
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      isLoading,
      login,
      logout,
      resetPassword,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
