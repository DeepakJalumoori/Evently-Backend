import { EventItem } from "./event.types";

export type BookingStatus = "booked" | "cancelled";

export interface BookingItem {
  _id: string;
  user: string;
  event: EventItem | null;
  seats: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  seats: number;
}

export interface CreateBookingResponse {
  success: boolean;
  message: string;
  booking: BookingItem;
}

export interface CancelBookingResponse {
  success: boolean;
  message: string;
  booking: BookingItem;
}

export interface MyBookingsResponse {
  success: boolean;
  bookings: BookingItem[];
}
