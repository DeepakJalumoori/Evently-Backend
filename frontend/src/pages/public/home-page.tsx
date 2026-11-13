import { Link } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { useEventsQuery } from "@/features/events/hooks/useEvents";
import { EventCard } from "@/features/events/components/event-card";
import { EventGridSkeleton } from "@/features/events/components/event-card-skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlusCircle, Calendar, Sparkles } from "lucide-react";

export function HomePage() {
  const { user, isAuthenticated } = useAuth();

  // Fetch upcoming 3 events for hero showcase
  const { data, isLoading } = useEventsQuery({
    limit: 3,
    sort: "dateTime",
    from: new Date().toISOString(),
  });

  const featuredEvents = data?.data ?? [];

  return (
    <div className="space-y-16 py-12 sm:py-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-charcoal-900 leading-tight max-w-3xl">
          Where gatherings <br />
          become <span className="text-coral-500">unforgettable.</span>
        </h1>

        <p className="text-lg text-charcoal-600 leading-relaxed max-w-2xl">
          Discover handpicked community meetups, concerts, sports tournaments, and developer conferences.
          Book your seats with real-time inventory reservations.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link to="/events">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Explore Events
            </Button>
          </Link>

          {!isAuthenticated ? (
            <Link to="/register">
              <Button variant="secondary" size="lg">
                Host an Event
              </Button>
            </Link>
          ) : user?.role === "organizer" ? (
            <Link to="/organizer">
              <Button variant="secondary" size="lg" leftIcon={<PlusCircle className="h-4 w-4 text-coral-500" />}>
                Organizer Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/my-bookings">
              <Button variant="secondary" size="lg" leftIcon={<Calendar className="h-4 w-4 text-coral-500" />}>
                My Reservations
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Featured Upcoming Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-coral-600 mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Upcoming Highlights</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-charcoal-900">
              Happening Soon
            </h2>
          </div>

          <Link to="/events" className="text-xs font-semibold text-coral-600 hover:text-coral-700 inline-flex items-center gap-1">
            <span>View all upcoming events</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <EventGridSkeleton count={3} />
        ) : featuredEvents.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-surface-border text-center space-y-2">
            <p className="text-sm font-semibold text-charcoal-800">No upcoming events scheduled right now</p>
            <p className="text-xs text-charcoal-500">Check the full catalog or sign in as an organizer to publish an event.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
