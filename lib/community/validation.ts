import { z } from "zod";
import { CITIES, GENDERS, INTENTIONS, INTERESTS } from "@/lib/constants";
export function ageOf(birthDate: string, today = new Date()) {
  const [year, month, day] = birthDate.split("-").map(Number);
  return (
    today.getUTCFullYear() -
    year -
    (today.getUTCMonth() + 1 < month ||
    (today.getUTCMonth() + 1 === month && today.getUTCDate() < day)
      ? 1
      : 0)
  );
}
export const profileInput = z.object({
  name: z.string().trim().min(2).max(40),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      (s) =>
        !isNaN(Date.parse(s)) &&
        new Date(s).toISOString().slice(0, 10) === s &&
        ageOf(s) >= 18 &&
        ageOf(s) <= 100,
      "You must be between 18 and 100 to join Akoma.",
    ),
  gender: z.enum(GENDERS),
  lookingFor: z.array(z.enum(GENDERS)).min(1).max(3),
  city: z.enum(CITIES),
  bio: z
    .string()
    .trim()
    .min(30, "Tell us a little more about yourself (at least 30 characters).")
    .max(600),
  occupation: z.string().trim().max(70),
  intention: z.enum(INTENTIONS),
  interests: z
    .array(z.enum(INTERESTS))
    .min(2, "Choose at least two interests.")
    .max(8),
  photoKey: z.string().min(1, "Add a profile photo.").max(200),
  paused: z.boolean().default(false),
  consent: z.literal(true, {
    error: "Please agree to the terms and confirm you are 18 or older.",
  }),
});
export const paymentInput = z.object({
  payerName: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .regex(
      /^(0[235]\d{8}|\+233[235]\d{8})$/,
      "Enter a valid Ghanaian mobile number.",
    ),
  transactionId: z
    .string()
    .trim()
    .min(6)
    .max(60)
    .regex(/^[A-Za-z0-9-]+$/, "Use the transaction ID from your MoMo receipt."),
});
