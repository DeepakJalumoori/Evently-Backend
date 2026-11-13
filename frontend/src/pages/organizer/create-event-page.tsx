import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/auth-context";
import { useCreateEventMutation } from "@/features/events/hooks/useOrganizerEvents";
import {
  createEventFormSchema,
  CreateEventFormData,
  eventCategories,
} from "@/features/events/schemas/eventValidationSchemas";
import { CreateEventPayload } from "@/types/event.types";
import { getApiErrorMessage } from "@/services/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

export function CreateEventPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = React.useState<string | null>(null);

  const createMutation = useCreateEventMutation();

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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventFormSchema),
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

  const onSubmit = async (data: CreateEventFormData) => {
    setApiError(null);

    // Convert local browser date and time into exact ISO 8601 UTC timestamp
    const [year, month, day] = data.date.split("-").map(Number);
    const [hours, minutes] = data.time.split(":").map(Number);
    const localDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

    if (localDateTime.getTime() <= Date.now()) {
      setApiError("The event date and time must be in the future.");
      return;
    }

    const payload: CreateEventPayload = {
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
      const response = await createMutation.mutateAsync(payload);
      toast.success(response.message || `Event "${response.event.title}" published successfully!`);
      // Navigate back to organizer dashboard where the newly created event will be listed
      navigate("/organizer", { replace: true });
    } catch (err: unknown) {
      const message = getApiErrorMessage(err);
      setApiError(message);
      toast.error(message);
    }
  };

  const isPending = createMutation.isPending || isSubmitting;

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
              <Badge variant="neutral" size="sm">Create Event</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
              Create New Event
            </h1>
            <p className="text-sm text-charcoal-500 mt-1">
              Publish an event as <span className="font-semibold text-charcoal-700">{user?.name}</span> and open seat reservations.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Error Banner */}
      {apiError && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/70 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-charcoal-900">Event creation failed</h4>
            <p className="text-xs text-charcoal-700 leading-relaxed">{apiError}</p>
          </div>
        </div>
      )}

      {/* 3. Event Creation Form */}
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
                {...register("category")}
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-white text-sm text-charcoal-900 shadow-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500",
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
                placeholder="Provide a comprehensive summary of the event agenda, topics covered, target audience, and what attendees should bring..."
                {...register("description")}
                className={cn(
                  "w-full p-3.5 rounded-xl border bg-white text-sm text-charcoal-900 placeholder:text-charcoal-400 shadow-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 resize-y min-h-[110px]",
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
                error={errors.venue?.message}
                helperText="Physical auditorium, room, or building"
                leftIcon={<MapPin className="h-4 w-4" />}
                {...register("venue")}
              />

              <Input
                label="City *"
                placeholder="e.g. Visakhapatnam"
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
                error={errors.date?.message}
                helperText="Event date must be in the future"
                leftIcon={<Calendar className="h-4 w-4" />}
                {...register("date")}
              />

              <Input
                type="time"
                label="Event Time *"
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
                <p className="text-xs text-charcoal-500">Pricing and maximum attendance</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-charcoal-400">* Required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <Input
              type="number"
              min="0"
              step="1"
              label="Ticket Price (INR) *"
              placeholder="0"
              error={errors.price?.message}
              helperText="Set to 0 for free events. Fractional prices not allowed."
              leftIcon={<IndianRupee className="h-4 w-4" />}
              {...register("price")}
            />

            {/* Capacity */}
            <Input
              type="number"
              min="1"
              step="1"
              label="Total Capacity (Seats) *"
              placeholder="100"
              error={errors.capacity?.message}
              helperText="Initial available seats will match capacity"
              leftIcon={<Users className="h-4 w-4" />}
              {...register("capacity")}
            />
          </div>
        </div>

        {/* 4. Form Submission Actions */}
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
            disabled={isPending}
            leftIcon={<Sparkles className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Publish Event
          </Button>
        </div>
      </form>
    </div>
  );
}
