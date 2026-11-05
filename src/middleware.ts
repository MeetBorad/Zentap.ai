import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { checkRateLimit, RATE_LIMIT_TIERS, RateLimitConfig } from "@/lib/rateLimit";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Apply Rate Leveling & Limiting to all API routes
  if (pathname.startsWith("/api/")) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const cfIp = request.headers.get("cf-connecting-ip");
    const ip = (forwardedFor ? forwardedFor.split(",")[0].trim() : cfIp) || "127.0.0.1";

    // Determine tier based on route sensitivity
    let tier: RateLimitConfig = RATE_LIMIT_TIERS.STANDARD;
    if (pathname.startsWith("/api/ai/") || pathname.startsWith("/api/checkout/create-order")) {
      tier = RATE_LIMIT_TIERS.SENSITIVE;
    } else if (pathname.startsWith("/api/hub/click") || pathname.startsWith("/api/review/event")) {
      tier = RATE_LIMIT_TIERS.TELEMETRY;
    }

    const { success, limit, remaining, resetAt } = checkRateLimit(`${ip}:${pathname.split("/")[2] || "api"}`, tier);

    if (!success) {
      const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Too many requests. Please slow down and try again.",
          retryAfterSeconds: retryAfter,
        },
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetAt.toString(),
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    // Continue session verification and append rate headers
    const response = await updateSession(request);
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", resetAt.toString());
    return response;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
