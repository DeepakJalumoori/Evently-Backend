import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Keep historical cancelled bookings while preventing duplicate active bookings.
bookingSchema.index(
  { user: 1, event: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "booked" },
    name: "unique_active_booking_per_user_event",
  },
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
