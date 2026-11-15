import { NextRequest } from "next/server";
import { getIdentityConfig } from "@netlify/identity";
import { and, eq, or, sql } from "drizzle-orm";
import { database } from "@/db";
import { blocks, profiles, rateLimits } from "@/db/schema";
export { publicProfile, hasMembership } from "./domain";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function authenticate(request: NextRequest) {
  const token = request.cookies.get("nf_jwt")?.value;
  if (!token) throw new HttpError(401, "Please log in to continue.");
  // Always validate the token with Identity; never trust decoded browser claims.
  const identityUrl =
    getIdentityConfig()?.url ??
    `${(process.env.URL || "https://nightlin.netlify.app").replace(/\/$/, "")}/.netlify/identity`;
  let response: Response;
  try {
    response = await fetch(`${identityUrl.replace(/\/$/, "")}/user`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new HttpError(
      503,
      "Account service is temporarily unavailable. Please try again.",
    );
  }
  if (response.status === 401 || response.status === 403)
    throw new HttpError(401, "Your session has expired. Please log in again.");
  if (!response.ok)
    throw new HttpError(
      503,
      "Account service is temporarily unavailable. Please try again.",
    );
  const raw = await response.json();
  if (typeof raw.id !== "string")
    throw new HttpError(401, "Please log in again.");
  return {
    id: raw.id as string,
    email: raw.email as string,
    admin:
      Array.isArray(raw.app_metadata?.roles) &&
      raw.app_metadata.roles.includes("admin"),
  };
}
export function protectMutation(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigins = new Set([new URL(request.url).origin]);
  // Netlify's framework proxy may use an internal request URL. Only add
  // deployment URLs supplied by the platform, never caller-supplied hosts.
  for (const siteUrl of [
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.DEPLOY_URL,
  ]) {
    if (siteUrl) {
      try {
        allowedOrigins.add(new URL(siteUrl).origin);
      } catch {
        /* Ignore malformed platform configuration. */
      }
    }
  }
  if (process.env.NODE_ENV === "development")
    allowedOrigins.add("http://localhost:8889");
  if (!origin || !allowedOrigins.has(origin))
    throw new HttpError(
      403,
      "This request could not be verified. Reload the page and try again.",
    );
}
export async function requireProfile(id: string, allowSuspended = false) {
  const [profile] = await database()
    .select()
    .from(profiles)
    .where(eq(profiles.id, id));
  if (!profile) throw new HttpError(428, "Complete your profile to continue.");
  if (profile.suspended && !allowSuspended)
    throw new HttpError(
      403,
      "Your profile is suspended. Request a review through your account settings.",
    );
  return profile;
}
export async function isBlocked(a: string, b: string) {
  const [block] = await database()
    .select({ id: blocks.fromId })
    .from(blocks)
    .where(
      or(
        and(eq(blocks.fromId, a), eq(blocks.toId, b)),
        and(eq(blocks.fromId, b), eq(blocks.toId, a)),
      ),
    )
    .limit(1);
  return !!block;
}
export async function rateLimit(
  userId: string,
  action: string,
  max: number,
  seconds: number,
) {
  const resetAt = new Date(Date.now() + seconds * 1000);
  const [row] = await database()
    .insert(rateLimits)
    .values({ key: `${userId}:${action}`, resetAt })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`CASE WHEN ${rateLimits.resetAt} < now() THEN 1 ELSE ${rateLimits.count} + 1 END`,
        resetAt: sql`CASE WHEN ${rateLimits.resetAt} < now() THEN ${resetAt.toISOString()}::timestamptz ELSE ${rateLimits.resetAt} END`,
      },
    })
    .returning();
  if (row.count > max)
    throw new HttpError(
      429,
      "You’re moving a little quickly. Please wait a moment and try again.",
    );
}
