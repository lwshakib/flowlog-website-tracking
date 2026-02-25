/**
 * @file app/api/websites/[id]/export/route.ts
 * @description API endpoint for exporting website analytics data as a CSV file.
 * Authenticates the user and ensures they own the website before generating the file.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET Handler
 * @description Generates and streams a CSV file containing all visit data for a specific website.
 * @param {NextRequest} req - Incoming request.
 * @param {Object} params - URL parameters containing website ID.
 * @returns {Promise<NextResponse>} A response with the CSV file content and attachment headers.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Authenticate the user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch website and all associated visits, ensuring the requester is the owner
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

    // Define CSV Headers
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

    // Map database visit records to CSV row arrays
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

    // Construct the CSV string with quoted cell values to handle special characters
    const csvContent = [
      headers_csv.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    // Return the content as a downloadable file
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
