import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";
import { LogOut, Calendar, Compass } from "lucide-react";

export function AttendeeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col text-charcoal-900 antialiased selection:bg-coral-100 selection:text-coral-900">
      <Toaster position="top-right" richColors />

      {/* Attendee Portal Header */}
      <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Logo size="md" />
            </Link>
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-surface-border">
              <Badge variant="neutral" size="sm">Attendee Portal</Badge>
            </div>
          </div>

          <nav className="flex items-center gap-1 text-sm font-medium text-charcoal-600">
            <NavLink
              to="/events"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "bg-surface-subtle text-charcoal-900 font-semibold"
                    : "hover:text-charcoal-900 hover:bg-surface-subtle/50"
                }`
              }
            >
              <Compass className="h-4 w-4" />
              <span>Explore</span>
            </NavLink>
            <NavLink
              to="/my-bookings"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "bg-surface-subtle text-charcoal-900 font-semibold"
                    : "hover:text-charcoal-900 hover:bg-surface-subtle/50"
                }`
              }
            >
              <Calendar className="h-4 w-4" />
              <span>My Bookings</span>
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-charcoal-700 hidden sm:inline">
              {user?.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<LogOut className="h-3.5 w-3.5" />}
              onClick={handleLogout}
            >
              Log out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
