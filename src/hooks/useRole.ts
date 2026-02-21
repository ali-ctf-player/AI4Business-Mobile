import { useAuthContext } from "@/contexts/AuthContext";

export function useRole() {
  const { roleSlug } = useAuthContext();
  return { roleSlug, role: roleSlug };
}
