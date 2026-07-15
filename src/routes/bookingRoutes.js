const express = require("express");
const bookEvent = require("../controllers/bookingController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/:eventId", authMiddleware, roleMiddleware("attendee"), bookEvent);

module.exports = router;
