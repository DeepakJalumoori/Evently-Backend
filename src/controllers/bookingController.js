const Event = require("../models/Event");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

const bookEvent = async (req, res) => {
  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const { eventId } = req.params;

    // Check if the user has already booked this event
    const existBooking = await Booking.findOne({
      user: req.user._id,
      event: eventId,
      status: "booked",
    }).session(session);

    if (existBooking) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "You have already booked the event.",
      });
    }

    // Atomically decrease available seats
    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        availableSeats: { $gt: 0 },
      },
      {
        $inc: { availableSeats: -1 },
      },
      {
        new: true,
        session,
      },
    );

    if (!event) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message: "Event not found or no seats available.",
      });
    }

    // Create booking
    const [booking] = await Booking.create(
      [
        {
          user: req.user._id,
          event: eventId,
        },
      ],
      { session },
    );

    // Commit transaction
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Event booked successfully",
      booking,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

const cancelEvent = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    //checking the booking exists or not
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    //checking whether the current booking belongs to logged in user
    if (!booking.user.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to cancel this booking.",
      });
    }

    //checking the status of booking
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled.",
      });
    }

    //checking for the event
    const event = await Event.findById(booking.event);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    //cancelling the event
    event.availableSeats++;
    booking.status = "cancelled";

    await event.save();
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Event cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const myBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate(
      "event",
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found.",
      });
    }

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = { bookEvent, cancelEvent, myBookings };
