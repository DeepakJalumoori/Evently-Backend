# Evently – Event Booking REST API

A RESTful backend API for an event booking platform built with **Node.js**, **Express.js**, and **MongoDB**.

Evently allows organizers to create and manage events while attendees can browse and book events. The project focuses on authentication, authorization, clean API design, validation, and secure backend development.

---

## Features

### Authentication

- User Registration
- User Login
- Password Hashing using bcrypt
- JWT Authentication
- Role-based Authorization (Organizer / Attendee)

### Event Management

- Create Event (Organizer Only)
- Get All Events
- Get Event By ID
- Update Own Event
- Delete Own Event

### Validation

- Request validation using Zod
- Field-level validation errors
- Consistent API responses

### Security

- Passwords are never stored in plain text
- JWT-based protected routes
- Role-based access control
- Password excluded from API responses

---

## Tech Stack

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- JWT (jsonwebtoken)
- bcrypt

### Validation

- Zod

### Development Tools

- Nodemon
- dotenv
- Postman

---

## Project Structure

```
Evently/
│
├── src/
│
├── controllers/
│   ├── authController.js
│   └── eventController.js
│
├── middlewares/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
│
├── models/
│   ├── User.js
│   └── Event.js
│
├── routes/
│   ├── authRoutes.js
│   └── eventRoutes.js
│
├── validations/
│   ├── authValidation.js
│   └── eventValidation.js
│
├── config/
│
├── app.js
├── server.js
└── .env
```

---

## Installation

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

Run the server

```bash
npm run dev
```

---

## API Endpoints

### Authentication

| Method | Endpoint             | Access |
| ------ | -------------------- | ------ |
| POST   | `/api/auth/register` | Public |
| POST   | `/api/auth/login`    | Public |

---

### Events

| Method | Endpoint          | Access            |
| ------ | ----------------- | ----------------- |
| POST   | `/api/events`     | Organizer         |
| GET    | `/api/events`     | Public            |
| GET    | `/api/events/:id` | Public            |
| PATCH  | `/api/events/:id` | Organizer (Owner) |
| DELETE | `/api/events/:id` | Organizer (Owner) |

---

## Event Schema

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

## Authentication

Protected routes require a JWT token.

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Sample Request

### Create Event

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

## Sample Success Response

```json
{
  "success": true,
  "message": "Event created successfully"
}
```

---

## Middleware

### Authentication Middleware

- Verifies JWT
- Finds logged-in user
- Attaches user to request

```javascript
req.user;
```

---

### Role Middleware

Allows access only to specified roles.

Example

```javascript
roleMiddleware("organizer");
```

---

## Validation

Request payloads are validated using **Zod** before reaching business logic.

Example validations

- Required fields
- String length
- Positive numbers
- Enum validation
- ISO Date-Time validation

---

## Current Project Status

### Completed

- Authentication
- JWT Authorization
- Role-based Authorization
- Event CRUD APIs
- Zod Validation
- MongoDB Models
- Password Hashing

### In Progress

- Event Filtering
- Search
- Sorting
- Pagination

### Upcoming Features

- Booking System
- Atomic Seat Booking
- Booking Cancellation
- Organizer Dashboard
- MongoDB Aggregation
- Centralized Error Handling
- Database Indexes

---

## Learning Objectives

This project demonstrates:

- REST API Design
- JWT Authentication
- Authorization
- Express Middleware
- MongoDB Relationships
- CRUD Operations
- Validation using Zod
- Secure Password Storage
- Mongoose Models
- Error Handling

---

## Future Improvements

- Booking APIs
- Race Condition Prevention
- MongoDB Transactions
- Aggregation Pipeline
- Database Indexes
- Swagger Documentation
- Docker Support
- Unit Testing
- CI/CD Pipeline
