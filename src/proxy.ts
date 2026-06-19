import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

import { getSafeInternalRedirect } from "@/lib/auth/redirect-url";
import { isProFeaturePlan } from "@/lib/billing/plans";
import type { TenantPlanType } from "@prisma/client";

// Clerk auth() depends on request headers propagated by this proxy.
// Keep every route that calls auth() directly or through a layout in config.matcher.
const isPublicRoute = createRouteMatcher([
  "/",
  "/gizlilik-politikasi",
  "/kullanim-kosullari",
  "/mesafeli-satis-sozlesmesi",
  "/teslimat-ve-iade",
  "/kvkk",
  "/login(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)",
  "/api/webhooks(.*)",
  "/api/billing/callback",
  "/api/bot-sync",
  "/api/cron/fsbo-sync",
  "/api/health",
]);

const isAuthPage = createRouteMatcher([
  "/login(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const isDashboardRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/deals(.*)",
  "/fsbo-radar(.*)",
  "/radar(.*)",
  "/imar-radari(.*)",
  "/finans(.*)",
  "/arsiv(.*)",
  "/musteriler(.*)",
  "/ekspertiz(.*)",
  "/ilan-asistani(.*)",
  "/tapu-ai(.*)",
  "/hesaplayicilar(.*)",
  "/calculators(.*)",
  "/sesli-crm(.*)",
  "/properties(.*)",
  "/portfolios(.*)",
  "/customers(.*)",
  "/calendar(.*)",
  "/billing(.*)",
  "/account(.*)",
  "/invite(.*)",
  "/admin(.*)",
  "/ofis-operasyonu(.*)",
]);

const isProFeatureRoute = createRouteMatcher([
  "/ilan-asistani(.*)",
]);

function redirectToSignIn(request: Request) {
  const signInUrl = new URL("/login", request.url);
  const pathname = new URL(request.url).pathname;

  if (pathname && pathname !== "/login" && pathname !== "/sign-in") {
    signInUrl.searchParams.set("redirect_url", pathname);
  }

  return NextResponse.redirect(signInUrl);
}

function redirectToBilling(request: Request, reason: string) {
  const billingUrl = new URL("/billing", request.url);
  billingUrl.searchParams.set("upgrade", "pro");
  billingUrl.searchParams.set("reason", reason);
  return NextResponse.redirect(billingUrl);
}

async function resolvePlanTypeForUser(userId: string): Promise<TenantPlanType> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const planType = user.publicMetadata?.planType;

    if (
      planType === "FREE" ||
      planType === "PRO" ||
      planType === "PREMIUM"
    ) {
      return planType;
    }
  } catch (error) {
    console.error("[proxy] plan lookup failed", error);
  }

  return "FREE";
}

function redirectFromAuthPage(request: Request) {
  const url = new URL(request.url);
  const redirectTarget = getSafeInternalRedirect(
    url.searchParams.get("redirect_url"),
  );

  return NextResponse.redirect(new URL(redirectTarget, request.url));
}

const clerkProxy = clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  if (userId && isAuthPage(request)) {
    return redirectFromAuthPage(request);
  }

  // Public routes (including /login, /sign-in, /sign-up) must not hit auth.protect().
  if (isPublicRoute(request)) {
    return;
  }

  if (!userId) {
    const pathname = new URL(request.url).pathname;

    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    }

    if (isDashboardRoute(request)) {
      return redirectToSignIn(request);
    }

    await auth.protect();
    return;
  }

  if (isProFeatureRoute(request)) {
    const planType = await resolvePlanTypeForUser(userId);
    if (!isProFeaturePlan(planType)) {
      return redirectToBilling(request, "ilan-analizi");
    }
  }
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  return clerkProxy(request, event);
}

export const config = {
  matcher: [
    // Clerk auth() - bu rotalar matcher'da olmazsa login/sign-up patlar
    "/login/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/admin/:path*",
    "/arsiv/:path*",
    "/account/:path*",
    "/invite/:path*",
    "/billing/:path*",
    "/calculators/:path*",
    "/calendar/:path*",
    "/customers/:path*",
    "/dashboard/:path*",
    "/deals/:path*",
    "/ekspertiz/:path*",
    "/finans/:path*",
    "/fsbo-radar/:path*",
    "/hesaplayicilar/:path*",
    "/ilan-asistani/:path*",
    "/imar-radari/:path*",
    "/musteriler/:path*",
    "/ofis-operasyonu/:path*",
    "/portfolios/:path*",
    "/properties/:path*",
    "/radar/:path*",
    "/sesli-crm/:path*",
    "/tapu-ai/:path*",
    "/api/((?!health|webhook|webhooks|billing/callback|bot-sync|cron/fsbo-sync).*)",
    "/trpc/:path*",
  ],
};
