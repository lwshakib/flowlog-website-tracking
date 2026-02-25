/**
 * @file app/(main)/dashboard/page.tsx
 * @description The main overview dashboard for authenticated users.
 * Displays aggregated statistics across all tracked websites, including visitor trends and live visitor counts.
 */

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Users, MousePointer2, Clock, TrendingUp } from "lucide-react";
import { CreateWebsiteDialog } from "@/components/create-website-dialog";
import { WebsiteCardActions } from "@/components/website-card-actions";
import Link from "next/link";
import { VisitsTrendChart } from "@/components/analytics-charts";
import { subDays, format, subMinutes } from "date-fns";

/**
 * DashboardPage Component
 * @description Server-side component that calculates and renders high-level analytics metrics.
 * @returns {JSX.Element} The rendered dashboard page.
 */
export default async function DashboardPage() {
  // Ensure the user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Fetch all websites owned by the user, including visit counts
  const websites = await prisma.website.findMany({
    where: { ownerId: session.user.id },
    include: {
      _count: {
        select: { visits: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate total visits across all websites
  const totalVisitsCount = websites.reduce((acc, site) => acc + site._count.visits, 0);

  // Live Visitors: active in last 5 minutes (have not exited the session)
  const fiveMinutesAgo = subMinutes(new Date(), 5);
  const liveVisitorsCount = await prisma.visit.count({
    where: {
      website: { ownerId: session.user.id },
      exitTime: null,
      entryTime: { gte: fiveMinutesAgo },
    },
  });

  // Average Session Duration Calculation
  // We only count visits that have an 'exitTime' recorded.
  const finishedVisits = await prisma.visit.findMany({
    where: {
      website: { ownerId: session.user.id },
      exitTime: { not: null },
    },
    select: {
      entryTime: true,
      exitTime: true,
    },
  });

  const totalDurationSeconds = finishedVisits.reduce((acc, visit) => {
    return acc + (visit.exitTime!.getTime() - visit.entryTime.getTime()) / 1000;
  }, 0);

  const avgDurationSeconds =
    finishedVisits.length > 0 ? totalDurationSeconds / finishedVisits.length : 0;

  const avgMinutes = Math.floor(avgDurationSeconds / 60);
  const avgSeconds = Math.floor(avgDurationSeconds % 60);
  const avgSessionFormatted = finishedVisits.length > 0 ? `${avgMinutes}m ${avgSeconds}s` : "0s";

  // Fetch visits for the last 7 days to display in the trend chart
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentVisits = await prisma.visit.findMany({
    where: {
      website: { ownerId: session.user.id },
      entryTime: { gte: sevenDaysAgo },
    },
    select: { entryTime: true },
  });

  // Prepare data for the trend chart by grouping visits by date
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return format(date, "yyyy-MM-dd");
  }).reverse();

  const trendData = last7Days.map((date) => ({
    date,
    visits: recentVisits.filter((v) => format(v.entryTime, "yyyy-MM-dd") === date).length,
  }));

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your tracked websites and visitor metrics.
          </p>
        </div>
        <CreateWebsiteDialog />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Websites Card */}
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Websites
            </CardTitle>
            <Globe className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{websites.length}</div>
          </CardContent>
        </Card>

        {/* Total Pageviews Card */}
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pageviews
            </CardTitle>
            <MousePointer2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisitsCount.toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* Average Session Duration Card */}
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Session
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSessionFormatted}</div>
          </CardContent>
        </Card>

        {/* Live Visitors Card */}
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Live Visitors
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveVisitorsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Visitor Trends Chart */}
      <Card className="border-primary/10 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Visitor Trends
            </CardTitle>
            <CardDescription>
              Total visits across all your websites over the last 7 days.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <VisitsTrendChart data={trendData} />
        </CardContent>
      </Card>

      {/* Your Websites Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Websites</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.length === 0 ? (
            /* Empty State: No websites yet */
            <Card className="col-span-full border-dashed p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-primary/5 p-6 rounded-full">
                <Globe className="h-12 w-12 text-primary opacity-50" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-medium">No websites tracked yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  Add your first website to start collecting insights and visitor data in real-time.
                </p>
              </div>
              <CreateWebsiteDialog />
            </Card>
          ) : (
            /* List of Website Cards */
            websites.map((site) => (
              <Link key={site.id} href={`/websites/${site.id}`}>
                <Card className="group hover:border-primary/30 transition-all duration-300 h-full cursor-pointer hover:shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {site.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 font-mono text-xs">
                          <Globe className="h-3 w-3" /> {site.domain}
                        </CardDescription>
                      </div>
                      <WebsiteCardActions website={site} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          Visits
                        </p>
                        <p className="text-2xl font-bold">{site._count.visits}</p>
                      </div>
                      {/* Mini Sparkline Visualization (Static Placeholder) */}
                      <div className="h-10 w-24 bg-primary/5 rounded-md flex items-end justify-between p-1 gap-0.5">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                          <div
                            key={i}
                            className="bg-primary/20 w-full rounded-t-sm"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
