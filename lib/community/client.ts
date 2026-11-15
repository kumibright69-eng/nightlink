import { getUser, refreshSession } from "@netlify/identity";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  await getUser(); // Hydrate the browser session before checking expiry.
  await refreshSession();
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  const response = await fetch(`/api/community/${path}`, {
    ...options,
    headers,
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      data.error || "Something went wrong. Please try again.",
      response.status,
    );
  return data as T;
}
export type PublicProfile = {
  id: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  bio: string;
  occupation: string;
  intention: string;
  interests: string[];
  photo: string;
};
export type MemberProfile = {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  lookingFor: string[];
  city: string;
  bio: string;
  occupation: string;
  intention: string;
  interests: string[];
  photoKey: string;
  photo: string;
  paused: boolean;
  suspended: boolean;
  membershipUntil: string | null;
};
export type Me = {
  user: { id: string; email: string; admin: boolean };
  profile: MemberProfile | null;
  membership: boolean;
};
export type Match = {
  id: string;
  createdAt: string;
  profile: PublicProfile;
  lastMessage: { body: string; createdAt: string } | null;
};
export type Message = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  clientId: string;
};
export function displayDate(date: string) {
  return new Date(date).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
