import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export function UnauthorizedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6 border border-red-200/60 shadow-subtle">
        <ShieldAlert className="h-8 w-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight">
        403 — Access Denied
      </h1>

      <p className="mt-2 max-w-md text-sm text-charcoal-600 leading-relaxed">
        Your current account role (<strong>{user?.role || "guest"}</strong>) is not authorized
        to view this area. Organizer portals and attendee workflows are protected.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Link to={user?.role === "organizer" ? "/organizer" : "/events"}>
          <Button variant="primary" leftIcon={<Home className="h-4 w-4" />}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
