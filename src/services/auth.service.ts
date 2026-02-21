/**
 * Auth service – SQLite (Supabase əvəzinə local).
 * Admin: admin@ses.az / admin123
 * Super Admin: superadmin@ses.az / super123
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDb, genId } from "@/lib/db";
import { getRoleSlugByRoleId } from "./data.service";
import type { RoleSlug } from "@/types/database.types";

const SESSION_KEY = "ses_current_user_id";

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  roleSlug: RoleSlug;
}

export interface SignInInput {
  email: string;
  password: string;
}

/** Demo: sadə parol saxlaması (real tətbiqdə bcrypt istifadə edin) */
function hashPassword(p: string): string {
  return p;
}

function toUserFriendlyError(error: unknown): Error {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();
  if (lower.includes("invalid login") || lower.includes("yanlış") || lower.includes("wrong")) {
    return new Error("Email və ya parol yanlışdır. Zəhmət olmasa yoxlayın.");
  }
  return error instanceof Error ? error : new Error(msg);
}

export async function signIn({ email, password }: SignInInput) {
  try {
    const db = await getDb();
    const rows = await db.getAllAsync<{ id: string; role_id: string; password_hash: string }>(
      "SELECT id, role_id, password_hash FROM profiles WHERE email = ?",
      email.trim()
    );
    const profile = rows[0];
    if (!profile) throw new Error("Email və ya parol yanlışdır.");
    const storedHash = profile.password_hash ?? "";
    const inputHash = hashPassword(password.trim());
    if (storedHash !== inputHash) throw new Error("Email və ya parol yanlışdır.");
    await AsyncStorage.setItem(SESSION_KEY, profile.id);
    const roleSlug = await getRoleSlugByRoleId(profile.role_id);
    return {
      user: { id: profile.id, email },
      session: { user: { id: profile.id } },
      profile: { id: profile.id, role_id: profile.role_id },
      roleSlug,
    };
  } catch (e) {
    throw toUserFriendlyError(e);
  }
}

export async function signUp({ email, password, fullName, roleSlug }: SignUpInput) {
  try {
    const db = await getDb();
    const roleRows = await db.getAllAsync<{ id: string }>("SELECT id FROM roles WHERE slug = ?", roleSlug);
    const roleId = roleRows[0]?.id;
    if (!roleId) throw new Error("Rol tapılmadı.");
    const id = genId();
    const hash = hashPassword(password.trim());
    await db.runAsync(
      "INSERT INTO profiles (id, role_id, email, password_hash, full_name) VALUES (?, ?, ?, ?, ?)",
      id, roleId, email.trim(), hash, fullName.trim()
    );
    await AsyncStorage.setItem(SESSION_KEY, id);
    return { user: { id, email }, error: null };
  } catch (e) {
    throw toUserFriendlyError(e);
  }
}

export async function signOut(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function getSession(): Promise<{
  user: { id: string; email?: string } | null;
  profile: { id: string; role_id: string } | null;
  roleSlug: RoleSlug | null;
} | null> {
  const userId = await AsyncStorage.getItem(SESSION_KEY);
  if (!userId) return null;
  const db = await getDb();
  const rows = await db.getAllAsync<{ id: string; role_id: string; email: string | null }>(
    "SELECT id, role_id, email FROM profiles WHERE id = ?", userId
  );
  const p = rows[0];
  if (!p) {
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  }
  const roleSlug = await getRoleSlugByRoleId(p.role_id);
  return {
    user: { id: p.id, email: p.email ?? undefined },
    profile: { id: p.id, role_id: p.role_id },
    roleSlug,
  };
}

export { getRoleSlugByRoleId } from "./data.service";
