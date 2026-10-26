import type { NextRequest } from "next/server";

// Every backend call goes out from this server, so without this the backend
// would see one IP for all visitors and its per-client rate limits would
// throttle everyone together. Pass the visitor's address along instead.
export function forwardedForHeader(request: NextRequest): Record<string, string> {
  const forwardedFor =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");

  return forwardedFor ? { "X-Forwarded-For": forwardedFor } : {};
}
