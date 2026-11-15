import type { profiles } from "@/db/schema";
import { ageOf } from "./validation";
export function publicProfile(p: typeof profiles.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    age: ageOf(p.birthDate),
    gender: p.gender,
    city: p.city,
    bio: p.bio,
    occupation: p.occupation,
    intention: p.intention,
    interests: p.interests,
    photo: `/api/community/photos/${p.id}?v=${p.updatedAt.getTime()}`,
  };
}
export function hasMembership(
  profile: { membershipUntil: Date | null },
  now = Date.now(),
) {
  return !!profile.membershipUntil && profile.membershipUntil.getTime() > now;
}
