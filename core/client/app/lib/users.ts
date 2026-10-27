import { getAuthToken, BACKEND_URL, type CurrentUser } from "@/app/lib/auth";

// Same shape the backend returns for the signed-in user.
export type AdminUser = CurrentUser;

export async function getUsers(): Promise<AdminUser[]> {
  const token = await getAuthToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as AdminUser[];
  } catch {
    return [];
  }
}
