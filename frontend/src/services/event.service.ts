import { apiClient } from "./api-client";
import {
  EventsQueryParams,
  PaginatedEventsResponse,
  EventDetailResponse,
  OrganizerEventsQueryParams,
  OrganizerEventsResponse,
  CreateEventPayload,
  CreateEventResponse,
  UpdateEventPayload,
  UpdateEventResponse,
  DeleteEventResponse,
  EventBookingsQueryParams,
  EventBookingsResponse,
} from "@/types/event.types";

export const eventService = {
  /**
   * Fetches paginated, filtered, sorted events from GET /api/events
   */
  async getEvents(params: EventsQueryParams = {}): Promise<PaginatedEventsResponse> {
    // Strip empty string, null or undefined values
    const cleanParams: Record<string, string | number> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanParams[key] = value;
      }
    });

    const response = await apiClient.get<PaginatedEventsResponse>("/api/events", {
      params: cleanParams,
    });
    return response.data;
  },

  /**
   * Fetches single event by ID from GET /api/events/:id
   */
  async getEventById(id: string): Promise<EventDetailResponse> {
    const response = await apiClient.get<EventDetailResponse>(`/api/events/${id}`);
    return response.data;
  },

  /**
   * Fetches paginated, filtered events owned by the authenticated organizer from GET /api/events/mine
   */
  async getMyEvents(
    params: OrganizerEventsQueryParams = {}
  ): Promise<OrganizerEventsResponse> {
    const cleanParams: Record<string, string | number> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanParams[key] = value;
      }
    });

    const response = await apiClient.get<OrganizerEventsResponse>("/api/events/mine", {
      params: cleanParams,
    });
    return response.data;
  },

  /**
   * Publishes a new event: POST /api/events
   */
  async createEvent(payload: CreateEventPayload): Promise<CreateEventResponse> {
    const response = await apiClient.post<CreateEventResponse>("/api/events", payload);
    return response.data;
  },

  /**
   * Updates an existing event: PATCH /api/events/:id
   */
  async updateEvent(
    id: string,
    payload: UpdateEventPayload
  ): Promise<UpdateEventResponse> {
    const response = await apiClient.patch<UpdateEventResponse>(
      `/api/events/${id}`,
      payload
    );
    return response.data;
  },

  /**
   * Deletes an event: DELETE /api/events/:id
   */
  async deleteEvent(id: string): Promise<DeleteEventResponse> {
    const response = await apiClient.delete<DeleteEventResponse>(`/api/events/${id}`);
    return response.data;
  },

  /**
   * Fetches booking records and summary statistics for an organizer's event:
   * GET /api/events/:id/bookings
   */
  async getEventBookings(
    eventId: string,
    params: EventBookingsQueryParams = {}
  ): Promise<EventBookingsResponse> {
    const cleanParams: Record<string, string | number> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanParams[key] = value;
      }
    });

    const response = await apiClient.get<EventBookingsResponse>(
      `/api/events/${eventId}/bookings`,
      { params: cleanParams }
    );
    return response.data;
  },
};
