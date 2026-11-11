import mongoose from "mongoose";

import Event from "../models/Event.js";
import Booking from "../models/Booking.js";

const isValidObjectId = (value) => mongoose.isValidObjectId(value);

const bookEvent = async (req, res) => {
  let session;

  try {
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

    session = await mongoose.startSession();
    session.startTransaction();

    const existingBooking = await Booking.findOne({
      user: req.user._id,
      event: eventId,
      status: "booked",
    }).session(session);

    if (existingBooking) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "You already have an active booking for this event.",
      });
    }

    // The event must be in the future and have enough seats.
    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        dateTime: { $gt: new Date() },
        availableSeats: { $gte: seats },
      },
      { $inc: { availableSeats: -seats } },
      { new: true, session },
    );

    if (!event) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "Event not found, already started, or insufficient seats available.",
      });
    }

    const totalAmount = seats * event.price;
    const [booking] = await Booking.create(
      [{ user: req.user._id, event: eventId, seats, totalAmount, status: "booked" }],
      { session },
    );

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Event booked successfully.",
      booking,
    });
  } catch (error) {
    if (session?.inTransaction()) await session.abortTransaction();
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You already have an active booking for this event.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  } finally {
    if (session) await session.endSession();
  }
};

const cancelEvent = async (req, res) => {
  let session;

  try {
    const { bookingId } = req.params;

    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID." });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const booking = await Booking.findById(bookingId).session(session);

    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (!booking.user.equals(req.user._id)) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: "You are not allowed to cancel this booking.",
      });
    }

    if (booking.status !== "booked") {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "Only active bookings can be cancelled.",
      });
    }

    const event = await Event.findById(booking.event).session(session);

    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    if (event.dateTime <= new Date()) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Bookings can only be cancelled before the event starts.",
      });
    }

    // Persist the cancellation and restore inventory in the same transaction.
    booking.status = "cancelled";
    await booking.save({ session });

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
      { new: true, session },
    );

    if (!updatedEvent) {
      throw new Error("Could not safely restore event seat inventory.");
    }

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      booking,
    });
  } catch (error) {
    if (session?.inTransaction()) await session.abortTransaction();
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
