import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/auth-context";
import { useEventDetailQuery } from "@/features/events/hooks/useEvents";
import { useUpdateEventMutation } from "@/features/events/hooks/useOrganizerEvents";
import {
  createEditEventFormSchema,
  EditEventFormData,
  eventCategories,
} from "@/features/events/schemas/eventValidationSchemas";
import { UpdateEventPayload } from "@/types/event.types";
import { getApiErrorMessage } from "@/services/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEventDateTime, isPastEvent } from "@/utils/date-helpers";
import { toast } from "sonner";
import { cn } from "@/utils/cn";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Users,
  Sparkles,
  AlertCircle,
  FileText,
  Tag,
  IndianRupee,
  RefreshCw,
  Lock,
  ShieldAlert,
} from "lucide-react";

export function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = React.useState<string | null>(null);

  // Fetch current event details
  const {
    data: eventResponse,
    isLoading: isFetchingEvent,
    isError: isFetchError,
    error: fetchError,
    refetch,
  } = useEventDetailQuery(id);

  const event = eventResponse?.event;
  const updateMutation = useUpdateEventMutation();

  // Local user timezone string
  const userTimezone = React.useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "Local Timezone";
    }
  }, []);

  // Today in YYYY-MM-DD for date picker min attribute
  const todayString = React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Seats already booked calculation
  const bookedSeats = React.useMemo(() => {
    if (!event) return 0;
    return Math.max(0, event.capacity - event.availableSeats);
  }, [event]);

  // Safely resolve organizer ID & display name
  const organizerId = React.useMemo(() => {
    if (!event || !event.organizer) return null;
    const org: unknown = event.organizer;
    if (typeof org === "string") return org;
    if (typeof org === "object" && org !== null && "_id" in org) {
      const id = (org as { _id?: unknown })._id;
      return typeof id === "string" ? id : null;
    }
    return null;
  }, [event]);

  const organizerDisplayName = React.useMemo(() => {
    if (!event || !event.organizer) return "Unknown organizer";
    const org: unknown = event.organizer;
    if (typeof org === "object" && org !== null && "name" in org) {
      const name = (org as { name?: unknown }).name;
      if (typeof name === "string" && name.trim().length > 0) {
        return name.trim();
      }
    }
    return "Unknown organizer";
  }, [event]);

  // Ownership and timeline status
  const isOwner = Boolean(event && user && organizerId && organizerId === user.id);
  const isPast = Boolean(event && isPastEvent(event.dateTime));

  // Dynamic schema enforcing capacity >= bookedSeats
  const validationSchema = React.useMemo(
    () => createEditEventFormSchema(bookedSeats),
    [bookedSeats]
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditEventFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "tech",
      venue: "",
      city: "",
      date: "",
      time: "10:00",
      price: 0,
      capacity: 100,
    },
  });

  const enteredDescription = watch("description");

  // Prepopulate form when event data is loaded
  React.useEffect(() => {
    if (event) {
      const d = new Date(event.dateTime);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");

      reset({
        title: event.title,
        description: event.description,
        category: event.category,
        venue: event.venue,
        city: event.city,
        date: `${year}-${month}-${day}`,
        time: `${hours}:${minutes}`,
        price: event.price,
        capacity: event.capacity,
      });
    }
  }, [event, reset]);

  const onSubmit = async (data: EditEventFormData) => {
    if (!event) return;
    setApiError(null);

    if (isPast) {
      setApiError("Past events cannot be updated.");
      return;
    }

    // Convert local browser date and time into exact ISO 8601 UTC timestamp
    const [year, month, day] = data.date.split("-").map(Number);
    const [hours, minutes] = data.time.split(":").map(Number);
    const localDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

    if (localDateTime.getTime() <= Date.now()) {
      setApiError("The event date and time must be in the future.");
      return;
    }

    // Double check capacity lower bound
    if (Number(data.capacity) < bookedSeats) {
      setApiError(`Capacity cannot be lower than the ${bookedSeats} seats already booked.`);
      return;
    }

    const payload: UpdateEventPayload = {
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      venue: data.venue.trim(),
      city: data.city.trim(),
      dateTime: localDateTime.toISOString(),
      price: Number(data.price),
      capacity: Number(data.capacity),
    };

    try {
      const response = await updateMutation.mutateAsync({
        id: event._id,
        payload,
      });
      toast.success(response.message || "Event updated successfully!");
      navigate("/organizer", { replace: true });
    } catch (err: unknown) {
      const message = getApiErrorMessage(err);
      setApiError(message);
      toast.error(message);
    }
  };

  const isPending = updateMutation.isPending || isSubmitting;

  // 1. Loading State
  if (isFetchingEvent) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="space-y-4">
          <Skeleton className="h-4 w-40" />
          <div className="border-b border-surface-border pb-6 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // 2. Error / Not Found State
  if (isFetchError || !event) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 text-center">
        <div className="p-8 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-4 max-w-lg mx-auto">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-charcoal-900">Event Not Found</h3>
            <p className="text-xs text-charcoal-600">
              {fetchError ? getApiErrorMessage(fetchError) : "The requested event could not be found."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
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

  // 3. Unauthorized State (Not the event organizer)
  if (!isOwner) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 text-center">
        <div className="p-8 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-4 max-w-lg mx-auto">
          <ShieldAlert className="h-10 w-10 text-amber-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-charcoal-900">Unauthorized Access</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              You are signed in as <span className="font-semibold">{user?.email}</span>, but this event was created by another host ({organizerDisplayName}). You can only edit events you host.
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* 1. Header Navigation & Breadcrumb */}
      <div className="space-y-4">
        <Link
          to="/organizer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-charcoal-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Organizer Dashboard</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="default" size="sm">Host Portal</Badge>
              <Badge variant="neutral" size="sm">Edit Event</Badge>
              {isPast ? (
                <Badge variant="warning" size="sm">Past Event</Badge>
              ) : (
                <Badge variant="success" size="sm">Active Event</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
              Edit Event: {event.title}
            </h1>
            <p className="text-sm text-charcoal-500 mt-1">
              Modify event information, schedule, and capacity limits.
            </p>
          </div>

          <Link to={`/events/${event._id}`}>
            <Button variant="outline" size="sm">
              View Public Page &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Past Event Guard Warning */}
      {isPast && (
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/70 flex items-start gap-3">
          <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-charcoal-900">Event is in the past</h4>
            <p className="text-xs text-charcoal-700 leading-relaxed">
              This event took place on {formatEventDateTime(event.dateTime)}. In accordance with platform policy, past events cannot be modified.
            </p>
          </div>
        </div>
      )}

      {/* 3. API Error Banner */}
      {apiError && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/70 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-charcoal-900">Event update failed</h4>
            <p className="text-xs text-charcoal-700 leading-relaxed">{apiError}</p>
          </div>
        </div>
      )}

      {/* 4. Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Event Information */}
        <div className="p-6 sm:p-8 rounded-2xl border border-surface-border bg-white shadow-subtle space-y-6">
          <div className="border-b border-surface-border pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-coral-50 flex items-center justify-center text-coral-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-charcoal-900">1. Event Information</h2>
                <p className="text-xs text-charcoal-500">Title, category, and overview</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-charcoal-400">* Required</span>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <Input
              label="Event Title *"
              placeholder="e.g. React & Node Architecture Summit"
              disabled={isPast || isPending}
              error={errors.title?.message}
              helperText="Give your event a clear, distinctive name (3-100 characters)"
              {...register("title")}
            />

            {/* Category Select */}
            <div className="space-y-1.5">
              <label
                htmlFor="event-category"
                className="text-xs font-semibold uppercase tracking-wider text-charcoal-700 select-none flex items-center gap-1.5"
              >
                <Tag className="h-3.5 w-3.5 text-coral-500" />
                <span>Category *</span>
              </label>
              <select
                id="event-category"
                disabled={isPast || isPending}
                {...register("category")}
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-white text-sm text-charcoal-900 shadow-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 disabled:bg-charcoal-50 disabled:cursor-not-allowed",
                  errors.category ? "border-red-500" : "border-surface-border"
                )}
              >
                {eventCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category ? (
                <p className="text-xs text-red-600 font-medium">{errors.category.message}</p>
              ) : (
                <p className="text-xs text-charcoal-500">
                  Select the primary subject area for attendee discovery.
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="event-description"
                  className="text-xs font-semibold uppercase tracking-wider text-charcoal-700 select-none"
                >
                  Event Description *
                </label>
                <span className="text-[11px] text-charcoal-400">
                  {enteredDescription?.length || 0} characters (min 10)
                </span>
              </div>
              <textarea
                id="event-description"
                rows={4}
                disabled={isPast || isPending}
                placeholder="Provide a comprehensive summary of the event agenda, topics covered, target audience, and what attendees should bring..."
                {...register("description")}
                className={cn(
                  "w-full p-3.5 rounded-xl border bg-white text-sm text-charcoal-900 placeholder:text-charcoal-400 shadow-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 resize-y min-h-[110px] disabled:bg-charcoal-50 disabled:cursor-not-allowed",
                  errors.description ? "border-red-500 focus:ring-red-500/20" : "border-surface-border"
                )}
              />
              {errors.description && (
                <p className="text-xs text-red-600 font-medium">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Location and Schedule */}
        <div className="p-6 sm:p-8 rounded-2xl border border-surface-border bg-white shadow-subtle space-y-6">
          <div className="border-b border-surface-border pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-coral-50 flex items-center justify-center text-coral-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-charcoal-900">2. Location & Schedule</h2>
                <p className="text-xs text-charcoal-500">Venue and event date & time</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-charcoal-400">* Required</span>
          </div>

          <div className="space-y-5">
            {/* Venue and City in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Venue Name *"
                placeholder="e.g. Convention Center, Hall A"
                disabled={isPast || isPending}
                error={errors.venue?.message}
                helperText="Physical auditorium, room, or building"
                leftIcon={<MapPin className="h-4 w-4" />}
                {...register("venue")}
              />

              <Input
                label="City *"
                placeholder="e.g. Visakhapatnam"
                disabled={isPast || isPending}
                error={errors.city?.message}
                helperText="City where the event is held"
                {...register("city")}
              />
            </div>

            {/* Date and Time in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Event Date *"
                min={todayString}
                disabled={isPast || isPending}
                error={errors.date?.message}
                helperText="Event date must be in the future"
                leftIcon={<Calendar className="h-4 w-4" />}
                {...register("date")}
              />

              <Input
                type="time"
                label="Event Time *"
                disabled={isPast || isPending}
                error={errors.time?.message}
                helperText={`Converted in your local timezone (${userTimezone})`}
                leftIcon={<Clock className="h-4 w-4" />}
                {...register("time")}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Ticketing and Capacity */}
        <div className="p-6 sm:p-8 rounded-2xl border border-surface-border bg-white shadow-subtle space-y-6">
          <div className="border-b border-surface-border pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-coral-50 flex items-center justify-center text-coral-600">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-charcoal-900">3. Ticketing & Capacity</h2>
                <p className="text-xs text-charcoal-500">Pricing and capacity limits</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-charcoal-400">* Required</span>
          </div>

          {/* Current Booking Status Gauge */}
          <div className="p-4 rounded-xl bg-surface border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-charcoal-900">Current Seat Inventory</span>
              <p className="text-xs text-charcoal-500">
                {bookedSeats} confirmed booking(s) &bull; {event.availableSeats} remaining available seat(s)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="neutral" size="sm">
                Booked: {bookedSeats}
              </Badge>
              <Badge variant="outline" size="sm">
                Available: {event.availableSeats}
              </Badge>
              <Badge variant="default" size="sm">
                Min Capacity: {bookedSeats}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <Input
              type="number"
              min="0"
              step="1"
              label="Ticket Price (INR) *"
              placeholder="0"
              disabled={isPast || isPending}
              error={errors.price?.message}
              helperText="Set to 0 for free events. Fractional prices not allowed."
              leftIcon={<IndianRupee className="h-4 w-4" />}
              {...register("price")}
            />

            {/* Capacity with Lower Bound Enforcement */}
            <Input
              type="number"
              min={Math.max(1, bookedSeats)}
              step="1"
              label="Total Capacity (Seats) *"
              placeholder={String(event.capacity)}
              disabled={isPast || isPending}
              error={errors.capacity?.message}
              helperText={`Minimum permitted: ${bookedSeats} (already booked seats)`}
              leftIcon={<Users className="h-4 w-4" />}
              {...register("capacity")}
            />
          </div>
        </div>

        {/* 5. Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <Link to="/organizer" className="w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isPending}
            disabled={isPending || isPast}
            leftIcon={<Sparkles className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            {isPast ? "Past Event Locked" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
