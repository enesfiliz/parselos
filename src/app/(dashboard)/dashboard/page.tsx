import { currentUser } from "@clerk/nextjs/server";

import { CommandCenterView } from "@/components/features/dashboard/CommandCenterView";
import { DashboardDbError } from "@/components/features/dashboard/DashboardDbError";
import { getCommandCenterData } from "@/lib/dashboard-command-center";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const DB_ERROR_CODES = new Set([
  "P1000",
  "P1001",
  "P1002",
  "P1003",
  "P1008",
  "P1010",
  "P1011",
  "P1017",
]);

function isDatabaseConnectionError(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    DB_ERROR_CODES.has(error.code)
  ) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("authentication failed") ||
      message.includes("password authentication failed") ||
      message.includes("econnrefused") ||
      message.includes("ecircuitbreaker") ||
      message.includes("self-signed certificate") ||
      message.includes("can't reach database") ||
      message.includes("database_url is not set")
    );
  }

  return false;
}

export default async function DashboardPage() {
  const user = await currentUser();
  let data;

  try {
    data = await getCommandCenterData();
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return <DashboardDbError />;
    }

    throw error;
  }

  return (
    <CommandCenterView
      user={{
        firstName: user?.firstName ?? null,
        fullName: user?.fullName ?? null,
      }}
      metrics={data.metrics}
      pipelineFunnel={data.pipelineFunnel}
      activityFeed={data.activityFeed}
      searchIndex={data.searchIndex}
      imarWatchItems={data.imarWatchItems}
      fsboCouponListings={data.fsboCouponListings}
    />
  );
}
