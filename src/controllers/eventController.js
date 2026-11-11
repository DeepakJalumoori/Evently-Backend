import mongoose from "mongoose";

import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import {
  createEventSchema,
  updateEventSchema,
} from "../validations/eventValidation.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const allowedSortFields = new Set(["dateTime", "price", "title", "createdAt"]);

const createEvent = async (req, res) => {
  try {
    const result = createEventSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ success: false, errors: result.error.issues });
    }

    const event = await Event.create({
      ...result.data,
      availableSeats: result.data.capacity,
      organizer: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const { city, category, from, to, q, sort, page, limit } = req.query;
    const query = {};

    if (city) query.city = city;
    if (category) query.category = category;

    if (from || to) {
      query.dateTime = {};
      if (from) {
        const fromDate = new Date(from);
        if (Number.isNaN(fromDate.getTime())) {
          return res.status(400).json({ success: false, message: "Invalid 'from' date." });
        }
        query.dateTime.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (Number.isNaN(toDate.getTime())) {
          return res.status(400).json({ success: false, message: "Invalid 'to' date." });
        }
        query.dateTime.$lte = toDate;
      }
      if (from && to && query.dateTime.$gte > query.dateTime.$lte) {
        return res.status(400).json({ success: false, message: "'from' must be before or equal to 'to'." });
      }
    }

    if (q) query.title = { $regex: escapeRegex(q), $options: "i" };

    const requestedSort = sort || "dateTime";
    const sortField = requestedSort.startsWith("-") ? requestedSort.slice(1) : requestedSort;
    if (!allowedSortFields.has(sortField)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported sort field. Use dateTime, price, title, or createdAt.",
      });
    }
    const sortQuery = { [sortField]: requestedSort.startsWith("-") ? -1 : 1 };

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const pageLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNumber - 1) * pageLimit;

    const totalResults = await Event.countDocuments(query);
    const totalPages = Math.ceil(totalResults / pageLimit);
    const events = await Event.find(query)
      .select("title description category city venue dateTime price capacity availableSeats")
      .sort(sortQuery)
      .skip(skip)
      .limit(pageLimit)
      .populate("organizer", "name");

    return res.status(200).json({
      success: true,
      totalResults,
      totalPages,
      currentPage: pageNumber,
      data: events,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getEventById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }

    const event = await Event.findById(req.params.id).populate("organizer", "name");
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    return res.status(200).json({ success: true, event });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateEvent = async (req, res) => {
  try {
    const result = updateEventSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, errors: result.error.issues });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }
    if (event.dateTime <= new Date()) {
      return res.status(400).json({ success: false, message: "Past events cannot be updated." });
    }
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You are not allowed to update this event." });
    }

    if (result.data.capacity !== undefined) {
      const bookedSeats = event.capacity - event.availableSeats;
      if (result.data.capacity < bookedSeats) {
        return res.status(400).json({
          success: false,
          message: `Capacity cannot be lower than the ${bookedSeats} seats already booked.`,
        });
      }
      event.availableSeats = result.data.capacity - bookedSeats;
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
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You are not allowed to delete this event." });
    }

    const hasBookingHistory = await Booking.exists({ event: event._id });
    if (hasBookingHistory) {
      return res.status(409).json({
        success: false,
        message: "Events with booking history cannot be deleted.",
      });
    }

    await event.deleteOne();
    return res.status(200).json({ success: true, message: "Event deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };
