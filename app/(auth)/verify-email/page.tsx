"use client";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { MailCheck, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Suspense } from "react";
import { motion } from "motion/react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";
  const verified = searchParams.get("verified") === "true";

  if (verified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="rounded-full bg-green-500/10 p-3"
          >
            <CheckCircle2 className="size-6 text-green-500" />
          </motion.div>
          <h1 className="text-2xl font-bold">Email Verified!</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Your email has been successfully verified. You can now sign in to your account.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full shadow-lg shadow-primary/20">
            <Link href="/sign-in">Back to sign in</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-full bg-primary/10 p-3">
          <MailCheck className="size-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-muted-foreground text-sm text-balance">
          We&apos;ve sent a verification link to{" "}
          <span className="font-medium text-foreground">{email}</span>. Please verify your email to
          continue.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button asChild variant="outline">
          <Link href="https://mail.google.com" target="_blank">
            Open Gmail
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
      </div>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/verify-email-bg.png"
          alt="Verify Email Background"
          fill
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </div>

      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md text-center">
            <Suspense fallback={<div>Loading...</div>}>
              <VerifyEmailContent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
