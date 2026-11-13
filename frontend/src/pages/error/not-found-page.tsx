import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Compass, Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-coral-50 text-coral-600 flex items-center justify-center mb-6 border border-coral-200/60 shadow-subtle">
        <Compass className="h-8 w-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight">
        404 — Page Not Found
      </h1>

      <p className="mt-2 max-w-md text-sm text-charcoal-600 leading-relaxed">
        The page you are looking for does not exist or has been moved to a new address.
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" leftIcon={<Home className="h-4 w-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link to="/events">
          <Button variant="outline">
            Browse Events
          </Button>
        </Link>
      </div>
    </div>
  );
}
