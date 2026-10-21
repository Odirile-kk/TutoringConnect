// Tutor availability routes. Slots can be viewed by logged-in users; tutors manage their own slots.
import { Router } from "express";
import mongoose from "mongoose";
import Availability from "../models/Availability.js";
import User from "../models/User.js";
import { authenticate, role } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const filter = {};
    const currentUserId = String(req.user.id || req.user._id);
    if (req.user.role === "tutor") {
      if (req.query.tutor && String(req.query.tutor) !== currentUserId) {
        return res.status(403).json({ message: "You may only view your own availability." });
      }
      filter.tutor = currentUserId;
    } else if (req.query.tutor) {
      if (!mongoose.isValidObjectId(req.query.tutor)) return res.status(400).json({ message: "Invalid tutor ID." });
      filter.tutor = req.query.tutor;
    }
    if (req.query.available === "true") filter.available = true;
    if (req.query.available === "false") filter.available = false;
    const slots = await Availability.find(filter).populate("tutor", "name email").sort({ date: 1, startTime: 1 });
    res.json(slots);
  } catch (error) {
    console.error("Failed to load availability:", error);
    res.status(500).json({ message: "Unable to retrieve availability." });
  }
});

router.post("/", role("tutor", "admin"), async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!date || !startTime || !endTime || !validTime.test(startTime) || !validTime.test(endTime) || startTime >= endTime) {
      return res.status(400).json({ message: "Provide a valid date, start time and end time." });
    }
    let tutorId = req.user.id || req.user._id;
    if (req.user.role === "admin") {
      if (!req.body.tutor || !mongoose.isValidObjectId(req.body.tutor)) return res.status(400).json({ message: "Select a valid tutor." });
      const target = await User.findById(req.body.tutor);
      if (!target || target.role !== "tutor") return res.status(400).json({ message: "The selected account is not a tutor." });
      tutorId = target._id;
    }
    const slot = await Availability.create({ tutor: tutorId, date, startTime, endTime, available: true });
    res.status(201).json(slot);
  } catch (error) {
    res.status(400).json({ message: error.message || "Unable to create availability." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const item = await Availability.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Availability not found." });
    const isOwner = String(item.tutor) === String(req.user.id || req.user._id);
    if (!isOwner && req.user.role !== "admin") return res.status(403).json({ message: "Access denied." });
    if (!item.available) return res.status(400).json({ message: "A booked slot cannot be deleted." });
    await item.deleteOne();
    res.json({ message: "Availability deleted." });
  } catch (error) {
    res.status(400).json({ message: "Invalid availability ID." });
  }
});

export default router;

