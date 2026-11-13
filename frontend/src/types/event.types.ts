export type EventCategory = "music" | "tech" | "sports" | "workshop" | "other";

export type EventSortField =
  | "dateTime"
  | "-dateTime"
  | "price"
  | "-price"
  | "title"
  | "-title"
  | "createdAt"
  | "-createdAt";

export interface EventOrganizer {
  _id: string;
  name: string;
}

export interface EventItem {
  _id: string;
  title: string;
  description: string;
  category: EventCategory;
  venue: string;
  city: string;
  dateTime: string;
  price: number;
  capacity: number;
  availableSeats: number;
  organizer: EventOrganizer;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventsQueryParams {
  city?: string;
  category?: EventCategory;
  from?: string;
  to?: string;
  q?: string;
  sort?: EventSortField;
  page?: number;
  limit?: number;
}

export interface PaginatedEventsResponse {
  success: boolean;
  totalResults: number;
  totalPages: number;
  currentPage: number;
  data: EventItem[];
}

export interface EventDetailResponse {
  success: boolean;
  event: EventItem;
}

export type OrganizerEventStatus = "all" | "upcoming" | "past";

export type OrganizerEventSortField =
  | "dateTime"
  | "-dateTime"
  | "createdAt"
  | "-createdAt"
  | "title"
  | "-title";

export interface OrganizerEventsQueryParams {
  page?: number;
  limit?: number;
  status?: OrganizerEventStatus;
  sort?: OrganizerEventSortField;
}

export interface OrganizerEventItem {
  _id: string;
  title: string;
  description: string;
  category: EventCategory;
  venue: string;
  city: string;
  dateTime: string;
  price: number;
  capacity: number;
  availableSeats: number;
  bookedSeats: number;
  hasBookings: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizerEventsResponse {
  success: boolean;
  totalResults: number;
  totalPages: number;
  currentPage: number;
  data: OrganizerEventItem[];
}

export interface CreateEventPayload {
  title: string;
  description: string;
  category: EventCategory;
  venue: string;
  city: string;
  dateTime: string;
  price: number;
  capacity: number;
}

export interface CreateEventResponse {
  success: boolean;
  message: string;
  event: EventItem;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

export interface UpdateEventResponse {
  success: boolean;
  message: string;
  event: EventItem;
}

export interface DeleteEventResponse {
  success: boolean;
  message: string;
}

export type EventBookingFilterStatus = "all" | "booked" | "cancelled";
export type EventBookingStatus = "booked" | "cancelled";

export interface EventBookingAttendee {
  _id: string;
  name: string;
}

export interface EventBookingItem {
  _id: string;
  user: EventBookingAttendee | null;
  seats: number;
  totalAmount: number;
  status: EventBookingStatus;
  createdAt: string;
}

export interface EventBookingSummary {
  totalBookings: number;
  activeBookings: number;
  cancelledBookings: number;
  bookedSeats: number;
  occupancyRate: number;
  totalBookingValue: number;
}

export interface EventBookingPagination {
  totalResults: number;
  totalPages: number;
  currentPage: number;
}

export interface EventBookingsResponse {
  success: boolean;
  event: {
    _id: string;
    title: string;
    dateTime: string;
    capacity: number;
    availableSeats: number;
    price: number;
  };
  summary: EventBookingSummary;
  pagination: EventBookingPagination;
  bookings: EventBookingItem[];
}

export interface EventBookingsQueryParams {
  status?: EventBookingFilterStatus;
  page?: number;
  limit?: number;
}
