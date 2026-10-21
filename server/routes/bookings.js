import { Router } from "express";
import mongoose from "mongoose";

import Availability from "../models/Availability.js";
import Booking from "../models/Booking.js";
import TutorProfile from "../models/TutorProfile.js";

import { authenticate, role } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

const activeStatuses = ["Pending", "Confirmed"];

const validId = (id) => mongoose.isValidObjectId(id);

const validDate = (value) => {
  if (typeof value !== "string") return false;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
};

const validTime = (value) =>
  typeof value === "string" &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

function handleError(res, error) {
  console.error("Booking request failed:", error);

  return res.status(500).json({
    message: "Unable to process booking request.",
  });
}

async function tutorTeachesSubject(tutor, subject) {
  const profile = await TutorProfile.findOne({ user: tutor });

  return Boolean(
    profile &&
    profile.subjects.some(
      (assignedSubject) =>
        String(assignedSubject) === String(subject)
    )
  );
}

async function bookingConflict(
  tutor,
  date,
  startTime,
  endTime,
  excludeBooking
) {
  return Booking.exists({
    tutor,
    date,
    status: { $in: activeStatuses },

    ...(excludeBooking
      ? { _id: { $ne: excludeBooking } }
      : {}),

    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  });
}

async function reserveSlot(details) {
  return Availability.findOneAndUpdate(
    {
      _id: details.availability,
      tutor: details.tutor,
      date: details.date,
      startTime: details.startTime,
      endTime: details.endTime,
      available: true,
    },
    {
      $set: { available: false },
    },
    {
      new: true,
    }
  );
}

async function releaseSlot(id) {
  return Availability.findByIdAndUpdate(id, {
    $set: { available: true },
  });
}

// Retrieve bookings

router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "student") {
      filter.student = req.user.id;
    }

    if (req.user.role === "tutor") {
      filter.tutor = req.user.id;
    }

    const bookings = await Booking.find(filter)
      .populate("student", "name email")
      .populate("tutor", "name email")
      .populate("subject", "name")
      .sort({ date: 1, startTime: 1 });

    res.json(bookings);
  } catch (error) {
    handleError(res, error);
  }
});

// Create booking

router.post("/", role("student"), async (req, res) => {
  try {
    const {
      tutor,
      subject,
      availability,
      date,
      startTime,
      endTime,
    } = req.body;

    if (
      !validId(tutor) ||
      !validId(subject) ||
      !validId(availability) ||
      !validDate(date) ||
      !validTime(startTime) ||
      !validTime(endTime) ||
      startTime >= endTime
    ) {
      return res.status(400).json({
        message: "Invalid booking information.",
      });
    }

    const assigned = await tutorTeachesSubject(
      tutor,
      subject
    );

    if (!assigned) {
      return res.status(400).json({
        message: "Tutor is not assigned to this subject.",
      });
    }

    const conflict = await bookingConflict(
      tutor,
      date,
      startTime,
      endTime
    );

    if (conflict) {
      return res.status(409).json({
        message: "Tutor already has a booking at this time.",
      });
    }

    const slot = await reserveSlot({
      availability,
      tutor,
      date,
      startTime,
      endTime,
    });

    if (!slot) {
      return res.status(409).json({
        message: "The selected time slot is unavailable.",
      });
    }

    try {
      const booking = await Booking.create({
        student: req.user.id,
        tutor,
        subject,
        availability,
        date,
        startTime,
        endTime,
        sessionType: "Microsoft Teams",
        status: "Pending",
      });

      return res.status(201).json(booking);
    } catch (error) {
      await releaseSlot(slot._id);
      throw error;
    }
  } catch (error) {
    return handleError(res, error);
  }
});

// Update booking status

router.put("/:id/status", async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    const isAdmin = req.user.role === "admin";

    const isStudent =
      req.user.role === "student" &&
      String(booking.student) === String(req.user.id);

    const isTutor =
      req.user.role === "tutor" &&
      String(booking.tutor) === String(req.user.id);

    if (!isAdmin && !isStudent && !isTutor) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    const requestedStatus = req.body.status;

    const transitions = {
      Pending: ["Confirmed", "Cancelled"],
      Confirmed: ["Completed", "Cancelled"],
      Completed: [],
      Cancelled: [],
    };

    if (
      !transitions[booking.status]?.includes(requestedStatus)
    ) {
      return res.status(400).json({
        message: "Invalid booking status change.",
      });
    }

    if (isStudent && requestedStatus !== "Cancelled") {
      return res.status(403).json({
        message: "Students can only cancel bookings.",
      });
    }

    if (
      requestedStatus === "Confirmed" &&
      !isAdmin &&
      !isTutor
    ) {
      return res.status(403).json({
        message: "Only administrators and tutors can confirm bookings.",
      });
    }

    if (
      requestedStatus === "Completed" &&
      !isAdmin &&
      !isTutor
    ) {
      return res.status(403).json({
        message: "Only administrators and tutors can complete bookings.",
      });
    }

    booking.status = requestedStatus;

    await booking.save();

    if (requestedStatus === "Cancelled") {
      await releaseSlot(booking.availability);
    }

    res.json(booking);
  } catch (error) {
    handleError(res, error);
  }
});

// Reschedule booking

router.put("/:id/reschedule", async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    const isAdmin = req.user.role === "admin";

    const isStudent =
      req.user.role === "student" &&
      String(booking.student) === String(req.user.id);

    if (!isAdmin && !isStudent) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    if (!activeStatuses.includes(booking.status)) {
      return res.status(400).json({
        message: "This booking cannot be rescheduled.",
      });
    }

    const tutor = isAdmin
      ? req.body.tutor || booking.tutor
      : booking.tutor;

    const {
      availability,
      date,
      startTime,
      endTime,
    } = req.body;

    if (
      !validId(tutor) ||
      !validId(availability) ||
      !validDate(date) ||
      !validTime(startTime) ||
      !validTime(endTime) ||
      startTime >= endTime
    ) {
      return res.status(400).json({
        message: "Invalid rescheduling information.",
      });
    }

    if (
      String(availability) === String(booking.availability)
    ) {
      return res.status(400).json({
        message: "Select a different availability slot.",
      });
    }

    const assigned = await tutorTeachesSubject(
      tutor,
      booking.subject
    );

    if (!assigned) {
      return res.status(400).json({
        message: "Tutor does not teach this subject.",
      });
    }

    const conflict = await bookingConflict(
      tutor,
      date,
      startTime,
      endTime,
      booking._id
    );

    if (conflict) {
      return res.status(409).json({
        message: "Tutor has another booking at this time.",
      });
    }

    const newSlot = await reserveSlot({
      availability,
      tutor,
      date,
      startTime,
      endTime,
    });

    if (!newSlot) {
      return res.status(409).json({
        message: "Selected availability is no longer available.",
      });
    }

    const previousSlot = booking.availability;

    try {
      booking.tutor = tutor;
      booking.availability = newSlot._id;
      booking.date = date;
      booking.startTime = startTime;
      booking.endTime = endTime;
      booking.status = "Pending";

      await booking.save();

      await releaseSlot(previousSlot);

      return res.json(booking);
    } catch (error) {
      await releaseSlot(newSlot._id);
      throw error;
    }
  } catch (error) {
    handleError(res, error);
  }
});

export default router;