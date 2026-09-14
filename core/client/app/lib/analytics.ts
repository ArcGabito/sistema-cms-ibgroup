import { getAuthToken, BACKEND_URL } from "@/app/lib/auth";

export interface AnalyticsSummary {
  totalUsers: number;
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  usersByRole: { role: string; count: number }[];
  postsByMonth: { month: string; count: number }[];
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary | null> {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/analytics/summary`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AnalyticsSummary;
  } catch {
    return null;
  }
}
