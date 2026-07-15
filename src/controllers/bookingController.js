const Event = require("../models/Event");
const Booking = require("../models/Booking");

const bookEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
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

module.exports = bookEvent;
