import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const website = await prisma.website.findUnique({
      where: {
        id,
        ownerId: session.user.id,
      },
      include: {
        visits: {
          orderBy: { entryTime: "desc" },
        },
      },
    });

    if (!website) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Generate CSV
    const headers_csv = [
      "ID",
      "Path",
      "Referrer",
      "Entry Time",
      "Exit Time",
      "Browser",
      "OS",
      "Device",
      "Country",
      "Region",
      "City",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
    ];

    const rows = website.visits.map((visit) => [
      visit.id,
      visit.path || "/",
      visit.referrer || "",
      visit.entryTime.toISOString(),
      visit.exitTime?.toISOString() || "",
      visit.browser || "",
      visit.os || "",
      visit.device || "",
      visit.country || "",
      visit.region || "",
      visit.city || "",
      visit.utmSource || "",
      visit.utmMedium || "",
      visit.utmCampaign || "",
    ]);

    const csvContent = [
      headers_csv.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${website.name.replace(/[^a-z0-9]/gi, "_")}_analytics.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
