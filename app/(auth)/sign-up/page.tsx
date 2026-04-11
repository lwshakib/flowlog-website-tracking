/**
 * @file app/(auth)/sign-up/page.tsx
 * @description The Sign Up page of the application.
 * Provides the interface for new users to create an account.
 */

import { Logo } from "@/components/layout/logo";
import { SignUpForm } from "@/components/auth/signup-form";
import Image from "next/image";

/**
 * SignUpPage Component
 * @description Renders the registration interface for new users.
 * @returns {JSX.Element} The rendered Sign Up page.
 */
export default function SignUpPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Column: Decorative Background Image (Visible on large screens) */}
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/images/auth/signup-bg.png"
          alt="Sign Up Background"
          fill
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </div>

      {/* Right Column: Form and Logo */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Application Logo */}
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>

        {/* Sign Up Form Container */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
}
