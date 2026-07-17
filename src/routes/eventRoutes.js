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

router.post("/", authMiddleware, roleMiddleware("organizer"), createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.patch("/:id", authMiddleware, roleMiddleware("organizer"), updateEvent);
router.delete("/:id", authMiddleware, roleMiddleware("organizer"), deleteEvent);
export default router;
