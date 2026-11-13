import { apiClient } from "./api-client";
import {
  CreateBookingPayload,
  CreateBookingResponse,
  CancelBookingResponse,
  MyBookingsResponse,
} from "@/types/booking.types";

export const bookingService = {
  /**
   * Reserve seats for an event: POST /api/booking/:eventId
   * Payload: { "seats": number } (1-5)
   */
  async createBooking(
    eventId: string,
    payload: CreateBookingPayload
  ): Promise<CreateBookingResponse> {
    const response = await apiClient.post<CreateBookingResponse>(
      `/api/booking/${eventId}`,
      payload
    );
    return response.data;
  },

  /**
   * Fetch all bookings for authenticated attendee: GET /api/booking
   */
  async getMyBookings(): Promise<MyBookingsResponse> {
    const response = await apiClient.get<MyBookingsResponse>("/api/booking");
    return response.data;
  },

  /**
   * Cancel an active booking and restore seats: PATCH /api/booking/:bookingId/cancel
   */
  async cancelBooking(bookingId: string): Promise<CancelBookingResponse> {
    const response = await apiClient.patch<CancelBookingResponse>(
      `/api/booking/${bookingId}/cancel`
    );
    return response.data;
  },
};
