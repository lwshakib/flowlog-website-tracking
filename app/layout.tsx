/**
 * @file app/layout.tsx
 * @description The root layout component of the Flowlog application.
 * This file defines the global HTML structure, metadata, and common providers used across the app.
 */

import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

/**
 * Metadata configuration for the application.
 * Defines the title, description, icons, and web manifest for SEO and browser display.
 */
export const metadata: Metadata = {
  title: "Flowlog - Website Analytics",
  description: "Privacy-friendly, real-time website analytics for everyone.",
  icons: {
    icon: [
      {
        url: "/favicon_io/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon_io/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      { url: "/favicon_io/favicon.ico", sizes: "any", type: "image/x-icon" },
      {
        url: "/favicon_io/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/favicon_io/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/favicon_io/apple-touch-icon.png",
  },
  manifest: "/favicon_io/site.webmanifest",
};

/**
 * RootLayout Component
 * @description The entry point for the application's UI structure.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The content to be rendered within the layout.
 * @returns {JSX.Element} The rendered root layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Flowlog Analytics Script - Self-tracking for the dashboard itself */}
        <script
          src="https://flowlog-website-tracking.vercel.app/analytics.js"
          data-website-id="cmjva7wfc000104kzb2z6ctx5"
          data-domain="https://flowlog-website-tracking.vercel.app/"
          async
        ></script>
      </head>
      <body className="antialiased">
        {/* ThemeProvider: Manages light/dark mode throughout the application */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Main content of the page */}
          {children}

          {/* Toaster: Global notification system using sonner */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
