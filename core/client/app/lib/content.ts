import { connection } from "next/server";
import { getAuthToken, BACKEND_URL } from "@/app/lib/auth";

interface ContentBase {
  id: number;
  sortOrder: number;
  isVisible: boolean;
  updatedAt: string;
}

export interface ServiceItem extends ContentBase {
  title: string;
  description: string;
  features: string[];
  ctaLabel: string;
  imageUrl: string;
  icon: string;
}

export interface FaqItem extends ContentBase {
  question: string;
  answer: string;
}

export interface CountryItem extends ContentBase {
  name: string;
  code: string;
  description: string;
}

export type StatKind = "months" | "percent" | "split";

export interface StatPoint {
  year: string;
  value: number;
  secondValue: number | null;
}

export interface StatChart extends ContentBase {
  title: string;
  description: string;
  kind: StatKind;
  seriesLabel: string | null;
  secondSeriesLabel: string | null;
  points: StatPoint[];
}

export interface ContentTypes {
  services: ServiceItem;
  faqs: FaqItem;
  countries: CountryItem;
  stats: StatChart;
}

export type ContentType = keyof ContentTypes;

export const CONTENT_TYPES = ["services", "faqs", "countries", "stats"] as const satisfies readonly ContentType[];

export function isContentType(value: string): value is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(value);
}

// Mutations through the dashboard revalidate this tag, so edits show up on
// the site's next visit instead of waiting for the 60s window.
export const contentTag = (type: ContentType) => `content:${type}`;

// Public: only visible items, in display order. connection() keeps calling
// pages out of the build-time prerender (no backend while the image builds).
export async function getPublicContent<T extends ContentType>(type: T): Promise<ContentTypes[T][]> {
  await connection();

  try {
    const response = await fetch(`${BACKEND_URL}/api/content/${type}`, {
      next: { revalidate: 60, tags: [contentTag(type)] },
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as ContentTypes[T][];
  } catch {
    return [];
  }
}

// Dashboard: every item, hidden ones included.
export async function getAllContent<T extends ContentType>(type: T): Promise<ContentTypes[T][]> {
  const token = await getAuthToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/content/${type}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as ContentTypes[T][];
  } catch {
    return [];
  }
}
