/**
 * @file app/(auth)/sign-in/page.tsx
 * @description The Sign In page of the application.
 * Features a split layout with the login form on one side and a decorative image on the other.
 */

import { Logo } from "@/components/layout/logo";
import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

/**
 * SignInPage Component
 * @description Renders the login interface for existing users.
 * @returns {JSX.Element} The rendered Sign In page.
 */
export default function SignInPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Column: Form and Logo */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Application Logo */}
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>

        {/* Login Form Container */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Right Column: Decorative Background Image (Visible on large screens) */}
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/signin-bg.png"
          alt="Sign In Background"
          fill
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </div>
    </div>
  );
}
