import type { City } from "@/lib/constants";

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  age: number | null;
  city: City | null;
  country: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_private: boolean;
  is_active: boolean;
  role: "user" | "moderator" | "admin";
  created_at: string;
}

export interface ReportRow {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  notes: string | null;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  moderator_id: string | null;
  moderator_notes: string | null;
  created_at: string;
}
