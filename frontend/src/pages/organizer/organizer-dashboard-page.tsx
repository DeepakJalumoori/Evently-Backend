import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import {
  useOrganizerEventsQuery,
  useDeleteEventMutation,
} from "@/features/events/hooks/useOrganizerEvents";
import {
  OrganizerEventItem,
  OrganizerEventStatus,
  OrganizerEventSortField,
} from "@/types/event.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services/api-client";
import {
  formatEventDateTime,
  isPastEvent,
} from "@/utils/date-helpers";
import { formatPrice, formatCategoryLabel } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import {
  LayoutDashboard,
  PlusCircle,
  Calendar,
  MapPin,
  Ticket,
  ArrowUpDown,
  History,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Percent,
  Trash2,
  Users,
} from "lucide-react";

export function OrganizerDashboardPage() {
  const { user } = useAuth();

  // Query parameter state
  const [status, setStatus] = React.useState<OrganizerEventStatus>("all");
  const [sort, setSort] = React.useState<OrganizerEventSortField>("-createdAt");
  const [page, setPage] = React.useState<number>(1);
  const limit = 10;

  // Delete mutation and confirmation state
  const deleteMutation = useDeleteEventMutation();
  const [eventToDelete, setEventToDelete] = React.useState<OrganizerEventItem | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = React.useState<string | null>(null);

  // React Query hook connected to GET /api/events/mine
  const { data, isLoading, isError, error, refetch, isFetching } =
    useOrganizerEventsQuery({
      status,
      sort,
      page,
      limit,
    });

  const events = data?.data ?? [];
  const totalResults = data?.totalResults ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.currentPage ?? 1;

  // Clamp current page if deletion reduces the total page count below the current page
  React.useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const handleOpenDeleteModal = (event: OrganizerEventItem) => {
    setEventToDelete(event);
    setDeleteErrorMessage(null);
  };

  const handleCloseDeleteModal = () => {
    if (deleteMutation.isPending) return; // Prevent dismissing modal while deletion is processing
    setEventToDelete(null);
    setDeleteErrorMessage(null);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setDeleteErrorMessage(null);

    try {
      await deleteMutation.mutateAsync(eventToDelete._id);
      toast.success("Event deleted successfully");
      setEventToDelete(null);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setDeleteErrorMessage(
          "This event cannot be deleted because booking history exists (including past or cancelled registrations). Events with bookings must be preserved for financial and attendee records."
        );
      } else if (status === 403) {
        setDeleteErrorMessage("You are not authorized to delete this event.");
      } else if (status === 404) {
        setDeleteErrorMessage("The event could not be found or has already been deleted.");
      } else if (status === 400) {
        setDeleteErrorMessage("Invalid event ID.");
      } else {
        setDeleteErrorMessage(getApiErrorMessage(err));
      }
      toast.error(err?.response?.data?.message || "Failed to delete event");
    }
  };

  // Computed summary metrics across the current result set
  const countInView = events.length;
  const upcomingInView = events.filter((e) => !isPastEvent(e.dateTime)).length;
  const bookedSeatsInView = events.reduce((sum, e) => sum + e.bookedSeats, 0);
  const capacityInView = events.reduce((sum, e) => sum + e.capacity, 0);
  const occupancyInView =
    capacityInView > 0
      ? Math.min(100, Math.round((bookedSeatsInView / capacityInView) * 100))
      : 0;

  const handleStatusChange = (newStatus: OrganizerEventStatus) => {
    setStatus(newStatus);
    setPage(1); // Reset to first page when changing filter
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as OrganizerEventSortField);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="mb-1.5">
            <Badge variant="default" size="sm">Host Portal</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Organizer Dashboard
          </h1>
          <p className="text-sm text-charcoal-500 mt-0.5">
            Signed in as <span className="font-semibold text-charcoal-700">{user?.name}</span> ({user?.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            leftIcon={<RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />}
          >
            Refresh
          </Button>
          <Link to="/organizer/events/create">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events Metric */}
        <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Events</span>
            <LayoutDashboard className="h-4 w-4 text-coral-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
            {isLoading ? <Skeleton className="h-8 w-16" /> : totalResults}
          </div>
          <p className="text-xs text-charcoal-500">
            {status === "all" ? "All hosted events" : `Filtered by ${status}`}
          </p>
        </div>

        {/* Upcoming Events in View */}
        <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming in View</span>
            <Calendar className="h-4 w-4 text-coral-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              `${upcomingInView} / ${countInView}`
            )}
          </div>
          <p className="text-xs text-charcoal-500">Scheduled for future dates</p>
        </div>

        {/* Booked Seats in View */}
        <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Booked Seats (View)</span>
            <Ticket className="h-4 w-4 text-coral-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
            {isLoading ? <Skeleton className="h-8 w-16" /> : bookedSeatsInView}
          </div>
          <p className="text-xs text-charcoal-500">
            Across {countInView} events on this page
          </p>
        </div>

        {/* Average Occupancy in View */}
        <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Occupancy (View)</span>
            <Percent className="h-4 w-4 text-coral-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
            {isLoading ? <Skeleton className="h-8 w-16" /> : `${occupancyInView}%`}
          </div>
          <p className="text-xs text-charcoal-500">
            {bookedSeatsInView} of {capacityInView} seats filled
          </p>
        </div>
      </div>

      {/* 3. Controls Bar: Status Filter Tabs & Sort Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-surface-border shadow-subtle">
        {/* Status Filters */}
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
            All Events
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange("upcoming")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all",
              status === "upcoming"
                ? "bg-white text-charcoal-900 shadow-sm"
                : "text-charcoal-600 hover:text-charcoal-900 hover:bg-white/50"
            )}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange("past")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all",
              status === "past"
                ? "bg-white text-charcoal-900 shadow-sm"
                : "text-charcoal-600 hover:text-charcoal-900 hover:bg-white/50"
            )}
          >
            Past
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="organizer-event-sort" className="text-xs font-medium text-charcoal-500 flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Sort:</span>
          </label>
          <select
            id="organizer-event-sort"
            value={sort}
            onChange={handleSortChange}
            className="text-xs font-medium text-charcoal-800 bg-surface border border-surface-border rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500"
          >
            <option value="-createdAt">Newest Created</option>
            <option value="createdAt">Oldest Created</option>
            <option value="dateTime">Event Date (Earliest)</option>
            <option value="-dateTime">Event Date (Latest)</option>
            <option value="title">Title (A–Z)</option>
            <option value="-title">Title (Z–A)</option>
          </select>
        </div>
      </div>

      {/* 4. Event Listing Content */}
      {isLoading ? (
        <OrganizerEventGridSkeleton count={4} />
      ) : isError ? (
        <div className="p-8 rounded-2xl border border-rose-200 bg-rose-50/50 text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-charcoal-900">Failed to load hosted events</h3>
            <p className="text-xs text-charcoal-600 max-w-md mx-auto">
              {getApiErrorMessage(error)}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
            Retry Request
          </Button>
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-6 w-6 text-coral-500" />}
          title={status === "all" ? "No hosted events yet" : `No ${status} events found`}
          description={
            status === "all"
              ? "You haven't created any events yet. Publish your first event to start accepting attendee registrations."
              : `You have no ${status} events matching your current filter. Try selecting 'All Events' or create a new event.`
          }
          action={
            status === "all" ? (
              <Link to="/organizer/events/create">
                <Button variant="primary" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
                  Create Event
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleStatusChange("all")}>
                View All Events
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {events.map((event) => (
              <OrganizerEventCard
                key={event._id}
                event={event}
                onDelete={handleOpenDeleteModal}
              />
            ))}
          </div>

          {/* 5. Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-surface-border">
              <span className="text-xs text-charcoal-500">
                Page <span className="font-semibold text-charcoal-800">{currentPage}</span> of{" "}
                <span className="font-semibold text-charcoal-800">{totalPages}</span> ({totalResults} total events)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || isFetching}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || isFetching}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Delete Event Confirmation Modal */}
      <Modal
        isOpen={Boolean(eventToDelete)}
        onClose={handleCloseDeleteModal}
        title={
          <div className="flex items-center gap-2 text-rose-600 font-bold">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>Delete Event</span>
          </div>
        }
      >
        {eventToDelete && (
          <div className="space-y-4">
            <p className="text-sm text-charcoal-600 leading-relaxed">
              Are you sure you want to delete this event? This action is{" "}
              <strong className="text-charcoal-900 font-semibold">permanent</strong> and cannot be undone.
            </p>

            {/* Event Summary Box */}
            <div className="p-3.5 rounded-xl border border-surface-border bg-surface space-y-2">
              <div className="text-sm font-bold text-charcoal-900 line-clamp-2">
                {eventToDelete.title}
              </div>
              <div className="flex items-center gap-2 text-xs text-charcoal-600">
                <Calendar className="h-3.5 w-3.5 text-coral-500 shrink-0" />
                <span>{formatEventDateTime(eventToDelete.dateTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-charcoal-600">
                <MapPin className="h-3.5 w-3.5 text-coral-500 shrink-0" />
                <span className="truncate">
                  {eventToDelete.venue}, {eventToDelete.city}
                </span>
              </div>
            </div>

            {/* Booking History Policy Warning */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-semibold block">Booking History Policy</span>
              <p className="text-amber-800 leading-relaxed">
                Events with existing booking history, including cancelled reservations, cannot be deleted and are retained permanently.
              </p>
            </div>

            {/* Server Error Alert Banner */}
            {deleteErrorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold block">Deletion Failed</span>
                  <p className="leading-relaxed">{deleteErrorMessage}</p>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-3 border-t border-surface-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCloseDeleteModal}
                disabled={deleteMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                disabled={deleteMutation.isPending}
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                className="w-full sm:w-auto"
              >
                {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/**
 * Organizer Event Card: Displays event details, capacity, booked seats, and occupancy progress.
 */
function OrganizerEventCard({
  event,
  onDelete,
}: {
  event: OrganizerEventItem;
  onDelete: (event: OrganizerEventItem) => void;
}) {
  const isPast = isPastEvent(event.dateTime);
  const occupancyPct =
    event.capacity > 0
      ? Math.min(100, Math.round((event.bookedSeats / event.capacity) * 100))
      : 0;

  return (
    <div className="rounded-2xl border border-surface-border bg-white shadow-card p-5 sm:p-6 space-y-4 hover:border-surface-border/80 transition-all flex flex-col justify-between">
      <div className="space-y-3">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="outline" size="sm">
              {formatCategoryLabel(event.category)}
            </Badge>
            {isPast ? (
              <Badge variant="neutral" size="sm">
                Past Event
              </Badge>
            ) : (
              <Badge variant="success" size="sm">
                Upcoming
              </Badge>
            )}
          </div>
          <span className="text-sm font-bold text-charcoal-900">
            {formatPrice(event.price)}
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-charcoal-900 leading-snug line-clamp-1">
            {event.title}
          </h3>
          <p className="text-xs text-charcoal-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Date & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-charcoal-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-coral-500 shrink-0" />
            <span className="truncate">{formatEventDateTime(event.dateTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-coral-500 shrink-0" />
            <span className="truncate">
              {event.venue}, {event.city}
            </span>
          </div>
        </div>

        {/* Capacity & Occupancy Section */}
        <div className="bg-surface p-3.5 rounded-xl border border-surface-border space-y-2.5">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-charcoal-400">Capacity</span>
              <div className="text-sm font-extrabold text-charcoal-900">{event.capacity}</div>
            </div>
            <div className="space-y-0.5 border-x border-surface-border/60">
              <span className="text-[10px] uppercase font-bold text-charcoal-400">Booked</span>
              <div className="text-sm font-extrabold text-coral-600">{event.bookedSeats}</div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-charcoal-400">Available</span>
              <div className="text-sm font-extrabold text-emerald-600">{event.availableSeats}</div>
            </div>
          </div>

          {/* Occupancy Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-medium text-charcoal-600">
              <span>Occupancy</span>
              <span className="font-semibold text-charcoal-900">{occupancyPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-charcoal-100 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  occupancyPct >= 90
                    ? "bg-rose-500"
                    : occupancyPct >= 60
                    ? "bg-amber-500"
                    : "bg-coral-500"
                )}
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Booking History & Links */}
      <div className="flex items-center justify-between pt-2 border-t border-surface-border/60 text-xs">
        <div className="flex items-center gap-1.5 text-charcoal-500">
          <History className="h-3.5 w-3.5 text-charcoal-400" />
          {event.hasBookings ? (
            <span className="text-charcoal-600 font-medium">Has booking history</span>
          ) : (
            <span className="text-charcoal-400">No booking history</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/organizer/events/${event._id}/bookings`}
            className="text-xs font-semibold text-coral-600 hover:text-coral-700 transition-colors inline-flex items-center gap-1"
          >
            <Users className="h-3.5 w-3.5" />
            <span>View Bookings</span>
          </Link>
          <Link
            to={`/organizer/events/${event._id}/edit`}
            className="text-xs font-semibold text-charcoal-700 hover:text-charcoal-900 transition-colors"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => onDelete(event)}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:underline"
            aria-label={`Delete event ${event.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
          <Link
            to={`/events/${event._id}`}
            className="text-xs font-semibold text-charcoal-500 hover:text-charcoal-700 transition-colors"
          >
            Public View &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton Grid for Organizer Events
 */
function OrganizerEventGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-surface-border bg-white shadow-card p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-12 rounded-md" />
          </div>

          <div className="space-y-1.5">
            <Skeleton className="h-5 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
          </div>

          <Skeleton className="h-20 w-full rounded-xl" />

          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { CreateEventPage } from "./create-event-page";
export { EditEventPage } from "./edit-event-page";
export { EventBookingsPage } from "./event-bookings-page";
