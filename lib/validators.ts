import { z } from "zod";
import { CITIES, REPORT_REASONS } from "@/lib/constants";

export const otpSchema = z.object({
  email: z.string().email("Enter a valid email")
});

export const profileSchema = z.object({
  username: z.string().min(3).max(20),
  full_name: z.string().max(60).optional(),
  age: z.coerce.number().min(18).max(80),
  city: z.enum(CITIES),
  bio: z.string().max(300).optional(),
  is_private: z.boolean().optional()
});

export const reportSchema = z.object({
  reported_user_id: z.string().uuid(),
  reason: z.enum(REPORT_REASONS),
  notes: z.string().max(500).optional()
});
