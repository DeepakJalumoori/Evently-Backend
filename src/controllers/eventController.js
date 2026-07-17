import Event from "../models/Event.js";
import {
  createEventSchema,
  updateEventSchema,
} from "../validations/eventValidation.js";

const createEvent = async (req, res) => {
  try {
    const result = createEventSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.issues,
      });
    }

    const {
      title,
      description,
      category,
      venue,
      city,
      dateTime,
      price,
      capacity,
    } = result.data;

    const event = await Event.create({
      title,
      description,
      category,
      venue,
      city,
      dateTime,
      price,
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
    //Filtering events
    const { city, category, from, to, q, sort, page, limit } = req.query;
    const query = {};

    if (city) {
      query.city = city;
    }

    if (category) {
      query.category = category;
    }

    if (from || to) {
      query.dateTime = {};
    }

    if (from) {
      query.dateTime.$gte = new Date(from);
    }

    if (to) {
      query.dateTime.$lte = new Date(to);
    }

    //Search the text/event name
    if (q) {
      query.title = {
        $regex: q,
        $options: "i",
      };
    }

    //sorting events
    const sortQuery = {};
    if (sort) {
      const order = sort.startsWith("-") ? -1 : 1;

      const field = sort.startsWith("-") ? sort.slice(1) : sort;

      sortQuery[field] = order;
    }

    //pagination
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageLimit = Math.max(Number(limit) || 5, 1);

    const skip = (pageNumber - 1) * pageLimit;

    const totalResults = await Event.countDocuments(query);
    const totalPages = Math.ceil(totalResults / pageLimit);

    //Fetching events
    const events = await Event.find(query)
      .select("title category city venue dateTime price availableSeats")
      .sort(sortQuery)
      .skip(skip)
      .limit(pageLimit)
      .populate("organizer", "name email");

    return res.status(200).json({
      success: true,
      totalResults,
      totalPages,
      currentPage: pageNumber,
      data: events,
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

//update event
const updateEvent = async (req, res) => {
  try {
    const result = updateEventSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.issues,
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.date < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Past events cannot be updated",
      });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this event",
      });
    }

    Object.assign(event, result.data);

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//Delete event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this event",
      });
    }

    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };
