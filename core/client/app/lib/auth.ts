import { cache } from "react";
import { cookies } from "next/headers";

export const AUTH_COOKIE = "ib_auth_token";

export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

export interface CurrentUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  lockoutEnd: string | null;
}

export interface AuthTokenResponse {
  token: string;
  expiresAt: string;
  user: CurrentUser;
}

// Used by login and by password changes (which rotate the token).
export async function setAuthCookie({ token, expiresAt }: AuthTokenResponse) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    // Only mark the cookie secure once this app is actually served over HTTPS
    // (e.g. behind a TLS-terminating reverse proxy) — set COOKIE_SECURE=true then.
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value ?? null;
}

export interface Session {
  user: CurrentUser | null;
  // The backend is asleep or starting (it scales to zero when idle): the
  // session may well be valid, so callers shouldn't send the user to log in.
  backendUnavailable: boolean;
}

// Wrapped in React's cache() so the layout, page, and any nested module can
// all call this within the same request without triggering repeat network
// calls to the backend.
export const getSession = cache(async (): Promise<Session> => {
  const token = await getAuthToken();

  if (!token) {
    return { user: null, backendUnavailable: false };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return { user: null, backendUnavailable: response.status >= 500 };
    }

    return { user: (await response.json()) as CurrentUser, backendUnavailable: false };
  } catch {
    return { user: null, backendUnavailable: true };
  }
});

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return (await getSession()).user;
}
