"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function checkIsAdmin(user: User | null): boolean {
  // Strict Superadmin Whitelist: Only verified root administrators have supreme console authority
  const adminList = [
    "admin@zentapdigitalsolutions.com",
    "admin@zentap.ai",
    "meet@zentap.ai",
    "mbborad143bmb@gmail.com",
    "meetborad@hotmail.com"
  ];

  // Helper to check if the session has expired due to inactivity
  const isSessionExpired = () => {
    if (typeof window === "undefined") return false;
    const timeoutMinutes = parseInt(localStorage.getItem("zentap_admin_session_timeout") || "30", 10);
    if (timeoutMinutes > 0) {
      const lastActive = parseInt(localStorage.getItem("zentap_admin_last_active") || "0", 10);
      const now = Date.now();
      if (lastActive > 0 && now - lastActive > timeoutMinutes * 60 * 1000) {
        return true;
      }
    }
    return false;
  };

  // If a user is logged in, their email/metadata determines authority
  if (user) {
    const email = (user.email || "").toLowerCase().trim();
    const isWhitelisted = (
      adminList.includes(email) ||
      email === "admin@zentapdigitalsolutions.com" ||
      user.user_metadata?.role === "admin" ||
      user.app_metadata?.role === "admin"
    );

    if (isWhitelisted) {
      if (isSessionExpired()) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("zentap_admin_supreme");
          localStorage.removeItem("zentap_admin_last_active");
          localStorage.setItem("zentap_admin_expired", "true");
        }
        return false;
      }
      return true;
    }

    // Regular merchant user logged in - strip any stale admin supreme flag
    if (typeof window !== "undefined") {
      localStorage.removeItem("zentap_admin_supreme");
    }
    return false;
  }

  // Check standalone admin supreme session key with inactivity timeout enforcement
  if (typeof window !== "undefined") {
    if (localStorage.getItem("zentap_admin_supreme") === "true") {
      if (isSessionExpired()) {
        localStorage.removeItem("zentap_admin_supreme");
        localStorage.removeItem("zentap_admin_last_active");
        localStorage.setItem("zentap_admin_expired", "true");
        return false;
      }
      return true;
    }
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

    // 3. User activity tracker for admin auto-signout
    const updateActivity = () => {
      if (typeof window !== "undefined") {
        const isSupreme = localStorage.getItem("zentap_admin_supreme") === "true";
        if (isSupreme || user) {
          localStorage.setItem("zentap_admin_last_active", Date.now().toString());
        }
      }
    };
    window.addEventListener("pointerdown", updateActivity, { passive: true });
    window.addEventListener("keydown", updateActivity, { passive: true });
    window.addEventListener("touchstart", updateActivity, { passive: true });

    // Periodic check every 15s for session timeout
    const checkInterval = setInterval(() => {
      if (typeof window !== "undefined") {
        const isSupreme = localStorage.getItem("zentap_admin_supreme") === "true";
        const hasAdminAuth = isSupreme || (user && checkIsAdmin(user));
        if (hasAdminAuth) {
          const timeoutMinutes = parseInt(localStorage.getItem("zentap_admin_session_timeout") || "30", 10);
          if (timeoutMinutes > 0) {
            const lastActive = parseInt(localStorage.getItem("zentap_admin_last_active") || "0", 10);
            if (lastActive > 0 && Date.now() - lastActive > timeoutMinutes * 60 * 1000) {
              localStorage.removeItem("zentap_admin_supreme");
              localStorage.removeItem("zentap_admin_last_active");
              localStorage.setItem("zentap_admin_expired", "true");
              supabase.auth.signOut().finally(() => {
                setUser(null);
                setSession(null);
                window.location.href = "/admin/login?reason=timeout";
              });
            }
          }
        }
      }
    }, 15000);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("pointerdown", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("touchstart", updateActivity);
      clearInterval(checkInterval);
    };
  }, []);

  // Email & Password Sign In
  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && typeof window !== "undefined") {
      localStorage.setItem("zentap_admin_last_active", Date.now().toString());
      localStorage.removeItem("zentap_admin_expired");
    }
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
      localStorage.removeItem("zentap_admin_last_active");
      localStorage.removeItem("zentap_admin_authenticated");
      sessionStorage.clear();
      document.cookie = "zentap_admin=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "admin_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
