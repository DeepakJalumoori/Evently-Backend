import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { useMyBookingsQuery } from "@/features/bookings/hooks/useBookings";
import { BookingCard } from "@/features/bookings/components/booking-card";
import { CancelBookingDialog } from "@/features/bookings/components/cancel-booking-dialog";
import { BookingItem } from "@/types/booking.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getApiErrorMessage } from "@/services/api-client";
import {
  Ticket,
  Calendar,
  Compass,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";

export function AttendeeDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useMyBookingsQuery();
  const bookings = data?.bookings ?? [];
  const activeBookings = bookings.filter((b) => b.status === "booked");

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="default" size="sm">Attendee Dashboard</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-charcoal-500 mt-0.5">
            Signed in as <span className="font-medium text-charcoal-700">{user?.email}</span>
          </p>
        </div>

        <Link to="/events">
          <Button variant="primary" size="md" leftIcon={<Compass className="h-4 w-4" />}>
            Explore Events
          </Button>
        </Link>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-subtle space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
            Active Reservations
          </span>
          <div className="text-3xl font-extrabold text-charcoal-900">
            {isLoading ? "..." : activeBookings.length}
          </div>
          <p className="text-xs text-charcoal-500">Upcoming confirmed seats</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-subtle space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
            Total Bookings
          </span>
          <div className="text-3xl font-extrabold text-charcoal-900">
            {isLoading ? "..." : bookings.length}
          </div>
          <p className="text-xs text-charcoal-500">All-time reservations</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-subtle space-y-1 sm:col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
            Quick Actions
          </span>
          <div className="pt-2 flex items-center gap-2">
            <Link to="/my-bookings" className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-xs" leftIcon={<Ticket className="h-3.5 w-3.5" />}>
                Manage Bookings
              </Button>
            </Link>
            <Link to="/events" className="flex-1">
              <Button variant="primary" size="sm" className="w-full text-xs" leftIcon={<Search className="h-3.5 w-3.5" />}>
                Find Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MyBookingsPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch, isFetching } = useMyBookingsQuery();

  const [filterTab, setFilterTab] = React.useState<"all" | "booked" | "cancelled">("all");
  const [selectedBookingForCancel, setSelectedBookingForCancel] = React.useState<BookingItem | null>(null);

  const bookings = data?.bookings ?? [];

  const filteredBookings = React.useMemo(() => {
    if (filterTab === "all") return bookings;
    return bookings.filter((b) => b.status === filterTab);
  }, [bookings, filterTab]);

  const activeCount = bookings.filter((b) => b.status === "booked").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="mb-2">
            <Badge variant="default" size="sm">
              My Reservations
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            My Bookings
          </h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Manage your seat reservations and tickets ({user?.email})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>

          <Link to="/events">
            <Button variant="primary" size="sm" leftIcon={<Compass className="h-4 w-4" />}>
              Find More Events
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-surface-border pb-3">
        <button
          type="button"
          onClick={() => setFilterTab("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filterTab === "all"
              ? "bg-coral-500 text-white shadow-sm"
              : "bg-surface-subtle text-charcoal-600 hover:bg-surface-border/60"
          }`}
        >
          All Bookings ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("booked")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filterTab === "booked"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-surface-subtle text-charcoal-600 hover:bg-surface-border/60"
          }`}
        >
          Active Confirmed ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("cancelled")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filterTab === "cancelled"
              ? "bg-charcoal-700 text-white shadow-sm"
              : "bg-surface-subtle text-charcoal-600 hover:bg-surface-border/60"
          }`}
        >
          Cancelled ({cancelledCount})
        </button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Loading Skeleton */
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-surface-border bg-white shadow-subtle space-y-4 animate-pulse"
            >
              <div className="h-4 bg-charcoal-100 rounded w-1/4" />
              <div className="h-6 bg-charcoal-200 rounded w-1/2" />
              <div className="h-4 bg-charcoal-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : isError ? (
        /* Error State */
        <div className="p-8 rounded-2xl bg-white border border-red-200 shadow-subtle text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-charcoal-900">
              Unable to load your bookings
            </h3>
            <p className="text-xs text-charcoal-600 max-w-sm mx-auto">
              {getApiErrorMessage(error)}
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : bookings.length === 0 ? (
        /* Zero Bookings Empty State */
        <EmptyState
          title="No reservations found"
          description="You haven't reserved tickets for any events yet. Discover upcoming concerts, tech meetups, workshops, and gatherings happening near you."
          icon={<Ticket className="h-6 w-6 text-coral-500" />}
          action={
            <Link to="/events">
              <Button variant="primary" size="md" leftIcon={<Compass className="h-4 w-4" />}>
                Explore Upcoming Events
              </Button>
            </Link>
          }
        />
      ) : filteredBookings.length === 0 ? (
        /* Filtered Empty State */
        <div className="p-10 rounded-2xl bg-white border border-surface-border text-center space-y-3">
          <Calendar className="h-8 w-8 text-charcoal-400 mx-auto" />
          <h3 className="text-sm font-semibold text-charcoal-900">
            No {filterTab} bookings found
          </h3>
          <p className="text-xs text-charcoal-500">
            Try switching filter tabs to view other reservations.
          </p>
          <Button variant="outline" size="sm" onClick={() => setFilterTab("all")}>
            Show All Bookings
          </Button>
        </div>
      ) : (
        /* Booking Cards Grid / List */
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancelClick={(b) => setSelectedBookingForCancel(b)}
            />
          ))}
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      <CancelBookingDialog
        isOpen={Boolean(selectedBookingForCancel)}
        onClose={() => setSelectedBookingForCancel(null)}
        booking={selectedBookingForCancel}
        onCancelled={() => setSelectedBookingForCancel(null)}
      />
    </div>
  );
}
