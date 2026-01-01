import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Users, MousePointer2, Clock, Calendar, BarChart3, MapPin, Monitor, Globe2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditWebsiteDialog } from "@/components/edit-website-dialog";
import { DeleteWebsiteDialog } from "@/components/delete-website-dialog";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { BrowserDistributionChart, TopPagesBarChart, VisitsTrendChart } from "@/components/analytics-charts";
import { ExportButton } from "@/components/export-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsList } from "@/components/stats-list";
import { format, subDays, subMinutes } from "date-fns";

export default async function WebsitePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const headerList = await headers();
  const session = await auth.api.getSession({
    headers: headerList,
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const website = await prisma.website.findUnique({
    where: { 
        id,
        ownerId: session.user.id
    },
    include: {
      visits: {
        orderBy: { entryTime: "desc" },
        take: 100,
      },
      _count: {
        select: { visits: true }
      }
    },
  });

  if (!website) {
    notFound();
  }

  // Calculate some stats
  const totalVisits = website._count.visits;
  const uniqueVisitors = new Set(website.visits.map(v => v.ip)).size;

  // Live Visitors (active in last 5 minutes and haven't exited)
  const fiveMinutesAgo = subMinutes(new Date(), 5);
  const liveVisitorsCount = await prisma.visit.count({
    where: {
      websiteId: id,
      exitTime: null,
      entryTime: { gte: fiveMinutesAgo }
    }
  });

  // Average Session Duration
  const finishedVisits = await prisma.visit.findMany({
    where: {
      websiteId: id,
      exitTime: { not: null }
    },
    select: {
      entryTime: true,
      exitTime: true
    }
  });

  const totalDurationSeconds = finishedVisits.reduce((acc, visit) => {
    return acc + (visit.exitTime!.getTime() - visit.entryTime.getTime()) / 1000;
  }, 0);
  
  const avgDurationSeconds = finishedVisits.length > 0 ? totalDurationSeconds / finishedVisits.length : 0;
  const avgMinutes = Math.floor(avgDurationSeconds / 60);
  const avgSeconds = Math.floor(avgDurationSeconds % 60);
  const avgTimeFormatted = finishedVisits.length > 0 ? `${avgMinutes}m ${avgSeconds}s` : "0s";
  
  // Group by path
  const pages = website.visits.reduce((acc: any, v) => {
    const path = v.path || "/";
    acc[path] = (acc[path] || 0) + 1;
    return acc;
  }, {});
  const sortedPages = Object.entries(pages).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10);

  // Group by Sources (UTM or Referrer)
  const sources = website.visits.reduce((acc: any, v) => {
    let source = v.utmSource || "Direct";
    if (source === "Direct" && v.referrer) {
      try {
        const refUrl = new URL(v.referrer);
        source = refUrl.hostname;
      } catch (e) {
        source = v.referrer;
      }
    }
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});
  const sortedSources = Object.entries(sources).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10);

  // Group by Country
  const countries = website.visits.reduce((acc: any, v) => {
    const country = v.country || "Unknown";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});
  const sortedCountries = Object.entries(countries).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10);

  // Group by Device Type
  const devices = website.visits.reduce((acc: any, v) => {
    const device = v.device || "desktop";
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});
  const sortedDevices = Object.entries(devices).sort((a: any, b: any) => b[1] - a[1]);

  // Group by OS
  const osSystems = website.visits.reduce((acc: any, v) => {
    const os = v.os || "Unknown";
    acc[os] = (acc[os] || 0) + 1;
    return acc;
  }, {});
  const sortedOS = Object.entries(osSystems).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10);

  // Group by Browser
  const browsers = website.visits.reduce((acc: any, v) => {
    const browser = v.browser || "Unknown";
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {});
  const browserData = Object.entries(browsers).map(([name, value]) => ({ name, value: value as number })).sort((a, b) => b.value - a.value);

  // Group by date (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return format(date, "yyyy-MM-dd");
  }).reverse();

  const trendData = last7Days.map(date => ({
    date,
    visits: website.visits.filter(v => format(v.entryTime, "yyyy-MM-dd") === date).length
  }));

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
    
          <h1 className="text-3xl font-bold tracking-tight">{website.name}</h1>
          <p className="text-muted-foreground flex items-center gap-1 font-mono text-sm leading-none mt-1">
            <Globe2 className="h-3 w-3" /> {website.domain}
          </p>
        </div>
        <div className="flex gap-2">
           <EditWebsiteDialog website={website}>
              <Button variant="outline">Settings</Button>
           </EditWebsiteDialog>
           <ExportButton websiteId={website.id} websiteName={website.name} />
           <DeleteWebsiteDialog websiteId={website.id} websiteName={website.name}>
              <Button variant="destructive">Delete</Button>
           </DeleteWebsiteDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pageviews</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisits.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueVisitors.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Live Visitors</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveVisitorsCount}</div>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Time</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTimeFormatted}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Visitor Trends
            </CardTitle>
            <CardDescription>Daily pageviews for the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <VisitsTrendChart data={trendData} />
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>Browser Distribution</CardTitle>
            <CardDescription>Visual breakdown of visitor browsers.</CardDescription>
          </CardHeader>
          <CardContent>
            <BrowserDistributionChart data={browserData} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="pages" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-4">
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pages" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-primary/10 shadow-sm">
                <CardHeader>
                  <CardTitle>Top Pages Performance</CardTitle>
                  <CardDescription>Most visited paths and their relative popularity.</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopPagesBarChart data={sortedPages.map(([path, visits]) => ({ path, visits: visits as number }))} />
                </CardContent>
              </Card>

              <Card className="border-primary/10 shadow-sm">
                <CardHeader>
                  <CardTitle>Recent Visits</CardTitle>
                  <CardDescription>Real-time stream of the lastest 100 visitors.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y max-h-[400px] overflow-auto">
                      {website.visits.map((visit) => (
                        <div key={visit.id} className="p-4 flex flex-col gap-1 hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{visit.path}</span>
                            <span className="text-[10px] text-muted-foreground">{format(new Date(visit.entryTime), "HH:mm:ss")}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {visit.city}{visit.region && visit.region !== "Unknown" ? `, ${visit.region}` : ""}, {visit.country}</span>
                            <span className="flex items-center gap-1"><Monitor className="h-3 w-3" /> {visit.browser} on {visit.os}</span>
                          </div>
                        </div>
                      ))}
                      {website.visits.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">No visits recorded yet</div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sources" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-primary/10 shadow-sm">
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                    <CardDescription>Where your visitors are coming from.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <StatsList title="Source / Referrer" data={sortedSources as [string, number][]} total={totalVisits} />
                  </CardContent>
                </Card>
                <Card className="border-primary/10 shadow-sm">
                  <CardHeader>
                    <CardTitle>UTM Parameters</CardTitle>
                    <CardDescription>Marketing campaign performance.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                     <StatsList title="UTM Campaign" data={Object.entries(website.visits.reduce((acc: any, v) => {
                       if (v.utmCampaign) acc[v.utmCampaign] = (acc[v.utmCampaign] || 0) + 1;
                       return acc;
                     }, {})).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5) as [string, number][]} total={totalVisits} />
                     
                     <StatsList title="UTM Medium" data={Object.entries(website.visits.reduce((acc: any, v) => {
                       if (v.utmMedium) acc[v.utmMedium] = (acc[v.utmMedium] || 0) + 1;
                       return acc;
                     }, {})).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5) as [string, number][]} total={totalVisits} />
                  </CardContent>
                </Card>
             </div>
          </TabsContent>

          <TabsContent value="locations" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-primary/10 shadow-sm">
                  <CardHeader>
                    <CardTitle>Top Countries</CardTitle>
                    <CardDescription>Geographic distribution of your audience.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <StatsList title="Country" data={sortedCountries as [string, number][]} total={totalVisits} />
                  </CardContent>
                </Card>
                <Card className="border-primary/10 shadow-sm">
                  <CardHeader>
                    <CardTitle>Top Cities</CardTitle>
                    <CardDescription>Urban distribution of your visitors.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <StatsList title="City" data={Object.entries(website.visits.reduce((acc: any, v) => {
                        const city = v.city || "Unknown";
                        acc[city] = (acc[city] || 0) + 1;
                        return acc;
                      }, {})).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10) as [string, number][]} total={totalVisits} />
                  </CardContent>
                </Card>
             </div>
          </TabsContent>

          <TabsContent value="devices" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="border-primary/10 shadow-sm">
                  <CardHeader>
                    <CardTitle>Devices</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <StatsList title="Device Type" data={sortedDevices as [string, number][]} total={totalVisits} />
                  </CardContent>
                </Card>
                <Card className="border-primary/10 shadow-sm">
                  <CardHeader>
                    <CardTitle>Operating Systems</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <StatsList title="OS" data={sortedOS as [string, number][]} total={totalVisits} />
                  </CardContent>
                </Card>
                <Card className="border-primary/10 shadow-sm">
                  <CardHeader>
                    <CardTitle>Browsers</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <StatsList title="Browser" data={browserData.map(b => [b.name, b.value] as [string, number])} total={totalVisits} />
                  </CardContent>
                </Card>
             </div>
          </TabsContent>
        </Tabs>
      </div>

      <Card className="border-primary/10 shadow-sm border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Installation Script</CardTitle>
          <CardDescription>Paste this script into the <code>&lt;head&gt;</code> of your website to start tracking visits.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg font-mono text-[11px] overflow-x-auto border">
            <code>
{`<script 
  src="${headerList.get('x-forwarded-proto') || 'https'}://${headerList.get('host')}/analytics.js" 
  data-website-id="${website.id}"
  data-domain="${website.domain}"
  async
></script>`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
