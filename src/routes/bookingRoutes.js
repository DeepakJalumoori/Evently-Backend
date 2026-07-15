const express = require("express");
const { bookEvent, cancelEvent } = require("../controllers/bookingController");
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

module.exports = router;
