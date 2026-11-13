import { Link, Outlet } from "react-router-dom";
import { Logo } from "@/components/common/logo";
import { ArrowLeft } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="min-h-screen w-full max-w-full bg-surface flex flex-col justify-between py-6 px-4 sm:py-8 sm:px-6 lg:px-8 text-charcoal-900 antialiased selection:bg-coral-100 selection:text-coral-900 overflow-x-hidden">
      {/* Top Header / Back Link */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500 hover:text-charcoal-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to events</span>
        </Link>
        <Logo size="sm" />
      </div>

      {/* Centered Auth Card Container */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <Outlet />
      </div>

      {/* Bottom Footer Note */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-charcoal-400">
        <span>Protected by Evently Security</span>
      </div>
    </div>
  );
}
