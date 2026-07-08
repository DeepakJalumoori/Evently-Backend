const express = require("express");
const {
  createEvent,
  getAllEvents,
  getEventById,
} = require("../controllers/eventController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("organizer"), createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
module.exports = router;
