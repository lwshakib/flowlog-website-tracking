/**
 * @file app/(auth)/layout.tsx
 * @description Layout component for authentication-related pages (Sign In, Sign Up).
 * Provides a consistent container for authentication flows.
 */

/**
 * AuthLayout Component
 * @description Wraps authentication pages in a full-height container.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The authentication page content.
 * @returns {JSX.Element} The rendered authentication layout.
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen w-full">{children}</div>;
}
