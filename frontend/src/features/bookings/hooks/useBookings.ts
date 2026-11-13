import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/services/booking.service";
import { eventKeys } from "@/features/events/hooks/useEvents";

export const bookingKeys = {
  all: ["bookings"] as const,
  mine: () => [...bookingKeys.all, "mine"] as const,
};

export function useMyBookingsQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: bookingKeys.mine(),
    queryFn: () => bookingService.getMyBookings(),
    enabled,
    staleTime: 1000 * 15, // 15 seconds
  });
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, seats }: { eventId: string; seats: number }) =>
      bookingService.createBooking(eventId, { seats }),
    retry: false, // Never automatically retry booking mutations on conflict (409) or errors
    onSuccess: (_, variables) => {
      // Invalidate attendee's booking history
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      // Invalidate the booked event detail to refresh available seats gauge
      queryClient.invalidateQueries({
        queryKey: eventKeys.detail(variables.eventId),
      });
      // Invalidate event discovery listings
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

export function useCancelBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId }: { bookingId: string; eventId?: string }) =>
      bookingService.cancelBooking(bookingId),
    retry: false, // Never automatically retry cancellation mutations
    onSuccess: (_, variables) => {
      // Invalidate attendee's booking history
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      // If eventId was known, invalidate event detail
      if (variables.eventId) {
        queryClient.invalidateQueries({
          queryKey: eventKeys.detail(variables.eventId),
        });
      }
      // Invalidate event discovery listings to reflect restored inventory
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}
