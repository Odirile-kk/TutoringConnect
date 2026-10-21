import { Router } from "express";
import mongoose from "mongoose";
import Availability from "../models/Availability.js";
import { authenticate, role } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);
const validId = (id) => mongoose.isValidObjectId(id);
const validDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;
const validTime = (v) => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const respondError = (res, error) => res.status(500).json({ message: "Could not process availability request." });

async function hasOverlap(tutor, date, startTime, endTime, excludeId) {
  return Availability.exists({ tutor, date, ...(excludeId ? { _id: { $ne: excludeId } } : {}), startTime: { $lt: endTime }, endTime: { $gt: startTime } });
}

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "tutor") filter.tutor = req.user.id;
    else if (req.query.tutor) {
      if (!validId(req.query.tutor)) return res.status(400).json({ message: "Invalid tutor ID." });
      filter.tutor = req.query.tutor;
    }
    const slots = await Availability.find(filter).populate("tutor", "name email").sort({ date: 1, startTime: 1 });
    res.json(slots);
  } catch (error) { respondError(res, error); }
});

router.post("/", role("tutor", "admin"), async (req, res) => {
  try {
    const tutor = req.user.role === "tutor" ? req.user.id : req.body.tutor;
    const { date, startTime, endTime } = req.body;
    if (!validId(tutor) || !validDate(date) || !validTime(startTime) || !validTime(endTime) || startTime >= endTime)
      return res.status(400).json({ message: "Provide a valid tutor, date and time range." });
    if (await hasOverlap(tutor, date, startTime, endTime))
      return res.status(409).json({ message: "This time overlaps an existing slot." });
    const slot = await Availability.create({ tutor, date, startTime, endTime, available: true });
    res.status(201).json(slot);
  } catch (error) { respondError(res, error); }
});

router.put("/:id", role("tutor", "admin"), async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid slot ID." });
    const slot = await Availability.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: "Slot not found." });
    if (req.user.role !== "admin" && String(slot.tutor) !== String(req.user.id))
      return res.status(403).json({ message: "Access denied." });
    if (!slot.available) return res.status(409).json({ message: "Booked slots cannot be edited." });
    const date = req.body.date ?? slot.date;
    const startTime = req.body.startTime ?? slot.startTime;
    const endTime = req.body.endTime ?? slot.endTime;
    if (!validDate(date) || !validTime(startTime) || !validTime(endTime) || startTime >= endTime)
      return res.status(400).json({ message: "Invalid date or time range." });
    if (await hasOverlap(slot.tutor, date, startTime, endTime, slot._id))
      return res.status(409).json({ message: "This time overlaps an existing slot." });
    slot.set({ date, startTime, endTime });
    await slot.save();
    res.json(slot);
  } catch (error) { respondError(res, error); }
});

router.delete("/:id", role("tutor", "admin"), async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid slot ID." });
    const slot = await Availability.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: "Slot not found." });
    if (req.user.role !== "admin" && String(slot.tutor) !== String(req.user.id))
      return res.status(403).json({ message: "Access denied." });
    if (!slot.available) return res.status(409).json({ message: "Booked slots cannot be deleted." });
    await slot.deleteOne();
    res.json({ message: "Availability deleted." });
  } catch (error) { respondError(res, error); }
});
export default router;
