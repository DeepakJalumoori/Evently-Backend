import mongoose from "mongoose";

import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import {
  createEventSchema,
  updateEventSchema,
  getOrganizerEventsQuerySchema,
  getEventBookingsQuerySchema,
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

    if (city) query.city = { $regex: `^${escapeRegex(city)}$`, $options: "i" };
    if (category) query.category = category.toLowerCase();

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
      .select("title description category city venue dateTime price capacity availableSeats organizer")
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

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

const updateEvent = async (req, res) => {
  const result = updateEventSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, errors: result.error.issues });
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid event ID." });
  }

  let session;
  try {
    session = await mongoose.startSession();
    let updatedEventDoc;

    await session.withTransaction(
      async () => {
        const event = await Event.findById(req.params.id).session(session);
        if (!event) {
          throw new HttpError(404, "Event not found.");
        }
        if (event.dateTime <= new Date()) {
          throw new HttpError(400, "Past events cannot be updated.");
        }
        if (event.organizer.toString() !== req.user._id.toString()) {
          throw new HttpError(403, "You are not allowed to update this event.");
        }

        if (result.data.capacity !== undefined) {
          const bookedSeats = event.capacity - event.availableSeats;
          if (result.data.capacity < bookedSeats) {
            throw new HttpError(400, `Capacity cannot be lower than the ${bookedSeats} seats already booked.`);
          }
          event.availableSeats = result.data.capacity - bookedSeats;
        }

        Object.assign(event, result.data);
        await event.save({ session });
        updatedEventDoc = event;
      },
      { timeoutMS: 5000 },
    );

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEventDoc,
    });
  } catch (error) {
    if (error instanceof HttpError || error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    if (error.hasErrorLabel?.("TransientTransactionError") || error.code === 112) {
      return res.status(409).json({
        success: false,
        message: "Unable to update event due to concurrent conflict. Please retry.",
      });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  } finally {
    if (session) await session.endSession();
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

const getOrganizerEvents = async (req, res) => {
  try {
    const result = getOrganizerEventsQuerySchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters.",
        errors: result.error.issues,
      });
    }

    const { page, limit, status, sort } = result.data;
    const query = { organizer: req.user._id };

    if (status === "upcoming") {
      query.dateTime = { $gt: new Date() };
    } else if (status === "past") {
      query.dateTime = { $lte: new Date() };
    }

    const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
    const sortDirection = sort.startsWith("-") ? -1 : 1;
    const sortQuery = { [sortField]: sortDirection };

    const skip = (page - 1) * limit;
    const totalResults = await Event.countDocuments(query);
    const totalPages = Math.ceil(totalResults / limit);

    const events = await Event.find(query)
      .select(
        "title description category venue city dateTime price capacity availableSeats createdAt updatedAt",
      )
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    const eventIds = events.map((event) => event._id);
    const bookedEventIds = await Booking.distinct("event", {
      event: { $in: eventIds },
    });
    const bookedEventIdSet = new Set(bookedEventIds.map((id) => id.toString()));

    const data = events.map((event) => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      category: event.category,
      venue: event.venue,
      city: event.city,
      dateTime: event.dateTime,
      price: event.price,
      capacity: event.capacity,
      availableSeats: event.availableSeats,
      bookedSeats: event.capacity - event.availableSeats,
      hasBookings: bookedEventIdSet.has(event._id.toString()),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      totalResults,
      totalPages,
      currentPage: page,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getEventBookings = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view bookings for this event.",
      });
    }

    const result = getEventBookingsQuerySchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters.",
        errors: result.error.issues,
      });
    }

    const { status, page, limit } = result.data;

    // Calculate summary statistics across the event's entire booking history,
    // independently of pagination and the selected status filter.
    const [summaryResult] = await Booking.aggregate([
      { $match: { event: event._id } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          activeBookings: {
            $sum: { $cond: [{ $eq: ["$status", "booked"] }, 1, 0] },
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          bookedSeats: {
            $sum: {
              $cond: [{ $eq: ["$status", "booked"] }, "$seats", 0],
            },
          },
          totalBookingValue: {
            $sum: {
              $cond: [{ $eq: ["$status", "booked"] }, "$totalAmount", 0],
            },
          },
        },
      },
    ]);

    const totalBookings = summaryResult?.totalBookings ?? 0;
    const activeBookings = summaryResult?.activeBookings ?? 0;
    const cancelledBookings = summaryResult?.cancelledBookings ?? 0;
    const bookedSeats = summaryResult?.bookedSeats ?? 0;
    const totalBookingValue = summaryResult?.totalBookingValue ?? 0;
    const occupancyRate =
      event.capacity > 0
        ? Math.round((bookedSeats / event.capacity) * 100 * 100) / 100
        : 0;

    const bookingQuery = { event: event._id };
    if (status !== "all") {
      bookingQuery.status = status;
    }

    const totalResults = await Booking.countDocuments(bookingQuery);
    const totalPages = Math.ceil(totalResults / limit);
    const skip = (page - 1) * limit;

    const bookings = await Booking.find(bookingQuery)
      .select("_id user seats totalAmount status createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "_id name");

    const formattedBookings = bookings.map((booking) => ({
      _id: booking._id,
      user: booking.user
        ? {
            _id: booking.user._id,
            name: booking.user.name,
          }
        : null,
      seats: booking.seats,
      totalAmount: booking.totalAmount,
      status: booking.status,
      createdAt: booking.createdAt,
    }));

    return res.status(200).json({
      success: true,
      event: {
        _id: event._id,
        title: event.title,
        dateTime: event.dateTime,
        capacity: event.capacity,
        availableSeats: event.availableSeats,
        price: event.price,
      },
      summary: {
        totalBookings,
        activeBookings,
        cancelledBookings,
        bookedSeats,
        occupancyRate,
        totalBookingValue,
      },
      pagination: {
        totalResults,
        totalPages,
        currentPage: page,
      },
      bookings: formattedBookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getOrganizerEvents,
  getEventBookings,
};
