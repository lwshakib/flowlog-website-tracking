/**
 * @file app/(main)/layout.tsx
 * @description The main layout for the authenticated part of the application.
 * Includes the sidebar navigation and a header with dynamic breadcrumbs.
 */

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { LogoIcon } from "@/components/layout/logo";
import { DynamicBreadcrumb } from "@/components/layout/dynamic-breadcrumb";
import { Separator } from "@/components/ui/separator";

/**
 * MainLayout Component
 * @description Provides the sidebar-based navigation structure for authenticated users.
 * Fetches user session and their websites to populate the sidebar and breadcrumbs.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The main content of the dashboard or website view.
 * @returns {JSX.Element} The rendered main layout.
 */
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  // Retrieve the current user's session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch the list of websites owned by the user for navigation purposes
  const websites = session?.user?.id
    ? await prisma.website.findMany({
        where: { ownerId: session.user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <SidebarProvider>
      {/* AppSidebar: Navigational sidebar containing links to dashboard and websites */}
      <AppSidebar websites={websites} />

      <SidebarInset>
        {/* Header: Contains sidebar toggle, breadcrumbs, and mobile branding */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            {/* Toggle button for the sidebar */}
            <SidebarTrigger className="-ml-1" />

            <Separator orientation="vertical" className="mr-2 h-4 hidden md:block" />

            {/* Dynamic Breadcrumbs: Shows the current navigation path */}
            <DynamicBreadcrumb websites={websites} />

            <div className="h-4 w-px bg-border mx-2 md:hidden" />

            {/* Mobile Logo: Shown only on small screens */}
            <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
              <LogoIcon size={20} fill="currentColor" />
              <span className="font-bold">FlowLog</span>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
