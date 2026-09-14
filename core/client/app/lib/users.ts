import { getAuthToken, BACKEND_URL } from "@/app/lib/auth";

export interface AdminUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

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
