"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createWebsite } from "@/actions/website";

export function CreateWebsiteDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState<{ id: string; domain: string } | null>(null);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const domain = formData.get("domain") as string;
    const trackLocalhost = formData.get("trackLocalhost") === "on";

    try {
      const website = await createWebsite({ name, domain, trackLocalhost });
      setSuccess(website);
      toast.success("Website created successfully");
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create website";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const scriptTag = success
    ? `<script 
  src="${window.location.origin}/analytics.js" 
  data-website-id="${success.id}"
  data-domain="${success.domain}"
  async
></script>`
    : "";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSuccess(null);
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Website
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {success ? (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Website Created!</DialogTitle>
              <DialogDescription>
                Copy this script and paste it into the <code>&lt;head&gt;</code> of your website.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted p-4 rounded-lg font-mono text-[11px] overflow-x-auto border">
              <code>{scriptTag}</code>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(scriptTag);
                  toast.success("Copied to clipboard");
                }}
              >
                Copy Script
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>Add Website</DialogTitle>
              <DialogDescription>
                Enter your website details to start tracking analytics.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="My Blog" required disabled={loading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  name="domain"
                  placeholder="example.com"
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="trackLocalhost" name="trackLocalhost" disabled={loading} />
                <Label htmlFor="trackLocalhost">Track Localhost</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Website
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
