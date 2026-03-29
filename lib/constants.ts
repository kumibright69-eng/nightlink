export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "NightLink";

export const CITIES = ["Lagos", "Abuja", "Accra", "Kumasi", "Abidjan"] as const;
export type City = (typeof CITIES)[number];

export const COUNTRY_BY_CITY: Record<City, string> = {
  Lagos: "Nigeria",
  Abuja: "Nigeria",
  Accra: "Ghana",
  Kumasi: "Ghana",
  Abidjan: "Côte d’Ivoire"
};

export const REPORT_REASONS = [
  "Spam or fake profile",
  "Harassment",
  "Underage concern",
  "Scam attempt",
  "Explicit or abusive content",
  "Other"
] as const;

export const ADMIN_ROLES = ["admin", "moderator"] as const;
