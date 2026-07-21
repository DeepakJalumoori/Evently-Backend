import express from "express";

import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

import authMiddleware from "../Middleware/authMiddleware.js";
import roleMiddleware from "../Middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     description: Allows an organizer to create a new event.
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - venue
 *               - city
 *               - dateTime
 *               - price
 *               - capacity
 *             properties:
 *               title:
 *                 type: string
 *                 example: Coldplay Concert
 *               description:
 *                 type: string
 *                 example: Live music concert in Hyderabad
 *               category:
 *                 type: string
 *                 example: Music
 *               venue:
 *                 type: string
 *                 example: Gachibowli Stadium
 *               city:
 *                 type: string
 *                 example: Hyderabad
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-12-20T18:30:00.000Z
 *               price:
 *                 type: number
 *                 example: 999
 *               capacity:
 *                 type: integer
 *                 example: 500
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only organizers can create events
 *       500:
 *         description: Internal Server Error
 */
router.post("/", authMiddleware, roleMiddleware("organizer"), createEvent);

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     description: Returns a paginated list of events with filtering, searching and sorting.
 *     tags:
 *       - Events
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *         example: Hyderabad
 *
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *         example: Music
 *
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by title
 *         example: concert
 *
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field (use - for descending)
 *         example: dateTime
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *
 *     responses:
 *       200:
 *         description: Events fetched successfully
 *       500:
 *         description: Internal Server Error
 */
router.get("/", getAllEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     description: Returns a single event by its ID.
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Event ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event fetched successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id", getEventById);

/**
 * @swagger
 * /api/events/{id}:
 *   patch:
 *     summary: Update an event
 *     description: Allows the organizer to update an existing event.
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               venue:
 *                 type: string
 *               city:
 *                 type: string
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *               price:
 *                 type: number
 *               capacity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Validation error or past event
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal Server Error
 */
router.patch("/:id", authMiddleware, roleMiddleware("organizer"), updateEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete an event
 *     description: Allows the organizer to delete an event.
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Event ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id", authMiddleware, roleMiddleware("organizer"), deleteEvent);

export default router;
