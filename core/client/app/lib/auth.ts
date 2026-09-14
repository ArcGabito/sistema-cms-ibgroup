import { cache } from "react";
import { cookies } from "next/headers";

export const AUTH_COOKIE = "ib_auth_token";

export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

export interface CurrentUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value ?? null;
}

// Wrapped in React's cache() so the layout, page, and any nested module can
// all call this within the same request without triggering repeat network
// calls to the backend.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as CurrentUser;
  } catch {
    return null;
  }
});
