const express = require("express");
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("organizer"), createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.patch("/:id", authMiddleware, roleMiddleware("organizer"), updateEvent);
router.delete("/:id", authMiddleware, roleMiddleware("organizer"), deleteEvent);
module.exports = router;
