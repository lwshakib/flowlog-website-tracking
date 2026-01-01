import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { LogoIcon } from "@/components/logo";

import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { Separator } from "@/components/ui/separator";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const websites = session?.user?.id 
        ? await prisma.website.findMany({
            where: { ownerId: session.user.id },
            orderBy: { createdAt: "desc" },
        })
        : [];

    return (
        <SidebarProvider>
            <AppSidebar websites={websites} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4 hidden md:block" />
                        <DynamicBreadcrumb websites={websites} />
                        <div className="h-4 w-px bg-border mx-2 md:hidden" />
                        <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
                            <LogoIcon size={20} fill="currentColor" />
                            <span className="font-bold">FlowLog</span>
                        </Link>
                    </div>
                </header>
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
