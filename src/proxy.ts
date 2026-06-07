import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isProFeaturePlan } from "@/lib/billing/plans";
import type { TenantPlanType } from "@prisma/client";

const isPublicRoute = createRouteMatcher([
  "/",
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

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request) && !isAuthPage(request)) {
    return;
  }

  const { userId } = await auth();

  if (userId && isAuthPage(request)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
    "/admin(.*)",
    "/arsiv(.*)",
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
