import { useAuthContext } from "@/contexts/AuthContext";

export function useAuth() {
  const { user, session, profile, loading, signOut } = useAuthContext();
  return {
    user,
    session,
    profile,
    isAuthenticated: !!user,
    loading,
    signOut,
  };
}
