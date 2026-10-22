import { Router } from "express";
import User from "../models/User.js";
import { protect, allow } from "../middleware/auth.js";
const r = Router();
r.use(protect, allow("admin"));
r.get("/", async (req, res) => {
  const q = String(req.query.search || "");
  const filter = q
    ? {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
      }
    : {};
  if (req.query.role) filter.role = req.query.role;
  res.json(
    await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(250)
      .populate("subjects", "name"),
  );
});
r.patch("/:id/active", async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ message: "User not found." });
  if (String(u._id) === String(req.user._id))
    return res
      .status(400)
      .json({ message: "You cannot deactivate your own account." });
  u.active = Boolean(req.body.active);
  await u.save();
  res.json({ message: "Account updated.", user: u });
});
r.patch("/:id/role", async (req, res) => {
  if (!["student", "tutor", "admin"].includes(req.body.role))
    return res.status(400).json({ message: "Invalid role." });
  const u = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true },
  ).select("-password");
  if (!u) return res.status(404).json({ message: "User not found." });
  res.json(u);
});
export default r;
