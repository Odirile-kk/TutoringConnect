import { Router } from "express";
import Subject from "../models/Subject.js";
import { protect, allow } from "../middleware/auth.js";
const r = Router();
r.get("/", async (req, res) => {
  const q = String(req.query.search || "");
  res.json(
    await Subject.find({
      active: true,
      ...(q ? { name: { $regex: q, $options: "i" } } : {}),
    }).sort({ name: 1 }),
  );
});
r.post("/", protect, allow("admin"), async (req, res, next) => {
  try {
    const s = await Subject.create({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
    });
    res.status(201).json(s);
  } catch (e) {
    next(e);
  }
});
r.put("/:id", protect, allow("admin"), async (req, res, next) => {
  try {
    const s = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
      },
      { new: true, runValidators: true },
    );
    if (!s) return res.status(404).json({ message: "Subject not found." });
    res.json(s);
  } catch (e) {
    next(e);
  }
});
r.delete("/:id", protect, allow("admin"), async (req, res) => {
  const s = await Subject.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true },
  );
  if (!s) return res.status(404).json({ message: "Subject not found." });
  res.json({ message: "Subject archived." });
});
export default r;
