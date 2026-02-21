import type { RoleSlug } from "./database.types";

export interface Profile {
  id: string;
  role_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  slug: RoleSlug;
  name: string;
}

export interface ProfileWithRole extends Profile {
  role?: Role | null;
}

export interface Hackathon {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  icon_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  hackathon_id: string;
  name: string;
  team_role: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItHub {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface Startup {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  stage: string | null;
  created_at: string;
  updated_at: string;
}

export interface StartupEvaluation {
  id: string;
  startup_id: string;
  hackathon_id: string | null;
  evaluator_id: string;
  evaluator_type: "jury" | "expert";
  innovation_score: number | null;
  market_potential_score: number | null;
  technical_score: number | null;
  presentation_score: number | null;
  business_model_score: number | null;
  total_score: number | null;
  comments: string | null;
  status: "draft" | "submitted" | "final";
  created_at: string;
  updated_at: string;
}

export interface JuryMember {
  id: string;
  hackathon_id: string;
  user_id: string;
  role: "jury" | "head_jury" | "expert";
  created_at: string;
}

export interface HackathonAward {
  id: string;
  hackathon_id: string;
  startup_id: string;
  team_id: string | null;
  award_type: string;
  award_name: string;
  prize_amount: number | null;
  prize_description: string | null;
  awarded_at: string | null;
  created_at: string;
  updated_at: string;
}
