"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Loader2, MailCheck } from "lucide-react";
import Image from "next/image";

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const [isUnverified, setIsUnverified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsUnverified(false);
    setVerificationSent(false);
    setIsLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        if (error.status === 403 || error.message?.toLowerCase().includes("verify")) {
          setIsUnverified(true);
          setError("Please verify your email address to log in.");
        } else {
          setError(error.message || "Failed to sign in");
        }
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError("");
    setVerificationSent(false);
    setIsLoading(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/sign-in`,
      });
      if (error) {
        setError(error.message || "Failed to resend verification email");
        setIsLoading(false);
        return;
      }
      setIsUnverified(false);
      setVerificationSent(true);
      setIsLoading(false);
    } catch {
      setError("Failed to resend verification email");
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google") => {
    setSocialLoading(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
    } catch {
      setError(`Failed to sign in with ${provider}`);
      setSocialLoading(null);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>

        {verificationSent && (
          <div className="bg-primary/10 text-foreground text-sm p-3 rounded-md text-center flex flex-col gap-3 items-center">
            <MailCheck className="size-5 text-primary shrink-0" aria-hidden />
            <span>
              We sent a new link to <span className="font-medium">{email}</span>. Check your inbox
              and click the link—you&apos;ll return here once verification completes.
            </span>
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <Link href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
                Open Gmail
              </Link>
            </Button>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center flex flex-col gap-2 items-center">
            {error}
            {isUnverified && (
              <Button
                variant="link"
                size="sm"
                className="text-destructive font-semibold h-auto p-0"
                onClick={handleResendVerification}
                type="button"
              >
                Resend verification email
              </Button>
            )}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field className="gap-2">
          <Button
            variant="outline"
            type="button"
            disabled={socialLoading !== null}
            onClick={() => handleSocialLogin("google")}
          >
            {socialLoading === "google" ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Image
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="size-4 mr-2"
                width={16}
                height={16}
              />
            )}
            Login with Google
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
