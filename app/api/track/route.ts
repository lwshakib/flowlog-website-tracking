import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UAParser } from "ua-parser-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, websiteId, visitId, referrer, path } = body;

    if (!websiteId) {
      return NextResponse.json({ error: "websiteId is required" }, { status: 400 });
    }

    if (type === "start") {
      const { hostname } = body;

      const website = await prisma.website.findUnique({
        where: { id: websiteId },
        select: { trackLocalhost: true },
      });

      const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
      if (isLocalhost && website && !website.trackLocalhost) {
        return NextResponse.json({ success: true, message: "Localhost tracking disabled" });
      }

      const userAgent = req.headers.get("user-agent") || "";
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "";

      let city = req.headers.get("x-vercel-ip-city") || "Unknown";
      let country = req.headers.get("x-vercel-ip-country") || "Unknown";
      let region = "Unknown";
      let countryCode = "Unknown";

      // Geolocation primary source using ip-api.com
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

      // Parse UA for better info
      const parser = new UAParser(userAgent);
      const browser = parser.getBrowser().name || "Other";
      const os = parser.getOS().name || "Other";
      const device = parser.getDevice().type || "desktop";

      const { utmSource, utmMedium, utmCampaign } = body;

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

      return NextResponse.json({ success: true, id: visit.id });
    } else if (type === "end") {
      if (!visitId) {
        return NextResponse.json({ success: true, message: "No visitId provided" });
      }
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

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
