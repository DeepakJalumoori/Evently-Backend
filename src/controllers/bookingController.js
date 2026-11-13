import mongoose from "mongoose";

import Event from "../models/Event.js";
import Booking from "../models/Booking.js";

const isValidObjectId = (value) => mongoose.isValidObjectId(value);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

const bookEvent = async (req, res) => {
  const { eventId } = req.params;
  const { seats } = req.body;

  if (!isValidObjectId(eventId)) {
    return res.status(400).json({ success: false, message: "Invalid event ID." });
  }

  if (!Number.isInteger(seats) || seats < 1 || seats > 5) {
    return res.status(400).json({
      success: false,
      message: "Seats must be an integer between 1 and 5.",
    });
  }

  let session;
  try {
    session = await mongoose.startSession();
    let createdBooking;

    await session.withTransaction(
      async () => {
        const existingBooking = await Booking.findOne({
          user: req.user._id,
          event: eventId,
          status: "booked",
        }).session(session);

        if (existingBooking) {
          throw new HttpError(409, "You already have an active booking for this event.");
        }

        const eventDoc = await Event.findById(eventId).session(session);
        if (!eventDoc) {
          throw new HttpError(404, "Event not found.");
        }
        if (eventDoc.dateTime <= new Date()) {
          throw new HttpError(400, "Cannot book an event that has already started.");
        }
        if (eventDoc.availableSeats < seats) {
          throw new HttpError(409, "Insufficient seats available.");
        }

        const event = await Event.findOneAndUpdate(
          {
            _id: eventId,
            dateTime: { $gt: new Date() },
            availableSeats: { $gte: seats },
          },
          { $inc: { availableSeats: -seats } },
          { returnDocument: "after", session },
        );

        if (!event) {
          throw new HttpError(409, "Insufficient seats available.");
        }

        const totalAmount = seats * event.price;
        const [booking] = await Booking.create(
          [{ user: req.user._id, event: eventId, seats, totalAmount, status: "booked" }],
          { session },
        );

        createdBooking = booking;
      },
      { timeoutMS: 5000 },
    );

    return res.status(201).json({
      success: true,
      message: "Event booked successfully.",
      booking: createdBooking,
    });
  } catch (error) {
    if (error instanceof HttpError || error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You already have an active booking for this event.",
      });
    }

    if (error.hasErrorLabel?.("TransientTransactionError") || error.code === 112) {
      return res.status(409).json({
        success: false,
        message: "Unable to complete booking due to concurrent conflict. Please retry.",
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  } finally {
    if (session) await session.endSession();
  }
};

const cancelEvent = async (req, res) => {
  const { bookingId } = req.params;

  if (!isValidObjectId(bookingId)) {
    return res.status(400).json({ success: false, message: "Invalid booking ID." });
  }

  let session;
  try {
    session = await mongoose.startSession();
    let cancelledBooking;

    await session.withTransaction(
      async () => {
        const booking = await Booking.findById(bookingId).session(session);

        if (!booking) {
          throw new HttpError(404, "Booking not found.");
        }

        if (!booking.user.equals(req.user._id)) {
          throw new HttpError(403, "You are not allowed to cancel this booking.");
        }

        if (booking.status !== "booked") {
          throw new HttpError(409, "Only active bookings can be cancelled.");
        }

        const event = await Event.findById(booking.event).session(session);

        if (!event) {
          throw new HttpError(404, "Event not found.");
        }

        if (event.dateTime <= new Date()) {
          throw new HttpError(400, "Bookings can only be cancelled before the event starts.");
        }

        // Atomically transition status from "booked" to "cancelled"
        const updatedBooking = await Booking.findOneAndUpdate(
          {
            _id: bookingId,
            user: req.user._id,
            status: "booked",
          },
          { status: "cancelled" },
          { returnDocument: "after", session },
        );

        if (!updatedBooking) {
          throw new HttpError(409, "Only active bookings can be cancelled.");
        }

        const updatedEvent = await Event.findOneAndUpdate(
          {
            _id: event._id,
            $expr: {
              $lte: [
                { $add: ["$availableSeats", booking.seats] },
                "$capacity",
              ],
            },
          },
          { $inc: { availableSeats: booking.seats } },
          { returnDocument: "after", session },
        );

        if (!updatedEvent) {
          throw new HttpError(409, "Could not safely restore event seat inventory.");
        }

        cancelledBooking = updatedBooking;
      },
      { timeoutMS: 5000 },
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      booking: cancelledBooking,
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
        message: "Unable to complete cancellation due to concurrent conflict. Please retry.",
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  } finally {
    if (session) await session.endSession();
  }
};

const myBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("event");

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export { bookEvent, cancelEvent, myBookings };
