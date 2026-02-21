/**
 * AuthContext – SQLite auth (Supabase əvəzinə).
 */
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authService from "@/services/auth.service";
import { getProfileById } from "@/services/data.service";
import type { Profile } from "@/types/models";
import type { RoleSlug } from "@/types/database.types";

const GUEST_STORAGE_KEY = "ses_guest_mode";

type UserLike = { id: string; email?: string };

interface AuthState {
  user: UserLike | null;
  session: { user: UserLike } | null;
  profile: Profile | null;
  roleSlug: RoleSlug | null;
  loading: boolean;
  isGuest: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  roleSlug: null,
  loading: true,
  isGuest: false,
};

const AuthContext = createContext<
  AuthState & {
    signOut: () => Promise<void>;
    enterAsGuest: () => Promise<void>;
    refreshSession: () => Promise<void>;
  }
>({
  ...initialState,
  signOut: async () => {},
  enterAsGuest: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  const refreshSession = async () => {
    const guest = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
    if (guest === "1") {
      setState({
        user: null,
        session: null,
        profile: { id: "guest", role_id: "guest", email: null, full_name: "Guest", avatar_url: null, phone: null, created_at: "", updated_at: "" },
        roleSlug: "startup",
        loading: false,
        isGuest: true,
      });
      return;
    }
    const sess = await authService.getSession();
    if (!sess) {
      setState({ ...initialState, loading: false });
      return;
    }
    const profile = await getProfileById(sess.user.id);
    setState({
      user: sess.user,
      session: { user: sess.user },
      profile,
      roleSlug: sess.roleSlug,
      loading: false,
      isGuest: false,
    });
  };

  const enterAsGuest = async () => {
    await AsyncStorage.setItem(GUEST_STORAGE_KEY, "1");
    setState({
      user: null,
      session: null,
      profile: { id: "guest", role_id: "guest", email: null, full_name: "Guest", avatar_url: null, phone: null, created_at: "", updated_at: "" },
      roleSlug: "startup",
      loading: false,
      isGuest: true,
    });
  };

  const exitGuest = async () => {
    await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
    setState({ ...initialState, loading: false });
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const signOut = async () => {
    if (state.isGuest) {
      await exitGuest();
      return;
    }
    await authService.signOut();
    setState({ ...initialState, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, signOut, enterAsGuest, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
