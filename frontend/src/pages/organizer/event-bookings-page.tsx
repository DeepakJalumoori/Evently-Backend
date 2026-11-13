import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { useEventDetailQuery } from "@/features/events/hooks/useEvents";
import { useEventBookingsQuery } from "@/features/events/hooks/useOrganizerEvents";
import { EventBookingFilterStatus } from "@/types/event.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getApiErrorMessage } from "@/services/api-client";
import { formatEventDateTime, isPastEvent } from "@/utils/date-helpers";
import { formatPrice, formatCategoryLabel } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ticket,
  Users,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Receipt,
  CheckCircle2,
  XCircle,
  Percent,
  IndianRupee,
  Edit,
  ExternalLink,
} from "lucide-react";

export function EventBookingsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Query parameter state for bookings table
  const [status, setStatus] = React.useState<EventBookingFilterStatus>("all");
  const [page, setPage] = React.useState<number>(1);
  const limit = 20;

  // 1. Fetch full event details (provides venue, city, description, organizer)
  const {
    data: eventData,
    isLoading: isLoadingEvent,
    isError: isEventError,
    error: eventError,
    refetch: refetchEvent,
  } = useEventDetailQuery(id);

  // 2. Fetch booking records & summary statistics
  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    isError: isBookingsError,
    error: bookingsError,
    refetch: refetchBookings,
    isFetching: isFetchingBookings,
  } = useEventBookingsQuery(id, { status, page, limit });

  const event = eventData?.event;
  const summary = bookingsData?.summary;
  const pagination = bookingsData?.pagination;
  const bookings = bookingsData?.bookings ?? [];

  const totalResults = pagination?.totalResults ?? 0;
  const totalPages = pagination?.totalPages ?? 0;
  const currentPage = pagination?.currentPage ?? 1;

  // Ownership verification
  const isOwner = React.useMemo(() => {
    if (!event || !user) return false;
    const organizer: unknown = event.organizer;
    if (typeof organizer === "string") {
      return organizer === user.id;
    }
    if (typeof organizer === "object" && organizer !== null && "_id" in organizer) {
      return (organizer as { _id?: unknown })._id === user.id;
    }
    return false;
  }, [event, user]);

  const handleStatusChange = (newStatus: EventBookingFilterStatus) => {
    setStatus(newStatus);
    setPage(1); // Reset pagination when filter changes
  };

  const handleRefresh = () => {
    refetchEvent();
    refetchBookings();
  };

  // Determine error status
  const errorStatus =
    (bookingsError as any)?.response?.status || (eventError as any)?.response?.status;

  // 1. Loading State (initial load for either required dataset)
  if ((isLoadingEvent && !event) || (isLoadingBookings && !bookingsData)) {
    return <EventBookingsSkeleton />;
  }

  // 2. Forbidden / Unauthorized State (403)
  if (errorStatus === 403 || (event && user && !isOwner)) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 text-center">
        <div className="p-8 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-4 max-w-lg mx-auto">
          <ShieldAlert className="h-10 w-10 text-amber-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-charcoal-900">Unauthorized Access</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              You are signed in as <span className="font-semibold">{user?.email}</span>, but you are not allowed to view bookings for this event. You can only view attendee rosters for events you host.
            </p>
          </div>
          <Link to="/organizer">
            <Button variant="primary" size="sm">
              Return to My Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Not Found (404) or Invalid ID (400)
  if (errorStatus === 404 || (!isLoadingEvent && !event)) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 text-center">
        <div className="p-8 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-4 max-w-lg mx-auto">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-charcoal-900">Event Not Found</h3>
            <p className="text-xs text-charcoal-600">
              The requested event could not be found or you may not have permission to access it.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
              Retry
            </Button>
            <Link to="/organizer">
              <Button variant="primary" size="sm">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Other Fetch Errors
  if (isEventError || isBookingsError) {
    const errorMsg = getApiErrorMessage(bookingsError || eventError);
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 text-center">
        <div className="p-8 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-4 max-w-lg mx-auto">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-charcoal-900">Failed to Load Bookings</h3>
            <p className="text-xs text-charcoal-600">{errorMsg}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleRefresh} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
            Retry Request
          </Button>
        </div>
      </div>
    );
  }

  const isPast = event ? isPastEvent(event.dateTime) : false;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* 1. Header Navigation & Context */}
      <div className="space-y-4 border-b border-surface-border pb-6">
        <Link
          to="/organizer"
          className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-500 hover:text-charcoal-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Organizer Dashboard</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {event?.category && (
                <Badge variant="outline" size="sm">
                  {formatCategoryLabel(event.category)}
                </Badge>
              )}
              {isPast ? (
                <Badge variant="neutral" size="sm">
                  Past Event
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  Upcoming
                </Badge>
              )}
              <Badge variant="default" size="sm">
                Attendee Roster
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
              {event?.title || bookingsData?.event?.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-charcoal-600 flex-wrap pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-coral-500 shrink-0" />
                <span>{formatEventDateTime(event?.dateTime || bookingsData?.event?.dateTime || "")}</span>
              </div>
              {event?.venue && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-coral-500 shrink-0" />
                  <span>
                    {event.venue}, {event.city}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-coral-500 shrink-0" />
                <span>{formatPrice(event?.price ?? bookingsData?.event?.price ?? 0)} / seat</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetchingBookings}
              leftIcon={<RefreshCw className={cn("h-3.5 w-3.5", isFetchingBookings && "animate-spin")} />}
            >
              Refresh
            </Button>
            {id && (
              <Link to={`/organizer/events/${id}/edit`}>
                <Button variant="secondary" size="sm" leftIcon={<Edit className="h-3.5 w-3.5" />}>
                  Edit Event
                </Button>
              </Link>
            )}
            {id && (
              <Link to={`/events/${id}`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                  Public Page
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Summary Statistics Cards across Event Booking History */}
      {summary && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-charcoal-500 px-1">
            <span className="font-semibold uppercase tracking-wider">Event Booking Overview</span>
            <span>Covering entire event history</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Bookings */}
            <div className="p-4 rounded-2xl bg-white border border-surface-border shadow-subtle space-y-1">
              <div className="flex items-center justify-between text-charcoal-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
                <Receipt className="h-3.5 w-3.5 text-charcoal-500" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-charcoal-900">
                {summary.totalBookings}
              </div>
              <p className="text-[11px] text-charcoal-500">All reservations</p>
            </div>

            {/* Active Bookings */}
            <div className="p-4 rounded-2xl bg-white border border-surface-border shadow-subtle space-y-1">
              <div className="flex items-center justify-between text-charcoal-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-700">
                {summary.activeBookings}
              </div>
              <p className="text-[11px] text-charcoal-500">Confirmed attendees</p>
            </div>

            {/* Cancelled Bookings */}
            <div className="p-4 rounded-2xl bg-white border border-surface-border shadow-subtle space-y-1">
              <div className="flex items-center justify-between text-charcoal-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Cancelled</span>
                <XCircle className="h-3.5 w-3.5 text-rose-500" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-rose-600">
                {summary.cancelledBookings}
              </div>
              <p className="text-[11px] text-charcoal-500">Past cancellations</p>
            </div>

            {/* Booked Seats */}
            <div className="p-4 rounded-2xl bg-white border border-surface-border shadow-subtle space-y-1">
              <div className="flex items-center justify-between text-charcoal-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Seats</span>
                <Users className="h-3.5 w-3.5 text-coral-500" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-coral-600">
                {summary.bookedSeats}
                <span className="text-xs font-normal text-charcoal-400 ml-1">
                  / {event?.capacity ?? bookingsData?.event?.capacity ?? 0}
                </span>
              </div>
              <p className="text-[11px] text-charcoal-500">Active seats booked</p>
            </div>

            {/* Occupancy Rate */}
            <div className="p-4 rounded-2xl bg-white border border-surface-border shadow-subtle space-y-1">
              <div className="flex items-center justify-between text-charcoal-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Occupancy</span>
                <Percent className="h-3.5 w-3.5 text-coral-500" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-charcoal-900">
                {summary.occupancyRate}%
              </div>
              <p className="text-[11px] text-charcoal-500">Capacity utilization</p>
            </div>

            {/* Total Booking Value (Informational MVP Value) */}
            <div className="p-4 rounded-2xl bg-white border border-surface-border shadow-subtle space-y-1">
              <div className="flex items-center justify-between text-charcoal-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Value</span>
                <IndianRupee className="h-3.5 w-3.5 text-charcoal-500" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-charcoal-900">
                {formatPrice(summary.totalBookingValue)}
              </div>
              <p className="text-[11px] text-charcoal-500">Total booking value</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Controls Bar: Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-surface-border shadow-subtle">
        <div className="flex items-center gap-1.5 p-1 bg-surface rounded-xl border border-surface-border w-fit">
          <button
            type="button"
            onClick={() => handleStatusChange("all")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all",
              status === "all"
                ? "bg-white text-charcoal-900 shadow-sm"
                : "text-charcoal-600 hover:text-charcoal-900 hover:bg-white/50"
            )}
          >
            All Bookings ({summary?.totalBookings ?? 0})
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange("booked")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all",
              status === "booked"
                ? "bg-white text-charcoal-900 shadow-sm"
                : "text-charcoal-600 hover:text-charcoal-900 hover:bg-white/50"
            )}
          >
            Active ({summary?.activeBookings ?? 0})
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange("cancelled")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all",
              status === "cancelled"
                ? "bg-white text-charcoal-900 shadow-sm"
                : "text-charcoal-600 hover:text-charcoal-900 hover:bg-white/50"
            )}
          >
            Cancelled ({summary?.cancelledBookings ?? 0})
          </button>
        </div>

        <div className="text-xs text-charcoal-500 flex items-center gap-1.5">
          {isFetchingBookings && <RefreshCw className="h-3 w-3 animate-spin text-coral-500 shrink-0" />}
          <span>
            Showing <span className="font-semibold text-charcoal-800">{bookings.length}</span> of{" "}
            <span className="font-semibold text-charcoal-800">{totalResults}</span> {status} records
            {isFetchingBookings && <span className="text-coral-600 font-medium ml-1"> (Updating...)</span>}
          </span>
        </div>
      </div>

      {/* 4. Attendee Booking List */}
      {isLoadingBookings ? (
        <BookingsListSkeleton />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6 text-coral-500" />}
          title={
            status === "all"
              ? "No booking records yet"
              : `No ${status} bookings found`
          }
          description={
            status === "all"
              ? "When attendees register for this event, their reservation details and attendee names will appear here."
              : `There are currently no bookings with status '${status}' for this event. Try switching to 'All Bookings'.`
          }
          action={
            status !== "all" ? (
              <Button variant="outline" size="sm" onClick={() => handleStatusChange("all")}>
                View All Bookings
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={cn("space-y-4 transition-opacity duration-200", isFetchingBookings && "opacity-60")}>
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-hidden rounded-2xl border border-surface-border bg-white shadow-subtle">
            <table className="w-full text-left text-xs text-charcoal-700">
              <thead className="bg-surface border-b border-surface-border text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Attendee</th>
                  <th scope="col" className="px-5 py-3.5">Booking ID</th>
                  <th scope="col" className="px-5 py-3.5 text-center">Seats</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Amount</th>
                  <th scope="col" className="px-5 py-3.5 text-center">Status</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Booked At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/70">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-surface/50 transition-colors">
                    {/* Attendee Name */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-charcoal-900">
                        {booking.user ? (
                          booking.user.name
                        ) : (
                          <span className="text-charcoal-400 italic">Unknown Attendee</span>
                        )}
                      </div>
                    </td>

                    {/* Booking ID */}
                    <td className="px-5 py-4 font-mono text-[11px] text-charcoal-500">
                      <span title={booking._id}>
                        #{booking._id.substring(booking._id.length - 8).toUpperCase()}
                      </span>
                    </td>

                    {/* Seats */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-full bg-surface-subtle text-charcoal-800 border border-surface-border text-xs">
                        {booking.seats} {booking.seats === 1 ? "seat" : "seats"}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 text-right font-medium text-charcoal-900">
                      {formatPrice(booking.totalAmount)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center">
                      {booking.status === "booked" ? (
                        <Badge variant="success" size="sm">
                          Confirmed
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Cancelled
                        </Badge>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-right text-charcoal-500">
                      {formatEventDateTime(booking.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (< 640px) */}
          <div className="sm:hidden space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="p-4 rounded-2xl border border-surface-border bg-white shadow-subtle space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-sm text-charcoal-900">
                    {booking.user ? (
                      booking.user.name
                    ) : (
                      <span className="text-charcoal-400 italic">Unknown Attendee</span>
                    )}
                  </div>
                  {booking.status === "booked" ? (
                    <Badge variant="success" size="sm">
                      Confirmed
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Cancelled
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-charcoal-600 pt-1 border-t border-surface-border/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                      Booking ID
                    </span>
                    <span className="font-mono text-charcoal-700">
                      #{booking._id.substring(booking._id.length - 8).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                      Reserved Seats
                    </span>
                    <span className="font-semibold text-charcoal-800">
                      {booking.seats} {booking.seats === 1 ? "seat" : "seats"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                      Booking Value
                    </span>
                    <span className="font-bold text-charcoal-900">
                      {formatPrice(booking.totalAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                      Booked On
                    </span>
                    <span className="text-charcoal-500 text-[11px]">
                      {formatEventDateTime(booking.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 5. Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-surface-border">
              <span className="text-xs text-charcoal-500">
                Page <span className="font-semibold text-charcoal-800">{currentPage}</span> of{" "}
                <span className="font-semibold text-charcoal-800">{totalPages}</span> ({totalResults} total records)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || isFetchingBookings}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || isFetchingBookings}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Loading Skeleton for Event Bookings Page
 */
function EventBookingsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="space-y-4 border-b border-surface-border pb-6">
        <Skeleton className="h-4 w-40" />
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-4 w-60" />
          </div>
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>

      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
function BookingsListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-2xl" />
      ))}
    </div>
  );
}
