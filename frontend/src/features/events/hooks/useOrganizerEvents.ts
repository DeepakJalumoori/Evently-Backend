import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { eventService } from "@/services/event.service";
import { eventKeys } from "./useEvents";
import { OrganizerEventsQueryParams, CreateEventPayload, UpdateEventPayload, EventBookingsQueryParams } from "@/types/event.types";

export const organizerEventKeys = {
  all: ["organizer-events"] as const,
  lists: () => [...organizerEventKeys.all, "list"] as const,
  list: (params: OrganizerEventsQueryParams) =>
    [...organizerEventKeys.lists(), params] as const,
};

export function useOrganizerEventsQuery(
  params: OrganizerEventsQueryParams = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: organizerEventKeys.list(params),
    queryFn: () => eventService.getMyEvents(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
    retry: (failureCount, error: any) => {
      // Do not retry client validation or authorization failures
      const status = error?.response?.status;
      if (status === 400 || status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });
}

export const useOrganizerEvents = useOrganizerEventsQuery;

export function useCreateEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => eventService.createEvent(payload),
    retry: false,
    onSuccess: () => {
      // Invalidate organizer events list
      queryClient.invalidateQueries({ queryKey: organizerEventKeys.all });
      // Invalidate public event discovery listings
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useUpdateEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEventPayload }) =>
      eventService.updateEvent(id, payload),
    retry: false,
    onSuccess: (_, variables) => {
      // Invalidate organizer events list
      queryClient.invalidateQueries({ queryKey: organizerEventKeys.all });
      // Invalidate public event discovery listings
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      // Invalidate the updated event detail query
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
    },
  });
}

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventService.deleteEvent(id),
    retry: false,
    onSuccess: (_, id) => {
      // Invalidate organizer events list
      queryClient.invalidateQueries({ queryKey: organizerEventKeys.all });
      // Invalidate public event discovery listings
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      // Invalidate the deleted event detail query
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
    },
  });
}

export const eventBookingKeys = {
  all: ["event-bookings"] as const,
  event: (id: string) => [...eventBookingKeys.all, id] as const,
  list: (id: string, params: EventBookingsQueryParams) =>
    [...eventBookingKeys.event(id), params] as const,
};

export function useEventBookingsQuery(
  eventId: string | undefined,
  params: EventBookingsQueryParams = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: eventBookingKeys.list(eventId || "", params),
    queryFn: () => eventService.getEventBookings(eventId!, params),
    enabled: Boolean(eventId && enabled),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 400 || status === 401 || status === 403 || status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
