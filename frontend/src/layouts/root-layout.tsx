import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogOut, Calendar, PlusCircle } from "lucide-react";

export function RootLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col text-charcoal-900 antialiased selection:bg-coral-100 selection:text-coral-900">
      {/* Global Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="md" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-charcoal-600">
            <NavLink
              to="/events"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-surface-subtle text-charcoal-900 font-semibold"
                    : "hover:text-charcoal-900 hover:bg-surface-subtle/50"
                }`
              }
            >
              Explore Events
            </NavLink>

            {isAuthenticated && user?.role === "attendee" && (
              <NavLink
                to="/my-bookings"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-surface-subtle text-charcoal-900 font-semibold"
                      : "hover:text-charcoal-900 hover:bg-surface-subtle/50"
                  }`
                }
              >
                My Bookings
              </NavLink>
            )}

            {isAuthenticated && user?.role === "organizer" && (
              <NavLink
                to="/organizer"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-surface-subtle text-charcoal-900 font-semibold"
                      : "hover:text-charcoal-900 hover:bg-surface-subtle/50"
                  }`
                }
              >
                Organizer Dashboard
              </NavLink>
            )}
          </nav>

          {/* Action CTAs & Auth State */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {user.role === "organizer" ? (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<PlusCircle className="h-4 w-4" />}
                    onClick={() => navigate("/organizer/events/create")}
                  >
                    Create Event
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Calendar className="h-4 w-4 text-coral-500" />}
                    onClick={() => navigate("/my-bookings")}
                  >
                    My Tickets
                  </Button>
                )}

                {/* User Session Pill */}
                <div className="flex items-center gap-2 pl-2 border-l border-surface-border">
                  <div className="flex flex-col text-right hidden sm:flex">
                    <span className="text-xs font-semibold text-charcoal-900 leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-charcoal-500 uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                  <Badge
                    variant={user.role === "organizer" ? "default" : "neutral"}
                    size="sm"
                  >
                    {user.role}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Log out"
                    className="h-8 w-8 p-0 text-charcoal-400 hover:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" variant="icon" />
            <span>Evently Platform • Minimalist event discovery & seat reservations.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/events" className="hover:text-charcoal-900 transition-colors">
              All Events
            </Link>
            <Link to="/login" className="hover:text-charcoal-900 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-charcoal-900 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
