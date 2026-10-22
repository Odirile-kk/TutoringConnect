import { Router } from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Availability from "../models/Availability.js";
import { protect, allow } from "../middleware/auth.js";
const r = Router();
r.use(protect);
r.get("/", async (req, res) => {
  const filter =
    req.user.role === "admin"
      ? {}
      : req.user.role === "tutor"
        ? { tutor: req.user._id }
        : { student: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.student) filter.student = req.query.student;
  if (req.query.tutor) filter.tutor = req.query.tutor;
  if (req.query.subject) filter.subject = req.query.subject;
  if (req.query.date) {
    const d = new Date(req.query.date);
    const end = new Date(d);
    end.setDate(end.getDate() + 1);
    filter.date = { $gte: d, $lt: end };
  }
  const b = await Booking.find(filter)
    .populate("student", "name email")
    .populate("tutor", "name email")
    .populate("subject", "name")
    .sort({ date: -1 })
    .limit(500);
  res.json(b);
});
r.post("/", allow("student"), async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    let created;
    await session.withTransaction(async () => {
      const a = await Availability.findOneAndUpdate(
        {
          _id: req.body.availability,
          booked: false,
          date: { $gt: new Date() },
        },
        { $set: { booked: true } },
        { new: true, session },
      );
      if (!a)
        throw Object.assign(
          new Error(
            "That slot is no longer available. Please choose another time.",
          ),
          { status: 409 },
        );
      created = await Booking.create(
        [
          {
            student: req.user._id,
            tutor: a.tutor,
            subject: a.subject,
            availability: a._id,
            date: a.date,
            startTime: a.startTime,
            endTime: a.endTime,
          },
        ],
        { session },
      );
    });
    const result = await Booking.findById(created[0]._id).populate(
      "student tutor subject",
    );
    res.status(201).json(result);
  } catch (e) {
    next(e);
  } finally {
    await session.endSession();
  }
});
r.patch("/:id/cancel", async (req, res, next) => {
  try {
    const filter = { _id: req.params.id, status: { $ne: "cancelled" } };
    if (req.user.role === "student") filter.student = req.user._id;
    else if (req.user.role === "tutor") filter.tutor = req.user._id;
    const b = await Booking.findOne(filter);
    if (!b)
      return res
        .status(404)
        .json({ message: "Booking not found or already cancelled." });
    if (new Date(b.date) <= new Date())
      return res
        .status(400)
        .json({ message: "Past sessions cannot be cancelled." });
    b.status = "cancelled";
    await b.save();
    await Availability.findByIdAndUpdate(b.availability, { booked: false });
    res.json({
      message: "Booking cancelled. The slot is available again.",
      booking: b,
    });
  } catch (e) {
    next(e);
  }
});
r.patch(
  "/:id/reschedule",
  allow("student", "admin"),
  async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
      let updated;
      await session.withTransaction(async () => {
        const filter = { _id: req.params.id, status: { $ne: "cancelled" } };
        if (req.user.role === "student") filter.student = req.user._id;
        const old = await Booking.findOne(filter).session(session);
        if (!old)
          throw Object.assign(new Error("Booking not found."), { status: 404 });
        if (new Date(old.date) <= new Date())
          throw Object.assign(
            new Error("Past bookings cannot be rescheduled."),
            { status: 400 },
          );
        const next = await Availability.findOneAndUpdate(
          {
            _id: req.body.availability,
            booked: false,
            date: { $gt: new Date() },
          },
          { $set: { booked: true } },
          { new: true, session },
        );
        if (!next)
          throw Object.assign(new Error("The selected slot is unavailable."), {
            status: 409,
          });
        await Availability.findByIdAndUpdate(
          old.availability,
          { $set: { booked: false } },
          { session },
        );
        old.availability = next._id;
        old.tutor = next.tutor;
        old.subject = next.subject;
        old.date = next.date;
        old.startTime = next.startTime;
        old.endTime = next.endTime;
        updated = await old.save({ session });
      });
      res.json(
        await Booking.findById(updated._id).populate("student tutor subject"),
      );
    } catch (e) {
      next(e);
    } finally {
      await session.endSession();
    }
  },
);
r.patch("/:id/status", allow("admin"), async (req, res) => {
  if (!["confirmed", "completed", "cancelled"].includes(req.body.status))
    return res.status(400).json({ message: "Invalid booking status." });
  const b = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true },
  ).populate("student tutor subject");
  if (!b) return res.status(404).json({ message: "Booking not found." });
  if (req.body.status === "cancelled")
    await Availability.findByIdAndUpdate(b.availability, { booked: false });
  res.json(b);
});
export default r;
