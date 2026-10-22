import { Router } from "express";
import Booking from "../models/Booking.js";
import Rating from "../models/Rating.js";
import { protect, allow } from "../middleware/auth.js";

const r = Router();
r.use(protect);

const isValidRating = (rating) =>
  Number.isInteger(rating) && rating >= 1 && rating <= 5;
const isValidComment = (comment) =>
  comment === undefined || (typeof comment === "string" && comment.length <= 1000);

r.get("/mine", async (req, res) => {
  const [tutorRatings, platformRating] = await Promise.all([
    Rating.find({ type: "tutor", author: req.user._id })
      .select("booking rating comment")
      .lean(),
    Rating.findOne({ type: "platform", author: req.user._id })
      .select("rating comment")
      .lean(),
  ]);
  res.json({ tutorRatings, platformRating });
});

r.get("/platform", async (req, res) => {
  const [summary] = await Rating.aggregate([
    { $match: { type: "platform" } },
    {
      $group: {
        _id: null,
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  const ownRating = await Rating.findOne({
    type: "platform",
    author: req.user._id,
  })
    .select("rating comment")
    .lean();
  res.json({
    average: summary?.average || 0,
    count: summary?.count || 0,
    ownRating,
  });
});

r.post("/platform", allow("student", "tutor"), async (req, res, next) => {
  const { rating, comment } = req.body;
  if (!isValidRating(rating) || !isValidComment(comment))
    return res.status(400).json({ message: "Choose 1–5 stars and a comment up to 1000 characters." });
  try {
    const saved = await Rating.findOneAndUpdate(
      { type: "platform", author: req.user._id },
      {
        $set: {
          rating,
          comment: comment?.trim() || "",
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).select("rating comment");
    res.json(saved);
  } catch (error) {
    next(error);
  }
});

r.post("/tutor/:bookingId", allow("student"), async (req, res, next) => {
  const { rating, comment } = req.body;
  if (!isValidRating(rating) || !isValidComment(comment))
    return res.status(400).json({ message: "Choose 1–5 stars and a comment up to 1000 characters." });
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      student: req.user._id,
      status: "completed",
    });
    if (!booking)
      return res.status(404).json({
        message: "Only completed sessions can be reviewed.",
      });
    const existing = await Rating.findOne({
      type: "tutor",
      booking: booking._id,
    });
    if (existing)
      return res.status(409).json({ message: "You have already rated this session." });
    const saved = await Rating.create({
      type: "tutor",
      author: req.user._id,
      target: booking.tutor,
      booking: booking._id,
      rating,
      comment: comment?.trim() || "",
    });
    res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000)
      return res.status(409).json({ message: "You have already rated this session." });
    next(error);
  }
});

export default r;
