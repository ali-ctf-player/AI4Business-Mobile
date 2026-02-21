/**
 * Supabase generated types (run: npx supabase gen types typescript --local > src/types/database.types.ts)
 * Minimal placeholder matching 001_initial_schema.sql
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type RoleSlug = "startup" | "investor" | "it_company" | "organizer" | "admin" | "super_admin";

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: { id: string; slug: RoleSlug; name: string; created_at: string };
        Insert: { id?: string; slug: RoleSlug; name: string; created_at?: string };
        Update: { id?: string; slug?: RoleSlug; name?: string; created_at?: string };
      };
      profiles: {
        Row: {
          id: string;
          role_id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role_id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      startups: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          website: string | null;
          logo_url: string | null;
          stage: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["startups"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["startups"]["Insert"]>;
      };
      hackathons: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          start_date: string;
          end_date: string;
          location: string | null;
          latitude: number | null;
          longitude: number | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: unknown;
        Update: unknown;
      };
      teams: {
        Row: { id: string; hackathon_id: string; name: string; description: string | null; created_at: string; updated_at: string };
        Insert: unknown;
        Update: unknown;
      };
      team_members: {
        Row: { id: string; team_id: string; user_id: string; role: string; joined_at: string };
        Insert: unknown;
        Update: unknown;
      };
      it_hubs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          address: string | null;
          latitude: number;
          longitude: number;
          created_at: string;
          updated_at: string;
        };
        Insert: unknown;
        Update: unknown;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_my_role_slug: { Args: Record<string, never>; Returns: string };
    };
    Enums: Record<string, never>;
  };
}
