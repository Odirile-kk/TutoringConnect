import { Router } from "express";
import mongoose from "mongoose";
import Availability from "../models/Availability.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";
import { protect, allow } from "../middleware/auth.js";
const r = Router();
r.get("/", async (req, res) => {
  const filter = { booked: false, date: { $gte: new Date() } };
  if (req.query.tutor) filter.tutor = req.query.tutor;
  if (req.query.subject) filter.subject = req.query.subject;
  res.json(
    await Availability.find(filter)
      .populate("tutor", "name bio qualifications avatar")
      .populate("subject", "name")
      .sort({ date: 1, startTime: 1 }),
  );
});
r.get("/mine", protect, allow("tutor", "admin"), async (req, res) => {
  const filter = req.user.role === "tutor" ? { tutor: req.user._id } : {};
  res.json(
    await Availability.find(filter)
      .populate("tutor", "name")
      .populate("subject", "name")
      .sort({ date: 1 }),
  );
});
r.post("/", protect, allow("admin", "tutor"), async (req, res, next) => {
  try {
    const { tutor, subject, date, startTime, endTime } = req.body;
    const tutorId = req.user.role === "tutor" ? req.user._id : tutor;
    if (
      !tutorId ||
      !subject ||
      !date ||
      !startTime ||
      !endTime ||
      !mongoose.isValidObjectId(subject) ||
      startTime >= endTime ||
      new Date(date) <= new Date()
    )
      return res
        .status(400)
        .json({ message: "Choose a future date and a valid start/end time." });
    const validTutor = await User.exists({
      _id: tutorId,
      role: "tutor",
      active: true,
    });
    if (!validTutor)
      return res.status(400).json({ message: "Select an active tutor." });
    const validSubject = await Subject.exists({ _id: subject, active: true });
    if (!validSubject)
      return res.status(400).json({ message: "Select an active subject." });
    const existing = await Availability.findOne({
      tutor: tutorId,
      date: new Date(date),
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });
    if (existing)
      return res
        .status(409)
        .json({ message: "This time overlaps an existing availability slot." });
    const a = await Availability.create({
      tutor: tutorId,
      subject,
      date: new Date(date),
      startTime,
      endTime,
    });
    await User.updateOne(
      { _id: tutorId },
      { $addToSet: { subjects: subject } },
    );
    res.status(201).json(a);
  } catch (e) {
    next(e);
  }
});
r.put("/:id", protect, allow("admin", "tutor"), async (req, res, next) => {
  try {
    const filter = { _id: req.params.id, booked: false };
    if (req.user.role === "tutor") filter.tutor = req.user._id;
    const { subject, date, startTime, endTime } = req.body;
    if (
      !subject ||
      !mongoose.isValidObjectId(subject) ||
      !date ||
      !startTime ||
      !endTime ||
      startTime >= endTime ||
      new Date(date) <= new Date()
    )
      return res
        .status(400)
        .json({ message: "Choose a future date and a valid start/end time." });
    const validSubject = await Subject.exists({ _id: subject, active: true });
    if (!validSubject)
      return res.status(400).json({ message: "Select an active subject." });
    const a = await Availability.findOneAndUpdate(
      filter,
      {
        subject,
        date,
        startTime,
        endTime,
      },
      { new: true, runValidators: true },
    );
    if (!a)
      return res
        .status(404)
        .json({ message: "Available slot not found or already booked." });
    await User.updateOne(
      { _id: a.tutor },
      { $addToSet: { subjects: subject } },
    );
    res.json(a);
  } catch (e) {
    next(e);
  }
});
r.delete("/:id", protect, allow("admin", "tutor"), async (req, res) => {
  const filter = { _id: req.params.id, booked: false };
  if (req.user.role === "tutor") filter.tutor = req.user._id;
  const a = await Availability.findOneAndDelete(filter);
  if (!a)
    return res
      .status(404)
      .json({ message: "Slot not found or already booked." });
  res.json({ message: "Availability removed." });
});
export default r;
