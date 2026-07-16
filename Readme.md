# Evently – Event Booking REST API

A RESTful backend API for an event booking platform built using **Node.js**, **Express.js**, and **MongoDB**.

Evently enables organizers to create and manage events while attendees can discover, search, filter, and book events securely. The project demonstrates authentication, authorization, pagination, validation, MongoDB indexing, race condition prevention, and transaction handling for a production-ready booking system.

---

# Features

## Authentication & Authorization

- User Registration
- User Login
- Password Hashing using bcrypt
- JWT Authentication
- Role-based Authorization (Organizer / Attendee)

---

## Event Management

- Create Event (Organizer Only)
- Update Own Event
- Delete Own Event
- Get All Events
- Get Event By ID

---

## Event Discovery

- Filter by City
- Filter by Category
- Filter by Date Range
- Search Events by Title
- Sort Events by Price or Date
- Pagination
- Pagination Metadata

---

## Booking System

- Book Events
- Multi-seat Booking (1–5 Seats)
- Cancel Booking
- View My Bookings
- Automatic Seat Management
- Total Booking Amount Calculation

---

## Database Features

- MongoDB Relationships using References
- Compound Indexes
- Text Indexes
- Atomic Seat Reservation
- MongoDB Transactions

---

## Validation

- Request Validation using Zod
- Field-level Validation Errors
- Consistent API Responses

---

## Security

- Password Hashing using bcrypt
- JWT Protected Routes
- Role-based Access Control
- Password Excluded from Responses

---

# Tech Stack

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Authentication

- JWT (jsonwebtoken)
- bcrypt

## Validation

- Zod

## Development Tools

- Nodemon
- dotenv
- Postman

---

# Project Structure

```
Evently/
│
├── src/
│
├── config/
│
├── controllers/
│   ├── authController.js
│   ├── eventController.js
│   └── bookingController.js
│
├── middlewares/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Event.js
│   └── Booking.js
│
├── routes/
│   ├── authRoutes.js
│   ├── eventRoutes.js
│   └── bookingRoutes.js
│
├── validations/
│   ├── authValidation.js
│   └── eventValidation.js
│
├── app.js
├── server.js
└── .env
```

---

# Installation

Clone the repository

```bash
git clone <repository-url>
```

Move into the project

```bash
cd Evently
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the development server

```bash
npm run dev
```

---

# API Endpoints

## Authentication

| Method | Endpoint             | Access |
| ------ | -------------------- | ------ |
| POST   | `/api/auth/register` | Public |
| POST   | `/api/auth/login`    | Public |

---

## Events

| Method | Endpoint          | Access            |
| ------ | ----------------- | ----------------- |
| POST   | `/api/events`     | Organizer         |
| GET    | `/api/events`     | Public            |
| GET    | `/api/events/:id` | Public            |
| PATCH  | `/api/events/:id` | Organizer (Owner) |
| DELETE | `/api/events/:id` | Organizer (Owner) |

---

## Bookings

| Method | Endpoint                         | Access   |
| ------ | -------------------------------- | -------- |
| POST   | `/api/booking/:eventId`          | Attendee |
| PATCH  | `/api/booking/:bookingId/cancel` | Attendee |
| GET    | `/api/booking`                   | Attendee |

---

# Event Schema

```javascript
{
  (title,
    description,
    category,
    venue,
    city,
    dateTime,
    price,
    capacity,
    availableSeats,
    organizer);
}
```

---

# Booking Schema

```javascript
{
  (user, event, seats, totalAmount, status, createdAt, updatedAt);
}
```

---

# Authentication

Protected routes require a valid JWT.

```
Authorization: Bearer <JWT_TOKEN>
```

---

# Sample Request

## Create Event

```json
{
  "title": "Node.js Workshop",
  "description": "Learn backend development using Node.js",
  "category": "tech",
  "venue": "KTPO Convention Centre",
  "city": "Bangalore",
  "dateTime": "2026-08-15T10:00:00.000Z",
  "price": 499,
  "capacity": 100
}
```

---

## Book Event

```json
{
  "seats": 3
}
```

---

# Sample Success Response

```json
{
  "success": true,
  "message": "Event booked successfully",
  "booking": {
    "_id": "...",
    "event": "...",
    "user": "...",
    "seats": 3,
    "totalAmount": 1497,
    "status": "booked"
  }
}
```

---

# Middleware

## Authentication Middleware

- Verifies JWT
- Finds the logged-in user
- Attaches the user to the request

```javascript
req.user;
```

---

## Role Middleware

Allows access only to specified roles.

Example

```javascript
roleMiddleware("organizer");
```

---

# Validation

Request payloads are validated using **Zod** before reaching business logic.

Validations include:

- Required Fields
- Minimum & Maximum Length
- Positive Numbers
- Enum Validation
- ISO Date-Time Validation

---

# Database Indexes

## Event Collection

| Index          | Purpose                              |
| -------------- | ------------------------------------ |
| `city`         | Optimizes city filtering             |
| `category`     | Optimizes category filtering         |
| `title (text)` | Enables efficient text search        |
| `organizer`    | Optimizes organizer-specific queries |

---

## Booking Collection

| Index                            | Purpose                                                   |
| -------------------------------- | --------------------------------------------------------- |
| `user + event (compound unique)` | Prevents duplicate bookings and speeds up booking lookups |

---

# Concurrency Handling

To prevent overbooking when multiple users try to book the same event simultaneously:

- Atomic seat updates using `findOneAndUpdate()`
- MongoDB Transactions
- Automatic rollback if any operation fails during booking
- Consistent seat management during booking and cancellation

---

# Current Project Status

## Completed

- User Authentication
- JWT Authorization
- Role-based Authorization
- Event CRUD APIs
- Event Filtering
- Search
- Sorting
- Pagination
- Booking System
- Cancel Booking
- My Bookings
- Multi-seat Booking
- MongoDB Relationships
- MongoDB Populate
- Database Indexes
- Atomic Seat Reservation
- MongoDB Transactions
- Zod Validation

---

## Pending

- Organizer Dashboard using Aggregation Pipeline
- Centralized Error Middleware
- 24-hour Booking Cancellation Restriction
- Prevent Booking Past Events
- Prevent Updating Past Events

---

# Learning Objectives

This project demonstrates:

- REST API Design
- Authentication & Authorization
- Express Middleware
- JWT Authentication
- Password Hashing
- MongoDB Relationships
- MongoDB Populate
- CRUD Operations
- Filtering
- Searching
- Sorting
- Pagination
- Validation using Zod
- MongoDB Indexes
- Compound Indexes
- Atomic Updates
- Race Condition Prevention
- MongoDB Transactions

---

# Future Improvements

- Organizer Analytics Dashboard
- MongoDB Aggregation Pipeline
- Centralized Error Handling Middleware
- 24-hour Booking Cancellation Rule
- Event Expiry Validation
