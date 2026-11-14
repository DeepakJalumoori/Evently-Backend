import { Link } from "react-router-dom";
import { BookingItem } from "@/types/booking.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatCategoryLabel } from "@/utils/formatters";
import {
  formatEventDate,
  formatEventTime,
  isPastEvent,
} from "@/utils/date-helpers";
import {
  Calendar,
  MapPin,
  Ticket,
  Clock,
  ArrowRight,
  XCircle,
  CheckCircle2,
} from "lucide-react";

interface BookingCardProps {
  booking: BookingItem;
  onCancelClick: (booking: BookingItem) => void;
}

export function BookingCard({ booking, onCancelClick }: BookingCardProps) {
  const event = booking.event;
  const isBooked = booking.status === "booked";
  const isEventPast = event ? isPastEvent(event.dateTime) : false;

  return (
    <Card className="border-surface-border overflow-hidden hover:shadow-subtle transition-shadow">
      {/* Top Banner / Status Strip */}
      <div
        className={`px-5 py-2.5 flex items-center justify-between text-xs border-b ${
          isBooked
            ? "bg-emerald-50/70 border-emerald-100 text-emerald-900"
            : "bg-surface-subtle border-surface-border text-charcoal-500"
        }`}
      >
        <div className="flex items-center gap-2">
          {isBooked ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirmed Reservation
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-semibold text-charcoal-500">
              <XCircle className="h-3.5 w-3.5" />
              Cancelled
            </span>
          )}
        </div>

        <span className="text-[11px] text-charcoal-500">
          Booked {formatEventDate(booking.createdAt)}
        </span>
      </div>

      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Main Event Information */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {event?.category && (
                <Badge variant="default" size="sm">
                  {formatCategoryLabel(event.category)}
                </Badge>
              )}
              {isEventPast && (
                <Badge variant="neutral" size="sm">
                  Event Ended
                </Badge>
              )}
            </div>

            <h3 className="text-lg font-bold text-charcoal-900 leading-snug">
              {event ? (
                <Link
                  to={`/events/${event._id}`}
                  className="hover:text-coral-600 transition-colors"
                >
                  {event.title}
                </Link>
              ) : (
                "Event Details Unavailable"
              )}
            </h3>

            {event && (
              <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-600 pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-coral-500" />
                  {formatEventDate(event.dateTime)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-coral-500" />
                  {formatEventTime(event.dateTime)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-coral-500" />
                  {event.venue}, {event.city}
                </span>
              </div>
            )}
          </div>

          {/* Price & Seats Summary Tag */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 p-3 rounded-xl bg-surface-subtle border border-surface-border/60 shrink-0">
            <span className="text-xs text-charcoal-500 font-medium flex items-center gap-1">
              <Ticket className="h-3 w-3 text-coral-500" />
              {booking.seats} {booking.seats === 1 ? "seat" : "seats"}
            </span>
            <span className="text-base font-extrabold text-charcoal-900">
              {formatPrice(booking.totalAmount)}
            </span>
          </div>
        </div>

        {/* Card Footer / Actions */}
        <div className="pt-4 border-t border-surface-border flex flex-wrap items-center justify-between gap-3">
          {event ? (
            <Link
              to={`/events/${event._id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-coral-600 hover:text-coral-700 transition-colors"
            >
              <span>View event details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <span className="text-xs text-charcoal-400">Event removed</span>
          )}

          <div className="flex items-center gap-2">
            {isBooked && !isEventPast && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                onClick={() => onCancelClick(booking)}
              >
                Cancel Reservation
              </Button>
            )}

            {isBooked && isEventPast && (
              <span className="text-xs text-charcoal-400 font-medium">
                Cancellation closed (Event past)
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
