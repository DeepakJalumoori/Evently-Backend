const Event = require("../models/Event");
const Booking = require("../models/Booking");

const bookEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    //checking for events
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found!",
      });
    }

    //checking for available seats
    if (event.availableSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: "Seats are not available for this event.",
      });
    }

    //checking if the user is already booked the current event
    const existBooking = await Booking.findOne({
      user: req.user._id,
      event: eventId,
      status: "booked",
    });

    if (existBooking) {
      return res.status(400).json({
        success: false,
        message: "You have already booked the event.",
      });
    }

    //Booking an event
    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
    });

    event.availableSeats = event.availableSeats - 1;
    await event.save();

    return res.status(201).json({
      success: true,
      message: "Event booked successfully",
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
