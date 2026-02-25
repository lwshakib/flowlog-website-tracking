/**
 * @file app/api/track/route.ts
 * @description The main API endpoint for tracking website visits.
 * Handles 'start' (new visit) and 'end' (session termination) tracking events.
 * It also performs IP geolocation and User-Agent parsing.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UAParser } from "ua-parser-js";

/**
 * POST Handler
 * @description Receives tracking data from the 'analytics.js' script.
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} JSON response indicating success or error.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, websiteId, visitId, referrer, path } = body;

    // Basic validation: websiteId is required for any tracking
    if (!websiteId) {
      return NextResponse.json({ error: "websiteId is required" }, { status: 400 });
    }

    // Event: New visit session started
    if (type === "start") {
      const { hostname } = body;

      // Check if the website exists and if localhost tracking is enabled
      const website = await prisma.website.findUnique({
        where: { id: websiteId },
        select: { trackLocalhost: true },
      });

      const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
      if (isLocalhost && website && !website.trackLocalhost) {
        return NextResponse.json({ success: true, message: "Localhost tracking disabled" });
      }

      // Extract client information from headers
      const userAgent = req.headers.get("user-agent") || "";
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "";

      // Initialize location data with defaults
      let city = req.headers.get("x-vercel-ip-city") || "Unknown";
      let country = req.headers.get("x-vercel-ip-country") || "Unknown";
      let region = "Unknown";
      let countryCode = "Unknown";

      // Geolocation primary source using ip-api.com (if not on a private/local IP)
      if (
        ip &&
        ip !== "::1" &&
        ip !== "127.0.0.1" &&
        !ip.startsWith("192.168.") &&
        !ip.startsWith("10.")
      ) {
        try {
          const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
          const geoData = await geoRes.json();
          if (geoData.status === "success") {
            city = geoData.city;
            region = geoData.regionName;
            country = geoData.country;
            countryCode = geoData.countryCode;
          }
        } catch (e) {
          console.error("Geo lookup failed:", e);
        }
      }

      // Parse User-Agent for detailed device and OS information
      const parser = new UAParser(userAgent);
      const browser = parser.getBrowser().name || "Other";
      const os = parser.getOS().name || "Other";
      const device = parser.getDevice().type || "desktop";

      const { utmSource, utmMedium, utmCampaign } = body;

      // Create a new visit record in the database
      const visit = await prisma.visit.create({
        data: {
          websiteId,
          referrer,
          path,
          ip,
          city,
          region,
          country,
          countryCode,
          browser,
          os,
          device,
          utmSource,
          utmMedium,
          utmCampaign,
          entryTime: new Date(),
        },
      });

      // Return the generated visit ID to the client for subsequent 'end' event
      return NextResponse.json({ success: true, id: visit.id });
    }
    // Event: Visit session ended (e.g., page closed)
    else if (type === "end") {
      if (!visitId) {
        return NextResponse.json({ success: true, message: "No visitId provided" });
      }

      // Update the visit record with the exit time
      await prisma.visit.update({
        where: { id: visitId },
        data: {
          exitTime: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * OPTIONS Handler
 * @description Handles CORS preflight requests for cross-origin tracking.
 * @returns {NextResponse} Empty response with CORS headers.
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
