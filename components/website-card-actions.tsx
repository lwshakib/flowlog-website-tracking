"use client"

import { EditWebsiteDialog } from "@/components/edit-website-dialog"
import { DeleteWebsiteDialog } from "@/components/delete-website-dialog"
import { ArrowUpRight } from "lucide-react"

export function WebsiteCardActions({ website }: { website: any }) {
  return (
    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
      <EditWebsiteDialog website={website} />
      <DeleteWebsiteDialog websiteId={website.id} websiteName={website.name} />
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
        <ArrowUpRight className="h-4 w-4 text-primary" />
      </div>
    </div>
  )
}
