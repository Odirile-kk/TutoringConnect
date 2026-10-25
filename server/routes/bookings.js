import { Router } from "express";

import mongoose from "mongoose";

import Booking from "../models/Booking.js";

import Availability from "../models/Availability.js";

import { protect, allow } from "../middleware/auth.js";

const r = Router();

r.use(protect);

// Helper for returning HTTP errors
function httpError(message, status) {
  return Object.assign(new Error(message), { status });
}

// Release a reserved availability slot
async function releaseSlot(availabilityId) {
  if (!availabilityId) return;

  const activeBooking = await Booking.exists({
    availability: availabilityId,
    status: { $in: ["confirmed", "completed"] },
  });

  if (!activeBooking) {
    await Availability.updateOne(
      { _id: availabilityId },
      { $set: { booked: false } }
    );
  }
}

// GET ALL BOOKINGS
r.get("/", async (req, res, next) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {}
        : req.user.role === "tutor"
          ? { tutor: req.user._id }
          : { student: req.user._id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.student) {
      filter.student = req.query.student;
    }

    if (req.query.tutor) {
      filter.tutor = req.query.tutor;
    }

    if (req.query.subject) {
      filter.subject = req.query.subject;
    }

    if (req.query.date) {
      const d = new Date(req.query.date);

      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({
          message: "Invalid booking date.",
        });
      }

      const end = new Date(d);
      end.setDate(end.getDate() + 1);

      filter.date = {
        $gte: d,
        $lt: end,
      };
    }

    const bookings = await Booking.find(filter)
      .populate("student", "name email")
      .populate("tutor", "name email")
      .populate("subject", "name")
      .sort({ date: -1 })
      .limit(500);

    res.json(bookings);
  } catch (e) {
    next(e);
  }
});

// CREATE BOOKING
r.post("/", allow("student"), async (req, res, next) => {
  let reservedSlot = null;
  let createdBooking = null;

  try {
    const availabilityId = req.body.availability;

    if (!mongoose.isValidObjectId(availabilityId)) {
      throw httpError("Invalid availability slot.", 400);
    }

    // Atomically reserve the slot
    reservedSlot = await Availability.findOneAndUpdate(
      {
        _id: availabilityId,
        booked: false,
        date: { $gt: new Date() },
      },
      {
        $set: { booked: true },
      },
      {
        new: true,
      }
    );

    if (!reservedSlot) {
      throw httpError(
        "That slot is no longer available. Please choose another time.",
        409
      );
    }

    // Create the booking
    createdBooking = await Booking.create({
      student: req.user._id,
      tutor: reservedSlot.tutor,
      subject: reservedSlot.subject,
      availability: reservedSlot._id,
      date: reservedSlot.date,
      startTime: reservedSlot.startTime,
      endTime: reservedSlot.endTime,
    });

    const result = await Booking.findById(createdBooking._id)
      .populate("student tutor subject");

    res.status(201).json(result);

  } catch (e) {
    // Release the slot if booking creation failed
    if (reservedSlot && !createdBooking) {
      try {
        await releaseSlot(reservedSlot._id);
      } catch (rollbackError) {
        console.error(
          "Booking rollback failed:",
          rollbackError
        );
      }
    }

    next(e);
  }
});

// CANCEL BOOKING
r.patch("/:id/cancel", async (req, res, next) => {
  try {
    const filter = {
      _id: req.params.id,
      status: "confirmed",
      date: { $gt: new Date() },
    };

    if (req.user.role === "student") {
      filter.student = req.user._id;
    } else if (req.user.role === "tutor") {
      filter.tutor = req.user._id;
    }

    const booking = await Booking.findOneAndUpdate(
      filter,
      {
        $set: { status: "cancelled" },
      },
      {
        new: true,
      }
    );

    if (!booking) {
      return res.status(404).json({
        message:
          "Booking not found, already cancelled, or cannot be cancelled.",
      });
    }

    await releaseSlot(booking.availability);

    res.json({
      message:
        "Booking cancelled. The slot is available again.",
      booking,
    });

  } catch (e) {
    next(e);
  }
});

// RESCHEDULE BOOKING
r.patch(
  "/:id/reschedule",
  allow("student", "admin"),
  async (req, res, next) => {
    let reservedSlot = null;
    let updatedBooking = null;

    try {
      const availabilityId = req.body.availability;

      if (!mongoose.isValidObjectId(availabilityId)) {
        throw httpError(
          "Invalid availability slot.",
          400
        );
      }

      const filter = {
        _id: req.params.id,
        status: "confirmed",
        date: { $gt: new Date() },
      };

      if (req.user.role === "student") {
        filter.student = req.user._id;
      }

      const oldBooking = await Booking.findOne(filter);

      if (!oldBooking) {
        throw httpError(
          "Booking not found or cannot be rescheduled.",
          404
        );
      }

      if (
        String(oldBooking.availability) ===
        String(availabilityId)
      ) {
        throw httpError(
          "Please select a different time slot.",
          400
        );
      }

      // Reserve the new slot
      reservedSlot = await Availability.findOneAndUpdate(
        {
          _id: availabilityId,
          booked: false,
          date: { $gt: new Date() },
        },
        {
          $set: { booked: true },
        },
        {
          new: true,
        }
      );

      if (!reservedSlot) {
        throw httpError(
          "The selected slot is unavailable.",
          409
        );
      }

      // Update only if the original booking is unchanged
      updatedBooking = await Booking.findOneAndUpdate(
        {
          ...filter,
          availability: oldBooking.availability,
        },
        {
          $set: {
            availability: reservedSlot._id,
            tutor: reservedSlot.tutor,
            subject: reservedSlot.subject,
            date: reservedSlot.date,
            startTime: reservedSlot.startTime,
            endTime: reservedSlot.endTime,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedBooking) {
        throw httpError(
          "Booking changed during rescheduling. Please try again.",
          409
        );
      }

      // Release the previous slot
      await releaseSlot(oldBooking.availability);

      const result = await Booking.findById(
        updatedBooking._id
      ).populate("student tutor subject");

      res.json(result);

    } catch (e) {
      // Release new slot if rescheduling failed
      if (reservedSlot && !updatedBooking) {
        try {
          await releaseSlot(reservedSlot._id);
        } catch (rollbackError) {
          console.error(
            "Reschedule rollback failed:",
            rollbackError
          );
        }
      }

      next(e);
    }
  }
);

// ADMIN UPDATE BOOKING STATUS
r.patch(
  "/:id/status",
  allow("admin"),
  async (req, res, next) => {
    try {
      const newStatus = req.body.status;

      if (
        !["confirmed", "completed", "cancelled"].includes(
          newStatus
        )
      ) {
        return res.status(400).json({
          message: "Invalid booking status.",
        });
      }

      const booking = await Booking.findById(
        req.params.id
      );

      if (!booking) {
        return res.status(404).json({
          message: "Booking not found.",
        });
      }

      // Prevent reopening cancelled bookings
      if (
        booking.status === "cancelled" &&
        newStatus !== "cancelled"
      ) {
        return res.status(409).json({
          message:
            "Cancelled bookings cannot be reopened. Create a new booking.",
        });
      }

      // Only allow valid status transitions
      const allowedTransitions = {
        confirmed: ["completed", "cancelled"],
        completed: [],
        cancelled: [],
      };

      if (booking.status === newStatus) {
        return res.json(booking);
      }

      if (
        !allowedTransitions[booking.status].includes(
          newStatus
        )
      ) {
        return res.status(400).json({
          message: "Invalid booking status transition.",
        });
      }

      const updated = await Booking.findOneAndUpdate(
        {
          _id: booking._id,
          status: booking.status,
        },
        {
          $set: { status: newStatus },
        },
        {
          new: true,
        }
      );

      if (!updated) {
        return res.status(409).json({
          message:
            "Booking status changed. Please refresh and try again.",
        });
      }

      if (newStatus === "cancelled") {
        await releaseSlot(updated.availability);
      }

      const result = await Booking.findById(
        updated._id
      ).populate("student tutor subject");

      res.json(result);

    } catch (e) {
      next(e);
    }
  }
);

export default r;