import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { eventService } from "@/services/event.service";
import { EventsQueryParams } from "@/types/event.types";

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (params: EventsQueryParams) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

export function useEventsQuery(params: EventsQueryParams = {}) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => eventService.getEvents(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useEventDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: eventKeys.detail(id || ""),
    queryFn: () => eventService.getEventById(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
    retry: (failureCount, error: any) => {
      // Never retry 400 (invalid ID) or 404 (not found)
      const status = error?.response?.status;
      if (status === 400 || status === 404) return false;
      return failureCount < 2;
    },
  });
}
