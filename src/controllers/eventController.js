const Event = require("../models/Event");
const { createEventSchema } = require("../validations/eventValidation");

const createEvent = async (req, res) => {
  try {
    const result = createEventSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.issues,
      });
    }

    const { title, description, date, location, capacity } = result.data;

    const event = await Event.create({
      title,
      description,
      date,
      location,
      capacity,
      availableSeats: capacity,
      organizer: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .select("title date location availableSeats")
      .populate("organizer", "name email");

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//Get event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email",
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found!",
      });
    }

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
//Delete event

//update event

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
};
