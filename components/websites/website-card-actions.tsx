"use client";

import { EditWebsiteDialog } from "./edit-website-dialog";
import { DeleteWebsiteDialog } from "./delete-website-dialog";
import { ArrowUpRight } from "lucide-react";

interface Website {
  id: string;
  name: string;
  domain: string;
  trackLocalhost: boolean;
}

export function WebsiteCardActions({ website }: { website: Website }) {
  return (
    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
      <EditWebsiteDialog website={website} />
      <DeleteWebsiteDialog websiteId={website.id} websiteName={website.name} />
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
        <ArrowUpRight className="h-4 w-4 text-primary" />
      </div>
    </div>
  );
}
