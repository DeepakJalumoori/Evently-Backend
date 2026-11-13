import * as React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEventDetailQuery } from "@/features/events/hooks/useEvents";
import { formatEventDate, formatEventTime, getDateBadge, isPastEvent } from "@/utils/date-helpers";
import { formatPrice, formatCategoryLabel } from "@/utils/formatters";
import { getApiErrorMessage } from "@/services/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingModal } from "@/features/bookings/components/booking-modal";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Ticket,
  AlertCircle,
  Compass,
} from "lucide-react";

// Valid MongoDB ObjectId is 24 hex characters
const isValidObjectId = (id?: string) => /^[0-9a-fA-F]{24}$/.test(id || "");

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false);

  const isValidId = isValidObjectId(id);
  const { data, isLoading, isError, error, refetch } = useEventDetailQuery(isValidId ? id : undefined);

  // 1. Invalid Event ID State (Early validation)
  if (!isValidId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-subtle">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight">
          Invalid Event Identifier
        </h1>
        <p className="text-sm text-charcoal-600 max-w-md mx-auto">
          The requested event ID is not a valid 24-character record identifier. Please browse the catalog for verified events.
        </p>
        <div className="pt-2">
          <Link to="/events">
            <Button variant="primary" leftIcon={<Compass className="h-4 w-4" />}>
              Explore Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Loading State Skeleton
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // 3. Error or Not Found State
  if (isError || !data?.event) {
    const errorMsg = getApiErrorMessage(error);
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200 shadow-subtle">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight">
          Event Not Found
        </h1>
        <p className="text-sm text-charcoal-600 max-w-md mx-auto">
          {errorMsg || "This event may have been removed or does not exist."}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => navigate(-1)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Go Back
          </Button>
          <Button variant="primary" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { event } = data;
  const isPast = isPastEvent(event.dateTime);
  const isSoldOut = event.availableSeats <= 0;
  const dateBadge = getDateBadge(event.dateTime);
  const percentAvailable = Math.round((event.availableSeats / event.capacity) * 100);

  return (
    <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back to Events Breadcrumb */}
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-charcoal-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to all events</span>
      </Link>

      {/* Hero Header */}
      <div className="space-y-4 border-b border-surface-border pb-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="default" size="md">
            {formatCategoryLabel(event.category)}
          </Badge>
          <Badge variant="neutral" size="md">
            {event.city}
          </Badge>
          {isPast ? (
            <Badge variant="neutral" size="md">Past Event</Badge>
          ) : isSoldOut ? (
            <Badge variant="outline" size="md" className="text-red-600 border-red-200 bg-red-50">
              Sold Out
            </Badge>
          ) : (
            <Badge variant="success" size="md">
              {event.availableSeats} of {event.capacity} seats remaining
            </Badge>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-charcoal-900 leading-tight">
          {event.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-charcoal-600 pt-1">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-coral-500" />
            <span>Hosted by <strong className="text-charcoal-900">{event.organizer?.name || "Verified Host"}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-coral-500" />
            <span>{event.venue}, {event.city}</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Description & Event Schedule Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* About this Event */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-charcoal-700 whitespace-pre-line leading-relaxed">
                {event.description}
              </p>
            </CardContent>
          </Card>

          {/* Date, Time & Venue Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Date & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface-subtle border border-surface-border/60">
                <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-white shadow-subtle border border-surface-border text-center shrink-0">
                  <span className="text-[10px] font-bold uppercase text-coral-600">
                    {dateBadge.month}
                  </span>
                  <span className="text-base font-extrabold text-charcoal-900 leading-none">
                    {dateBadge.day}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-charcoal-900">
                    {formatEventDate(event.dateTime)}
                  </h4>
                  <p className="text-xs text-charcoal-500 flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>{formatEventTime(event.dateTime)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface-subtle border border-surface-border/60">
                <div className="h-12 w-12 rounded-lg bg-white shadow-subtle border border-surface-border flex items-center justify-center text-coral-500 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-charcoal-900">
                    {event.venue}
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    {event.city} • In-person gathering
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sticky Ticket & Reservation Box */}
        <div className="lg:sticky lg:top-24 space-y-4">
          <Card className="border-surface-border shadow-float">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                  Admission
                </span>
                <Badge variant={event.price === 0 ? "default" : "neutral"} size="sm">
                  {event.price === 0 ? "Complimentary" : "Ticketed"}
                </Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-charcoal-900">
                  {formatPrice(event.price)}
                </span>
                {event.price > 0 && (
                  <span className="text-xs text-charcoal-500">/ person</span>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-5">
              {/* Seat Inventory Gauge */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-charcoal-600 font-medium">
                  <span>Available Capacity</span>
                  <span className={event.availableSeats <= 5 ? "text-amber-600 font-bold" : "text-emerald-600 font-bold"}>
                    {event.availableSeats} of {event.capacity} left
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-charcoal-100 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isSoldOut ? "bg-red-500" : event.availableSeats <= 5 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${percentAvailable}%` }}
                  />
                </div>
              </div>

              {/* Booking CTA Button (Belongs to Phase 4) */}
              <Button
                variant={isPast || isSoldOut ? "secondary" : "primary"}
                size="lg"
                className="w-full"
                disabled={isPast || isSoldOut}
                leftIcon={<Ticket className="h-4 w-4" />}
                onClick={() => setIsBookingModalOpen(true)}
              >
                {isPast ? "Event Has Ended" : isSoldOut ? "Event Sold Out" : "Reserve Tickets"}
              </Button>

              <p className="text-[11px] text-charcoal-500 text-center leading-normal">
                Reservations are seat holds confirmed instantly upon booking.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Phase 4 Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        event={event}
      />
    </div>
  );
}
