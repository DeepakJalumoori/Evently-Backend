const express = require("express");
const { createEvent } = require("../controllers/eventController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("organiser"), createEvent);

module.exports = router;
