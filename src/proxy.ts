import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getSafeInternalRedirect } from "@/lib/auth/redirect-url";
import { isProFeaturePlan } from "@/lib/billing/plans";
import type { TenantPlanType } from "@prisma/client";

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

export default clerkMiddleware(async (auth, request) => {
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

export const config = {
  matcher: [
    // Clerk auth() — bu rotalar matcher'da olmazsa login/sign-up patlar
    "/login(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/admin(.*)",
    "/arsiv(.*)",
    "/account(.*)",
    "/invite(.*)",
    "/billing(.*)",
    "/calculators(.*)",
    "/calendar(.*)",
    "/customers(.*)",
    "/dashboard(.*)",
    "/deals(.*)",
    "/ekspertiz(.*)",
    "/finans(.*)",
    "/fsbo-radar(.*)",
    "/hesaplayicilar(.*)",
    "/ilan-asistani(.*)",
    "/imar-radari(.*)",
    "/musteriler(.*)",
    "/portfolios(.*)",
    "/properties(.*)",
    "/radar(.*)",
    "/sesli-crm(.*)",
    "/tapu-ai(.*)",
    "/api/((?!health|webhook|webhooks|billing/callback|bot-sync|cron/fsbo-sync).*)",
    "/trpc(.*)",
  ],
};
