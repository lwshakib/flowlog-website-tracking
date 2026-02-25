"use client"; // Client-side hydration mark required for React hooks.

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
  User,
  Lock,
  Shield,
  Trash2,
  Smartphone,
  Monitor,
  Activity,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

/**
 * AccountPage Component
 * Provides a user-facing dashboard for managing their profile details,
 * reviewing active sessions, and executing dangerous actions (like account deletion).
 */
export default function AccountPage() {
  const router = useRouter(); // Next.js App router hook for programmatic navigation

  // Custom hook wrapping Better-Auth client to asynchronously fetch the currently logged in user context
  const { data: sessionData, isPending } = useSession();

  // Local state tracking which navigation tab on the sidebar is active
  const [activeNav, setActiveNav] = useState("profile");

  // Local loading state while performing the destructive deletion API call
  const [isDeleting, setIsDeleting] = useState(false);

  // Manual session state management
  interface Session {
    id: string;
    token: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    updatedAt: string | number | Date;
  }
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isSessionsPending, setIsSessionsPending] = useState(true);

  const fetchSessions = async () => {
    setIsSessionsPending(true);
    try {
      const response = await authClient.listSessions();
      if (response && response.data) {
        setSessions(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setIsSessionsPending(false);
    }
  };

  useEffect(() => {
    if (sessionData) {
      fetchSessions();
    }
  }, [sessionData]);

  // Password update states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // ---------------------------------------------------------------------------
  // ROUTE PROTECTION
  // If the hook finishes loading and no session object was returned, kick the user out
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isPending && !sessionData) {
      router.push("/");
    }
  }, [sessionData, isPending, router]);

  // Specific refs bound to the actual DOM elements mapping to the scroll sections
  const profileRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);
  const sessionsRef = useRef<HTMLDivElement>(null);
  const dangerRef = useRef<HTMLDivElement>(null);

  /**
   * Calculates position and dynamically smooth scrolls down to a specified section
   * when a sidebar button is clicked.
   */
  const scrollToSection = (section: string) => {
    setActiveNav(section); // Update active state visibly on sidebar

    // Map the string argument cleanly to actual React ref instances
    const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
      profile: profileRef,
      security: securityRef,
      sessions: sessionsRef,
      danger: dangerRef,
    };

    // Smoothly scroll using native DOM APIs mapping to the matched element
    refs[section]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start", // Align the targeted element to the top of the viewport frame
    });
  };

  /**
   * Action handler for changing display name logic.
   * Modifies the Better-Auth stored metadata.
   */
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Extract manual DOM value rather than using heavy controlled react states here for simplicity
    const nameInput = document.getElementById("display-name") as HTMLInputElement;
    if (!nameInput) return;

    try {
      // Trigger the Better-Auth API updating just the display name attribute
      const { error } = await authClient.updateUser({ name: nameInput.value });

      // Give contextual UI feedback over success/failure using sonner toast
      if (error) {
        toast.error(error.message || "Failed to update profile");
      } else {
        toast.success("Profile updated successfully.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  /**
   * Action handler to completely nuke the current user from existence.
   * Hits the custom internal `/api/account/delete` endpoint which cascades destruction through DB schema.
   */
  const handleDeleteAccount = async () => {
    setIsDeleting(true); // Engages loading spinner in the destructive button
    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      const result = await response.json();

      // Ensure HTTP request explicitly responds OK and payload succeeded
      if (!response.ok || result.error) {
        toast.error(result.error || "Failed to delete account");
      } else {
        toast.success("Account deleted successfully");

        // Sign out locally to wipe cookies cleanly before redirecting to the splash page
        await authClient.signOut();
        window.location.href = "/";
      }
    } catch {
      toast.error("An error occurred during account deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Action handler for updating user password.
   */
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: true, // Security best practice
      });

      if (error) {
        toast.error(error.message || "Failed to update password");
      } else {
        toast.success("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  /**
   * Revokes a specific session.
   */
  const handleRevokeSession = async (token: string) => {
    try {
      const { error } = await authClient.revokeSession({ token });
      if (error) {
        toast.error(error.message || "Failed to revoke session");
      } else {
        toast.success("Session revoked successfully.");
        fetchSessions();
      }
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  // Safely fallback user/session details
  const user = sessionData?.user;
  const currentSession = sessionData?.session;

  // Render a skeleton loading state to avoid hydration issues or flashing empty content
  if (isPending || !sessionData) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto py-8 sm:py-16 px-4 sm:px-6">
          <header className="mb-10 sm:mb-16 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </header>

          <div className="flex flex-col lg:flex-row gap-10 sm:gap-16">
            <aside className="w-full lg:w-48 space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </aside>

            <main className="flex-1 space-y-20">
              <section className="space-y-8">
                <div className="flex items-center gap-6">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="grid gap-6 max-w-xl">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full max-w-md" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Cleanly signs a user out dynamically, wiping state globally.
   */
  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/"; // Hard redirect clears out cached page artifacts globally
  };

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth">
      <div className="max-w-5xl mx-auto py-8 sm:py-16 px-4 sm:px-6">
        {/* Top contextual header block explaining the purpose of this page. */}
        <header className="mb-10 sm:mb-16">
          <h1 className="text-2xl font-semibold">Account Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile, security, and active sessions.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-10 sm:gap-16">
          {/* Sidebar Nav: Sticky positioning anchors it visibly alongside the main scrollable settings */}
          <aside className="w-full lg:w-48 lg:sticky lg:top-24 space-y-1">
            <NavBtn
              active={activeNav === "profile"}
              onClick={() => scrollToSection("profile")}
              icon={User}
              label="Profile"
            />
            <NavBtn
              active={activeNav === "security"}
              onClick={() => scrollToSection("security")}
              icon={Lock}
              label="Security"
            />
            <NavBtn
              active={activeNav === "sessions"}
              onClick={() => scrollToSection("sessions")}
              icon={Shield}
              label="Sessions"
            />

            {/* Split out boundary for destructive actions containing an Alert Dialogue wrapping Sign Out */}
            <div className="pt-4 mt-4 border-t border-border space-y-1">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign Out</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to sign out of your account?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSignOut} className="rounded-xl">
                      Sign Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <NavBtn
                active={activeNav === "danger"}
                onClick={() => scrollToSection("danger")}
                icon={Trash2}
                label="Delete Account"
                danger
              />
            </div>
          </aside>

          {/* Main List content: Each section is tracked using dynamic Refs for smooth scrolling */}
          <main className="flex-1 space-y-20">
            {/* =============== PROFILE SECTION =============== */}
            <section ref={profileRef} id="profile" className="scroll-mt-24 space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border relative">
                  {user?.image ? (
                    // Load the highly optimized Next.js image wrapper if OAuth profile photo exists
                    <Image src={user.image} alt="" fill className="object-cover" />
                  ) : (
                    // Fall back to simple standard icon
                    <User className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-medium">{user?.name || "User"}</h2>
                  <p className="text-xs text-muted-foreground">
                    Joined in{" "}
                    {/* Reliably formats database timestamps into highly readable format */}
                    {user?.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "2024"}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="display-name" className="text-xs text-muted-foreground">
                    Full Name
                  </Label>
                  <Input id="display-name" defaultValue={user?.name || ""} className="max-w-md" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Email Address</Label>
                  {/* Email address input visually locked out since direct auth mutation is restricted */}
                  <Input value={user?.email || ""} disabled className="max-w-md opacity-60" />
                </div>
                <Button onClick={handleUpdateProfile} variant="default" className="w-fit">
                  Save Changes
                </Button>
              </div>
            </section>

            <Separator />

            {/* =============== SECURITY SECTION =============== */}
            <section ref={securityRef} id="security" className="scroll-mt-24 space-y-8">
              <div>
                <h2 className="text-lg font-medium">Security</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Control your password and authentication settings.
                </p>
              </div>

              {/* Password modification interactions */}
              <div className="grid gap-6 max-w-xl">
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-xs text-muted-foreground">
                      Current Password
                    </Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="••••••••"
                      className="max-w-md"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isUpdatingPassword}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-xs text-muted-foreground">
                      New Password
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      className="max-w-md"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isUpdatingPassword}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-xs text-muted-foreground">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      className="max-w-md"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isUpdatingPassword}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-fit"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Activity className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </div>
            </section>

            <Separator />

            {/* =============== SESSIONS SECTION =============== */}
            <section ref={sessionsRef} id="sessions" className="scroll-mt-24 space-y-8">
              <div>
                <h2 className="text-lg font-medium">Active Sessions</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Devices currently connected to your account.
                </p>
              </div>

              <div className="border border-border/60 rounded-xl overflow-hidden divide-y divide-border/60">
                {isSessionsPending ? (
                  <div className="divide-y divide-border/60">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 flex items-center gap-4">
                        <Skeleton className="w-5 h-5 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : sessions && sessions.length > 0 ? (
                  sessions.map((session) => {
                    const isCurrent = session.id === currentSession?.id;
                    const isMobile = session.userAgent?.toLowerCase().includes("mobile");

                    return (
                      <div
                        key={session.id}
                        className={cn(
                          "p-4 flex items-center justify-between transition-colors",
                          isCurrent ? "bg-muted/30" : "hover:bg-muted/10"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          {isMobile ? (
                            <Smartphone className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <Monitor className="w-5 h-5 text-muted-foreground" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">
                                {session.userAgent || "Unknown Device"}
                              </p>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded uppercase">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-none mt-1">
                              {session.ipAddress || "Unknown IP"} •{" "}
                              {format(new Date(session.updatedAt), "MMM d, h:mm a")}
                            </p>
                          </div>
                        </div>

                        {!isCurrent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRevokeSession(session.token)}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No active sessions found.
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* =============== DANGER ZONE SECTION =============== */}
            <section
              ref={dangerRef}
              id="danger"
              className="scroll-mt-24 pt-8 border-t border-border"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 border border-destructive/20 rounded-xl bg-destructive/[0.02]">
                <div className="space-y-1.5">
                  <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Delete Account
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Permanently delete your profile, tools, and all associated data. This action is
                    irreversible.
                  </p>
                </div>

                {/* Second Alert Dialog wrapper ensuring multiple manual confirmations required before fully stripping the database */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="px-8 shadow-sm">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader className="space-y-3">
                      <AlertDialogTitle className="text-xl">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-base text-muted-foreground">
                        This will permanently remove your account and all data from our servers.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2">
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive hover:bg-destructive/90 rounded-xl px-6"
                      >
                        {isDeleting ? (
                          <span className="flex items-center gap-2">
                            <Activity className="w-4 h-4 animate-spin" />
                            Deleting...
                          </span>
                        ) : (
                          "Permanently Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * Functional component representing an isolated, stylistic Button specifically mapping internally to semantic sidebar layout rows.
 */
function NavBtn({
  active,
  onClick,
  icon: Icon,
  label,
  danger = false,
}: {
  active: boolean; // Triggers highlight background modifications
  onClick: () => void;
  icon: React.ElementType; // The Lucide component to render
  label: string; // Internal rendered readable name
  danger?: boolean; // Toggles the red UI warning state
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
        active
          ? danger
            ? "bg-red-50 text-red-600 font-medium"
            : "bg-muted text-foreground font-medium"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
