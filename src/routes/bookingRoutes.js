import express from "express";

import {
  bookEvent,
  cancelEvent,
  myBookings,
} from "../controllers/bookingController.js";
import authMiddleware from "../Middleware/authMiddleware.js";
import roleMiddleware from "../Middleware/roleMiddleware.js";

const router = express.Router();

router.post("/:eventId", authMiddleware, roleMiddleware("attendee"), bookEvent);
router.patch(
  "/:bookingId/cancel",
  authMiddleware,
  roleMiddleware("attendee"),
  cancelEvent,
);
router.get("/", authMiddleware, roleMiddleware("attendee"), myBookings);

export default router;
