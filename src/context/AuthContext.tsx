"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function checkIsAdmin(user: User | null): boolean {
  const adminList = [
    "admin@zentapdigitalsolutions.com",
    "admin@zentap.ai",
    "meet@zentap.ai",
    "meetborad@hotmail.com",
    "thedayithappened736@gmail.com",
  ];

  // If a user is logged in, their email/metadata determines authority
  if (user) {
    const email = (user.email || "").toLowerCase().trim();
    if (
      adminList.includes(email) ||
      email.endsWith("@zentapdigitalsolutions.com") ||
      email.endsWith("@zentap.ai") ||
      user.user_metadata?.role === "admin" ||
      user.app_metadata?.role === "admin"
    ) {
      return true;
    }
    // Regular merchant user logged in - strip any stale admin supreme flag
    if (typeof window !== "undefined") {
      localStorage.removeItem("zentap_admin_supreme");
    }
    return false;
  }

  // If no user is logged in, check standalone admin supreme session key
  if (typeof window !== "undefined" && localStorage.getItem("zentap_admin_supreme") === "true") {
    return true;
  }

  return false;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    metadata?: { full_name?: string; business_name?: string }
  ) => Promise<{ error: AuthError | null; requiresEmailConfirmation: boolean }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: AuthError | null }>;
  updateUserPassword: (password: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Email & Password Sign In
  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  // Email & Password Sign Up
  const signUpWithEmail = async (
    email: string,
    password: string,
    metadata?: { full_name?: string; business_name?: string }
  ) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    // If user is created but session is null, email confirmation is enabled
    const requiresEmailConfirmation = !error && !data.session && !!data.user;

    return { error, requiresEmailConfirmation };
  };

  // Google OAuth SSO Sign In
  const signInWithGoogle = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    return { error };
  };

  // Sign Out
  const signOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("zentap_admin_supreme");
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // Password Reset Email
  const resetPasswordForEmail = async (email: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?type=recovery`,
    });
    return { error };
  };

  // Update Password
  const updateUserPassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const isAdmin = checkIsAdmin(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        resetPasswordForEmail,
        updateUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
