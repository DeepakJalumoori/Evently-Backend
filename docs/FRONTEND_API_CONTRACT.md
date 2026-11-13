# Evently API contract (MVP)

Base URL: `http://localhost:3000` (configure the deployed URL separately).
JSON requests use `Content-Type: application/json`. Protected routes require
`Authorization: Bearer <JWT>`.

## Roles

- `attendee`: browse events, book seats, view and cancel their own bookings.
- `organizer`: create, update and delete their own events.

## Authentication

### POST `/api/auth/register`

Request:
```json
{ "name": "Deepak", "email": "deepak@example.com", "password": "password123", "role": "attendee" }
```

Success: `201` with `{ success, message, token, user: { id, name, email, role } }`.
Roles are exactly `organizer` and `attendee`. Validation errors return `400`;
duplicate email returns `409`.

### POST `/api/auth/login`

Request: `{ "email": "deepak@example.com", "password": "password123" }`.
Success: `200` with `{ success, message, token, user }`. Invalid credentials return `401`.

## Events

### GET `/api/events` (public)

Optional query parameters: `city`, `category` (`music|tech|sports|workshop|other`),
`from`, `to` (date/time strings), `q` (title search), `sort`
(`dateTime`, `-dateTime`, `price`, `-price`, `title`, `-title`,
`createdAt`, `-createdAt`), `page` (default 1), `limit` (default 10, max 100).

Success: `200` with `{ success, totalResults, totalPages, currentPage, data: Event[] }`.
Each list item includes event details, available seats and populated organizer name.

### GET `/api/events/:id` (public)

Success: `200` with `{ success, event }`. Invalid ID returns `400`; missing event returns `404`.

### POST `/api/events` (organizer)

Request:
```json
{
  "title": "Tech Meetup",
  "description": "A community meetup for developers.",
  "category": "tech",
  "venue": "Convention Hall",
  "city": "Visakhapatnam",
  "dateTime": "2027-01-20T18:30:00.000Z",
  "price": 0,
  "capacity": 100
}
```

Success: `201` with `{ success, message, event }`. Date must be a future ISO datetime
with timezone; capacity must be a positive integer; price must be non-negative.

### PATCH `/api/events/:id` (owning organizer)

Accepts any subset of the create-event fields. Supplied date must be in the future.
Capacity cannot be reduced below seats already booked; available seats are adjusted
when capacity changes. Success: `200` with `{ success, message, event }`.

### DELETE `/api/events/:id` (owning organizer)

Success: `200`. Events with any booking history are retained and return `409`.

### GET `/api/events/mine` (organizer)

Requires Bearer token with `organizer` role. Scoped strictly to `req.user._id`; organizer IDs are never accepted from query parameters.

Query parameters:
- `page`: integer >= 1 (default `1`)
- `limit`: integer 1–100 (default `10`)
- `status`: `all` | `upcoming` | `past` (default `all`)
  - `upcoming`: event `dateTime > current time`
  - `past`: event `dateTime <= current time`
  - `all`: no date filter
- `sort`: `dateTime` | `-dateTime` | `createdAt` | `-createdAt` | `title` | `-title` (default `-createdAt`)

Computed fields:
- `bookedSeats`: `capacity - availableSeats`
- `hasBookings`: boolean indicating whether any booking history exists for the event (including cancelled bookings; aligns with the deletion restriction rule).
- Organizer credentials, tokens, and unrelated fields are omitted.

Success: `200`
```json
{
  "success": true,
  "totalResults": 2,
  "totalPages": 1,
  "currentPage": 1,
  "data": [
    {
      "_id": "664ba1c098e4f1a23456789a",
      "title": "Example Event",
      "description": "Event description",
      "category": "tech",
      "venue": "Example Venue",
      "city": "Visakhapatnam",
      "dateTime": "2027-04-15T10:00:00.000Z",
      "price": 499,
      "capacity": 100,
      "availableSeats": 68,
      "bookedSeats": 32,
      "hasBookings": true,
      "createdAt": "2026-11-10T14:30:00.000Z",
      "updatedAt": "2026-11-12T09:15:00.000Z"
    }
  ]
}
```

Error responses:
- `400`: Invalid query parameter values (e.g., negative page, invalid status, unwhitelisted sort).
- `401`: Missing or invalid Bearer token.
- `403`: Access denied (user is not an organizer).

### GET `/api/events/:id/bookings` (owning organizer)

Requires Bearer token with `organizer` role. The authenticated organizer must own the event (`event.organizer === req.user._id`). Never accessible to attendees or other organizers.

Query parameters:
- `status`: `all` | `booked` | `cancelled` (default `all`)
- `page`: integer >= 1 (default `1`)
- `limit`: integer 1–100 (default `20`)

Summary calculation definitions (calculated across entire event history independently of pagination and status filter):
- `totalBookings`: count of all booking documents (both booked and cancelled).
- `activeBookings`: count of bookings with status `booked`.
- `cancelledBookings`: count of bookings with status `cancelled`.
- `bookedSeats`: sum of seats from active bookings (`status === "booked"`).
- `occupancyRate`: `(bookedSeats / capacity) * 100`, rounded to two decimal places (returns `0` if capacity is `0`).
- `totalBookingValue`: sum of `totalAmount` from active bookings (`status === "booked"`).
  **Important note on payment/revenue:** Evently does not have an integrated payment gateway; `totalBookingValue` is an informational gross booking calculation and does not represent actual collected revenue.

Attendee privacy:
- Only attendee `_id` and `name` are returned in `user`. Email addresses, passwords, tokens, and other private fields are strictly omitted.

Success: `200`
```json
{
  "success": true,
  "event": {
    "_id": "664ba1c098e4f1a23456789a",
    "title": "Example Event",
    "dateTime": "2027-04-15T10:00:00.000Z",
    "capacity": 100,
    "availableSeats": 68,
    "price": 499
  },
  "summary": {
    "totalBookings": 14,
    "activeBookings": 12,
    "cancelledBookings": 2,
    "bookedSeats": 32,
    "occupancyRate": 32,
    "totalBookingValue": 15968
  },
  "pagination": {
    "totalResults": 14,
    "totalPages": 1,
    "currentPage": 1
  },
  "bookings": [
    {
      "_id": "664bc8e098e4f1a2345678bc",
      "user": {
        "_id": "664b9a1098e4f1a234567811",
        "name": "Jane Doe"
      },
      "seats": 2,
      "totalAmount": 998,
      "status": "booked",
      "createdAt": "2026-11-12T16:20:00.000Z"
    }
  ]
}
```

Error responses:
- `400`: Invalid event ID or invalid query parameters.
- `401`: Missing or invalid Bearer token.
- `403`: Forbidden (user does not own this event or is not an organizer).
- `404`: Event not found.

## Bookings (attendee)

### POST `/api/booking/:eventId`

Request: `{ "seats": 2 }` (integer 1–5).
Success: `201` with `{ success, message, booking }`. A user can have only one active
booking per event. A cancelled booking may be booked again, creating a new booking
record. Booking is rejected if the event has started or lacks seats.

### GET `/api/booking`

Success: `200` with `{ success, bookings: Booking[] }`. Empty history is an empty array,
not a 404. Results are newest first and include populated event data.

### PATCH `/api/booking/:bookingId/cancel`

Cancels the authenticated attendee's active booking and restores its seats. Cancellation
is allowed at any time strictly before the event start; at or after the start it is rejected.
Success: `200` with `{ success, message, booking }`. The cancellation status and seat
restoration are committed in one database transaction.

## MVP payment behavior

No online payment gateway is part of this MVP. Booking records are confirmation/seat
reservations only; the API's `totalAmount` is informational and does not indicate a payment.

## Deployment / migration notes

- Set `CLIENT_URL` to the frontend origin (multiple origins may be comma-separated).
  Local Vite default: `http://localhost:5173`.
- Set `JWT_SECRET`, `MONGO_URL`, and `SERVER_URL` in the backend environment.
- MongoDB transactions require a replica set (including a single-node replica set locally).
- **Before deploying the partial unique booking index:** the existing index
  `user_1_event_1` is unique across all statuses. Drop that old index on the bookings
  collection before the new `unique_active_booking_per_user_event` index is created.
  Back up the database first and inspect existing duplicate active bookings. Do not run
  an automatic index sync in production without reviewing its index-drop effects.
