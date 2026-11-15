export const APP_NAME = "Akoma";
export const CITIES = [
  "Accra",
  "Kumasi",
  "Tema",
  "Takoradi",
  "Cape Coast",
  "Tamale",
  "Sunyani",
  "Koforidua",
  "Ho",
  "Wa",
  "Bolgatanga",
  "Techiman",
] as const;
export type City = (typeof CITIES)[number];
export const GENDERS = ["Woman", "Man", "Non-binary"] as const;
export const INTENTIONS = [
  "A long-term relationship",
  "Marriage",
  "Dating and seeing where it goes",
] as const;
export const INTERESTS = [
  "Highlife & Afrobeats",
  "Food adventures",
  "Travel",
  "Beach days",
  "Faith",
  "Fitness",
  "Movies",
  "Art & culture",
  "Reading",
  "Dancing",
  "Football",
  "Entrepreneurship",
  "Cooking",
  "Nature",
  "Live music",
  "Gaming",
] as const;
export const REPORT_REASONS = [
  "Fake profile or scam",
  "Harassment",
  "Underage concern",
  "Inappropriate content",
  "Other safety concern",
] as const;
export const MEMBERSHIP = {
  price: 50,
  months: 1,
  days: 30,
  phone: "0546501820",
  label: "Akoma Plus",
} as const;
