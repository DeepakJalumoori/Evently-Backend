import express from "express";

import {
  bookEvent,
  cancelEvent,
  myBookings,
} from "../controllers/bookingController.js";

import authMiddleware from "../Middleware/authMiddleware.js";
import roleMiddleware from "../Middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/booking/{eventId}:
 *   post:
 *     summary: Book an event
 *     description: Allows an attendee to book between 1 and 5 seats for an event.
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: Event ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - seats
 *             properties:
 *               seats:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 2
 *     responses:
 *       201:
 *         description: Event booked successfully
 *       400:
 *         description: Invalid number of seats
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only attendees can book events
 *       409:
 *         description: Already booked or insufficient seats available
 *       500:
 *         description: Internal Server Error
 */
router.post("/:eventId", authMiddleware, roleMiddleware("attendee"), bookEvent);

/**
 * @swagger
 * /api/booking/{bookingId}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     description: Cancels an existing booking and restores the booked seats.
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         description: Booking ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       400:
 *         description: Booking already cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking or Event not found
 *       500:
 *         description: Internal Server Error
 */
router.patch(
  "/:bookingId/cancel",
  authMiddleware,
  roleMiddleware("attendee"),
  cancelEvent,
);

/**
 * @swagger
 * /api/booking:
 *   get:
 *     summary: Get my bookings
 *     description: Returns all bookings of the authenticated attendee.
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookings fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only attendees can access their bookings
 *       404:
 *         description: No bookings found
 *       500:
 *         description: Internal Server Error
 */
router.get("/", authMiddleware, roleMiddleware("attendee"), myBookings);

export default router;
