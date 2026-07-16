const express = require("express");
const {
  bookEvent,
  cancelEvent,
  myBookings,
} = require("../controllers/bookingController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/:eventId", authMiddleware, roleMiddleware("attendee"), bookEvent);
router.patch(
  "/:bookingId/cancel",
  authMiddleware,
  roleMiddleware("attendee"),
  cancelEvent,
);
router.get("/", authMiddleware, roleMiddleware("attendee"), myBookings);

module.exports = router;
