"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Suspense } from "react";

function ResetPasswordFormContent({ className, ...props }: React.ComponentProps<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing. Please use the link from your email.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token: token,
      });

      if (error) {
        setError(
          error.message || "Failed to reset password. The link may have expired or is invalid."
        );
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);
      toast.success("Password reset successfully");

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    } catch {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={cn("flex flex-col gap-6 text-center", className)}>
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="size-6 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Invalid Link</h1>
          <p className="text-muted-foreground text-sm text-balance">
            This password reset link is missing its security token. Please request a new link.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/forgot-password">Request New Link</Link>
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6 text-center", className)}>
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-green-500/10 p-3">
            <CheckCircle2 className="size-6 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold">Password Reset</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Your password has been successfully reset. Redirecting you to sign in...
          </p>
        </div>
        <Button asChild>
          <Link href="/sign-in">Sign In Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Set new password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your new password below.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
            {error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="••••••••"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm New Password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            placeholder="••••••••"
          />
        </Field>

        <Field>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Resetting password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

export function ResetPasswordForm(props: React.ComponentProps<"form">) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordFormContent {...props} />
    </Suspense>
  );
}
