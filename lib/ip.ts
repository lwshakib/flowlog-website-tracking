/**
 * @file lib/ip.ts
 * @description Utilities for secure client IP extraction, validation, and geolocation lookup.
 * Prevents IP spoofing attacks via untrusted X-Forwarded-For headers and validates IP ranges.
 */

import { NextRequest } from "next/server";

/**
 * Validates whether a string is a syntactically valid IPv4 address.
 * @param {string} ip - The IP string to validate.
 * @returns {boolean} True if valid IPv4, false otherwise.
 */
export function isValidIPv4(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipv4Regex);
  if (!match) return false;

  for (let i = 1; i <= 4; i++) {
    const octet = Number(match[i]);
    if (octet < 0 || octet > 255 || (match[i].length > 1 && match[i].startsWith("0"))) {
      return false;
    }
  }
  return true;
}

/**
 * Validates whether a string is a syntactically valid IPv6 address.
 * @param {string} ip - The IP string to validate.
 * @returns {boolean} True if valid IPv6, false otherwise.
 */
export function isValidIPv6(ip: string): boolean {
  // IPv4-mapped IPv6 address format (e.g. ::ffff:192.0.2.1)
  if (ip.toLowerCase().startsWith("::ffff:")) {
    const ipv4Part = ip.slice(7);
    return isValidIPv4(ipv4Part);
  }

  const ipv6Regex =
    /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
  return ipv6Regex.test(ip);
}

/**
 * Validates whether a string is a valid IPv4 or IPv6 address.
 * @param {string} ip - The IP string to validate.
 * @returns {boolean} True if valid IP, false otherwise.
 */
export function isValidIP(ip: string): boolean {
  if (!ip || typeof ip !== "string") return false;
  const cleanIp = cleanIPString(ip);
  return isValidIPv4(cleanIp) || isValidIPv6(cleanIp);
}

/**
 * Cleans IP string by removing port suffix or square brackets if present.
 * @param {string} ip - Raw IP string (e.g. "192.168.1.1:8080" or "[::1]:3000").
 * @returns {string} Cleaned IP string.
 */
export function cleanIPString(ip: string): string {
  const trimmed = ip.trim();

  // Handle bracketed IPv6 e.g. [::1] or [::1]:8080
  if (trimmed.startsWith("[") && trimmed.includes("]")) {
    const closingBracketIndex = trimmed.indexOf("]");
    return trimmed.substring(1, closingBracketIndex);
  }

  // Handle IPv4 with port e.g. 192.168.1.1:8080 (only when exactly one colon is present)
  if (trimmed.includes(".") && trimmed.includes(":")) {
    const colonCount = (trimmed.match(/:/g) || []).length;
    if (colonCount === 1) {
      const colonIndex = trimmed.lastIndexOf(":");
      return trimmed.substring(0, colonIndex);
    }
  }

  return trimmed;
}

/**
 * Checks if an IP is private, reserved, loopback, link-local, or documentation-only.
 * @param {string} ip - The IP to check.
 * @returns {boolean} True if private/reserved/local, false if public.
 */
export function isPrivateOrLocalIP(ip: string): boolean {
  if (!ip) return true;
  const cleanIp = cleanIPString(ip);

  // Handle IPv4-mapped IPv6 address (::ffff:192.168.1.1)
  if (cleanIp.toLowerCase().startsWith("::ffff:")) {
    return isPrivateOrLocalIP(cleanIp.slice(7));
  }

  // Check IPv4 ranges
  if (isValidIPv4(cleanIp)) {
    const parts = cleanIp.split(".").map(Number);
    const [b0, b1, b2] = parts;

    // 0.0.0.0/8 (Current network / "this" host)
    if (b0 === 0) return true;

    // 10.0.0.0/8 (Private network)
    if (b0 === 10) return true;

    // 100.64.0.0/10 (Carrier-grade NAT)
    if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

    // 127.0.0.0/8 (Loopback)
    if (b0 === 127) return true;

    // 169.254.0.0/16 (Link-local)
    if (b0 === 169 && b1 === 254) return true;

    // 172.16.0.0/12 (Private network: 172.16.0.0 - 172.31.255.255)
    if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

    // 192.0.0.0/24 (IETF Protocol Assignments)
    if (b0 === 192 && b1 === 0 && b2 === 0) return true;

    // 192.0.2.0/24 (TEST-NET-1 documentation)
    if (b0 === 192 && b1 === 0 && b2 === 2) return true;

    // 192.168.0.0/16 (Private network)
    if (b0 === 192 && b1 === 168) return true;

    // 198.18.0.0/15 (Benchmarking)
    if (b0 === 198 && (b1 === 18 || b1 === 19)) return true;

    // 198.51.100.0/24 (TEST-NET-2 documentation)
    if (b0 === 198 && b1 === 51 && b2 === 100) return true;

    // 203.0.113.0/24 (TEST-NET-3 documentation)
    if (b0 === 203 && b1 === 0 && b2 === 113) return true;

    // 224.0.0.0/4 (Multicast: 224.0.0.0 - 239.255.255.255)
    if (b0 >= 224 && b0 <= 239) return true;

    // 240.0.0.0/4 (Reserved / Future use)
    if (b0 >= 240) return true;

    // 255.255.255.255 (Broadcast)
    if (b0 === 255) return true;

    return false;
  }

  // Check IPv6 ranges
  if (isValidIPv6(cleanIp)) {
    const normalized = cleanIp.toLowerCase();

    // Loopback & Unspecified
    if (normalized === "::1" || normalized === "::") return true;

    // Unique Local Address (fc00::/7 -> fc.. and fd..)
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;

    // Link-local (fe80::/10 -> fe8.., fe9.., fea.., feb..)
    if (
      normalized.startsWith("fe8") ||
      normalized.startsWith("fe9") ||
      normalized.startsWith("fea") ||
      normalized.startsWith("feb")
    ) {
      return true;
    }

    // Multicast (ff00::/8)
    if (normalized.startsWith("ff")) return true;

    // Documentation (2001:db8::/32)
    if (normalized.startsWith("2001:db8:") || normalized.startsWith("2001:0db8:")) return true;

    return false;
  }

  // If not valid IP, treat as non-public
  return true;
}

/**
 * Extracts and validates the client IP address from a NextRequest securely.
 * Prioritizes trusted provider headers, respects TRUST_PROXY configuration,
 * and prevents untrusted header spoofing.
 *
 * @param {NextRequest} req - The incoming NextRequest.
 * @returns {string} The verified client IP or empty string if undetectable.
 */
export function getClientIp(req: NextRequest): string {
  const trustProxy = process.env.TRUST_PROXY === "true" || process.env.TRUST_PROXY === "1";

  // 1. Check direct socket / runtime connection IP if exposed by NextRequest
  // (e.g. req.ip in edge runtime or custom servers)
  const directIp = (req as unknown as { ip?: string }).ip;
  if (directIp && isValidIP(directIp)) {
    return cleanIPString(directIp);
  }

  // 2. Platform-specific trusted proxy headers (injected by host infrastructure)
  // Cloudflare: CF-Connecting-IP cannot be spoofed when proxied through Cloudflare
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp && isValidIP(cfIp)) {
    return cleanIPString(cfIp);
  }

  // Vercel edge IP header
  const vercelForwardedFor = req.headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    const firstVercelIp = vercelForwardedFor.split(",")[0]?.trim();
    if (firstVercelIp && isValidIP(firstVercelIp)) {
      return cleanIPString(firstVercelIp);
    }
  }

  // Fastly client IP
  const fastlyIp = req.headers.get("fastly-client-ip");
  if (fastlyIp && isValidIP(fastlyIp)) {
    return cleanIPString(fastlyIp);
  }

  // 3. If trust proxy is explicitly enabled, parse X-Forwarded-For or X-Real-IP
  if (trustProxy) {
    const xForwardedFor = req.headers.get("x-forwarded-for");
    if (xForwardedFor) {
      // In trusted proxy chain, the first IP is the original client
      const ips = xForwardedFor.split(",").map((s) => s.trim());
      for (const ip of ips) {
        if (isValidIP(ip)) {
          return cleanIPString(ip);
        }
      }
    }

    const xRealIp = req.headers.get("x-real-ip");
    if (xRealIp && isValidIP(xRealIp)) {
      return cleanIPString(xRealIp);
    }
  }

  // 4. Default fallback: check X-Real-IP if valid, or return empty if proxy is not trusted
  const fallbackRealIp = req.headers.get("x-real-ip");
  if (fallbackRealIp && isValidIP(fallbackRealIp)) {
    return cleanIPString(fallbackRealIp);
  }

  return "";
}

export interface GeolocationData {
  city: string;
  region: string;
  country: string;
  countryCode: string;
}

/**
 * Resolves geolocation data for a request.
 * Prioritizes trusted platform headers (Vercel/Cloudflare) before falling back to ip-api.com.
 * Skips external lookups for private/local/invalid IPs to prevent quota exhaustion and latency.
 *
 * @param {NextRequest} req - The incoming request.
 * @param {string} ip - The verified client IP.
 * @returns {Promise<GeolocationData>} The resolved geolocation information.
 */
export async function getGeolocation(req: NextRequest, ip: string): Promise<GeolocationData> {
  const result: GeolocationData = {
    city: "Unknown",
    region: "Unknown",
    country: "Unknown",
    countryCode: "Unknown",
  };

  // 1. Check Vercel edge geolocation headers first (zero network overhead & secure)
  const vercelCity = req.headers.get("x-vercel-ip-city");
  const vercelCountry = req.headers.get("x-vercel-ip-country");
  const vercelRegion = req.headers.get("x-vercel-ip-country-region");

  if (vercelCity || vercelCountry) {
    if (vercelCity) result.city = decodeURIComponent(vercelCity);
    if (vercelCountry) {
      result.country = vercelCountry;
      result.countryCode = vercelCountry;
    }
    if (vercelRegion) result.region = vercelRegion;
    return result;
  }

  // 2. Check Cloudflare edge geolocation headers
  const cfCountry = req.headers.get("cf-ipcountry");
  const cfCity = req.headers.get("cf-ipcity");
  const cfRegion = req.headers.get("cf-region");

  if (cfCountry || cfCity) {
    if (cfCity) result.city = cfCity;
    if (cfCountry) {
      result.country = cfCountry;
      result.countryCode = cfCountry;
    }
    if (cfRegion) result.region = cfRegion;
    return result;
  }

  // 3. If no platform headers, and IP is a valid public IP, query ip-api.com
  if (ip && isValidIP(ip) && !isPrivateOrLocalIP(ip)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const geoRes = await fetch(`https://ip-api.com/json/${encodeURIComponent(ip)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.status === "success") {
          result.city = geoData.city || "Unknown";
          result.region = geoData.regionName || "Unknown";
          result.country = geoData.country || "Unknown";
          result.countryCode = geoData.countryCode || "Unknown";
        }
      }
    } catch (e) {
      console.error("Geo lookup failed:", e);
    }
  }

  return result;
}
