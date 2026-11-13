import { Link } from "react-router-dom";
import { EventItem } from "@/types/event.types";
import { formatEventDateTime, getDateBadge, isPastEvent } from "@/utils/date-helpers";
import { formatPrice, formatCategoryLabel } from "@/utils/formatters";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";

interface EventCardProps {
  event: EventItem;
}

export function EventCard({ event }: EventCardProps) {
  const dateBadge = getDateBadge(event.dateTime);
  const isPast = isPastEvent(event.dateTime);
  const isSoldOut = event.availableSeats <= 0;

  // Category palette styling for visual card banner
  const categoryStyles: Record<string, { bg: string; text: string }> = {
    tech: { bg: "bg-blue-50/80 border-blue-200/60", text: "text-blue-700" },
    music: { bg: "bg-purple-50/80 border-purple-200/60", text: "text-purple-700" },
    sports: { bg: "bg-emerald-50/80 border-emerald-200/60", text: "text-emerald-700" },
    workshop: { bg: "bg-amber-50/80 border-amber-200/60", text: "text-amber-800" },
    other: { bg: "bg-charcoal-50 border-charcoal-200/60", text: "text-charcoal-700" },
  };

  const style = categoryStyles[event.category] || categoryStyles.other;

  return (
    <Card className="flex flex-col hover:shadow-float hover:-translate-y-0.5 transition-all duration-200 group">
      {/* Top Banner Treatment: Geometric aperture & badges without fake photos */}
      <div className={`p-4 rounded-t-2xl border-b border-surface-border/60 ${style.bg} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          {/* Calendar Date Block */}
          <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-white shadow-subtle border border-surface-border text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-coral-600 leading-tight">
              {dateBadge.month}
            </span>
            <span className="text-base font-extrabold text-charcoal-900 leading-none">
              {dateBadge.day}
            </span>
          </div>

          <div className="flex flex-col">
            <span className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}>
              {formatCategoryLabel(event.category)}
            </span>
            <span className="text-[11px] text-charcoal-500 truncate max-w-[150px]">
              {event.city}
            </span>
          </div>
        </div>

        {/* Price Tag Pill */}
        <span className="text-xs font-bold text-coral-600 bg-white px-3 py-1 rounded-full shadow-subtle border border-coral-200/60">
          {formatPrice(event.price)}
        </span>
      </div>

      <CardHeader className="p-5 pb-2">
        <Link to={`/events/${event._id}`} className="group-hover:text-coral-600 transition-colors">
          <h3 className="text-lg font-bold text-charcoal-900 leading-snug line-clamp-2">
            {event.title}
          </h3>
        </Link>
        <p className="text-xs text-charcoal-500 line-clamp-2 mt-1 leading-relaxed">
          {event.description}
        </p>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-2.5 mt-auto">
        <div className="flex items-center gap-2 text-xs text-charcoal-600">
          <Calendar className="h-3.5 w-3.5 text-coral-500 shrink-0" />
          <span className="truncate">{formatEventDateTime(event.dateTime)}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-charcoal-600">
          <MapPin className="h-3.5 w-3.5 text-coral-500 shrink-0" />
          <span className="truncate">{event.venue}, {event.city}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-charcoal-500">
          <Users className="h-3.5 w-3.5 text-charcoal-400 shrink-0" />
          <span className="truncate">Host: {event.organizer?.name || "Organizer"}</span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-3 border-t border-surface-border/60 justify-between items-center mt-2">
        {/* Availability Status */}
        {isPast ? (
          <Badge variant="neutral" size="sm">Past Event</Badge>
        ) : isSoldOut ? (
          <Badge variant="outline" size="sm" className="text-charcoal-400">Sold Out</Badge>
        ) : event.availableSeats <= 5 ? (
          <Badge variant="warning" size="sm">Only {event.availableSeats} seats left</Badge>
        ) : (
          <Badge variant="success" size="sm">{event.availableSeats} seats open</Badge>
        )}

        <Link to={`/events/${event._id}`}>
          <Button
            variant="outline"
            size="sm"
            className="group-hover:bg-coral-500 group-hover:text-white group-hover:border-coral-500 transition-colors text-xs"
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
          >
            Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
