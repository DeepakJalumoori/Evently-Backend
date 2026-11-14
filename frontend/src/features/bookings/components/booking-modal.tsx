import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventItem } from "@/types/event.types";
import { BookingItem } from "@/types/booking.types";
import { useAuth } from "@/context/auth-context";
import { useCreateBookingMutation } from "@/features/bookings/hooks/useBookings";
import { formatPrice, formatCategoryLabel } from "@/utils/formatters";
import { formatEventDate, formatEventTime } from "@/utils/date-helpers";
import { getApiErrorMessage } from "@/services/api-client";
import {
  Ticket,
  Minus,
  Plus,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  LogIn,
  ShieldAlert,
} from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
}

export function BookingModal({ isOpen, onClose, event }: BookingModalProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [seats, setSeats] = React.useState<number>(1);
  const [successBooking, setSuccessBooking] = React.useState<BookingItem | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const createBookingMutation = useCreateBookingMutation();

  // Reset state whenever modal opens or closes
  React.useEffect(() => {
    if (isOpen) {
      setSeats(1);
      setSuccessBooking(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  const maxAllowed = Math.min(5, Math.max(1, event.availableSeats));
  const isSoldOut = event.availableSeats <= 0;
  const isAttendee = isAuthenticated && user?.role === "attendee";
  const isOrganizer = isAuthenticated && user?.role === "organizer";

  const handleDecrement = () => {
    setSeats((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setSeats((prev) => Math.min(maxAllowed, prev + 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAttendee) return;
    if (seats < 1 || seats > 5) return;
    if (seats > event.availableSeats) {
      setErrorMessage("Selected seats exceed currently available inventory.");
      return;
    }

    setErrorMessage(null);

    createBookingMutation.mutate(
      { eventId: event._id, seats },
      {
        onSuccess: (response) => {
          setSuccessBooking(response.booking);
        },
        onError: (err) => {
          const msg = getApiErrorMessage(err);
          setErrorMessage(msg);
        },
      }
    );
  };

  const totalCalculated = seats * event.price;

  return (
    <Modal
      isOpen={isOpen}
      onClose={createBookingMutation.isPending ? () => {} : onClose}
      title={
        successBooking
          ? "Reservation Confirmed!"
          : !isAuthenticated
          ? "Sign in to Reserve Tickets"
          : isOrganizer
          ? "Attendee Account Required"
          : "Reserve Tickets"
      }
      description={
        successBooking
          ? "Your seat reservation is confirmed and stored in your profile."
          : `Select your ticket quantity for ${event.title}`
      }
    >
      {/* 1. SUCCESS STATE */}
      {successBooking ? (
        <div className="space-y-6 py-2">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-900">
                Booking Confirmed
              </h3>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border space-y-3 text-xs">
            <div className="flex justify-between text-charcoal-700">
              <span className="text-charcoal-500">Event</span>
              <strong className="text-charcoal-900 text-right max-w-[200px] truncate">
                {event.title}
              </strong>
            </div>
            <div className="flex justify-between text-charcoal-700">
              <span className="text-charcoal-500">Date & Time</span>
              <span className="font-medium text-charcoal-800">
                {formatEventDate(event.dateTime)} • {formatEventTime(event.dateTime)}
              </span>
            </div>
            <div className="flex justify-between text-charcoal-700">
              <span className="text-charcoal-500">Reserved Seats</span>
              <span className="font-bold text-charcoal-900">
                {successBooking.seats} {successBooking.seats === 1 ? "seat" : "seats"}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-surface-border text-sm">
              <span className="font-semibold text-charcoal-900">Total Amount</span>
              <span className="font-bold text-coral-600">
                {formatPrice(successBooking.totalAmount)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full sm:w-auto"
              onClick={onClose}
            >
              Done
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              onClick={() => {
                onClose();
                navigate("/my-bookings");
              }}
            >
              View in My Bookings
            </Button>
          </div>
        </div>
      ) : !isAuthenticated ? (
        /* 2. UNAUTHENTICATED STATE */
        <div className="space-y-6 py-2">
          <div className="p-5 rounded-2xl bg-surface-subtle border border-surface-border text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-white text-coral-500 flex items-center justify-center mx-auto shadow-subtle border border-surface-border">
              <LogIn className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-charcoal-900">
                Account Required
              </h3>
              <p className="text-xs text-charcoal-600 max-w-sm mx-auto">
                You must be logged in as an attendee to reserve tickets. Please log in or create an account to proceed.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full sm:w-auto"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Link
              to={`/login?redirect=${encodeURIComponent(`/events/${event._id}`)}`}
              className="w-full sm:w-auto"
            >
              <Button
                type="button"
                variant="primary"
                size="md"
                className="w-full"
                leftIcon={<LogIn className="h-4 w-4" />}
              >
                Log In to Reserve
              </Button>
            </Link>
          </div>
        </div>
      ) : isOrganizer ? (
        /* 3. ORGANIZER RESTRICTION STATE */
        <div className="space-y-6 py-2">
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-900">
                Organizer Role Restriction
              </h3>
              <p className="text-xs text-amber-800 max-w-sm mx-auto leading-relaxed">
                You are currently signed in as an <strong>Organizer</strong>. In accordance with platform security rules, organizers manage events while attendee accounts reserve seats.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      ) : (
        /* 4. ACTIVE BOOKING FORM STATE */
        <form onSubmit={handleSubmit} className="space-y-6 py-1">
          {/* Event Brief Header */}
          <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="default" size="sm">
                {formatCategoryLabel(event.category)}
              </Badge>
              <span className="text-xs font-semibold text-charcoal-700">
                {formatPrice(event.price)} <span className="text-charcoal-500 font-normal">/ seat</span>
              </span>
            </div>
            <h4 className="text-sm font-bold text-charcoal-900 line-clamp-1">
              {event.title}
            </h4>
            <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-600 pt-0.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-coral-500" />
                {formatEventDate(event.dateTime)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-coral-500" />
                {event.city}
              </span>
            </div>
          </div>

          {/* Seat Counter Control */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-charcoal-800">
                Select Ticket Quantity
              </label>
              <span className="text-[11px] text-charcoal-500">
                {event.availableSeats} available (max 5)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-surface-border bg-white shadow-subtle">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-coral-500" />
                <span className="text-xs font-medium text-charcoal-700">
                  General Admission
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={seats <= 1 || createBookingMutation.isPending}
                  aria-label="Decrease seat count"
                  className="h-8 w-8 rounded-lg border border-surface-border bg-surface-subtle hover:bg-surface-border/60 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-charcoal-700 transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>

                <span className="w-6 text-center text-sm font-bold text-charcoal-900">
                  {seats}
                </span>

                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={seats >= maxAllowed || createBookingMutation.isPending}
                  aria-label="Increase seat count"
                  className="h-8 w-8 rounded-lg border border-surface-border bg-surface-subtle hover:bg-surface-border/60 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-charcoal-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-3.5 rounded-xl border border-dashed border-surface-border bg-surface-subtle/50 space-y-2 text-xs">
            <div className="flex justify-between text-charcoal-600">
              <span>Ticket Price ({seats} × {formatPrice(event.price)})</span>
              <span className="font-medium text-charcoal-800">
                {formatPrice(totalCalculated)}
              </span>
            </div>
            <div className="flex justify-between text-charcoal-600">
              <span>Booking Fee</span>
              <span className="font-medium text-emerald-600">₹0 (Free)</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-surface-border text-sm font-bold">
              <span className="text-charcoal-900">Total Due</span>
              <span className="text-coral-600">{formatPrice(totalCalculated)}</span>
            </div>
          </div>

          {/* Error Message Feedback */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full sm:w-auto"
              disabled={createBookingMutation.isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              disabled={createBookingMutation.isPending || isSoldOut}
              isLoading={createBookingMutation.isPending}
              leftIcon={<Ticket className="h-4 w-4" />}
            >
              {createBookingMutation.isPending
                ? "Reserving Seats..."
                : `Confirm Booking • ${formatPrice(totalCalculated)}`}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
