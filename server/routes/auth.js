import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Subject from "../models/Subject.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
const router = Router();
const tokenFor = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  bio: user.bio,
  qualifications: user.qualifications,
  subjects: user.subjects,
  avatar: user.avatar,
  active: user.active,
});
router.post("/register", async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = "student",
      subjects = [],
      qualifications = "",
    } = req.body;
    if (
      !name?.trim() ||
      !email ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      !password ||
      password.length < 8
    )
      return res
        .status(400)
        .json({
          message:
            "Enter a name, valid email and password with at least 8 characters.",
        });
    if (!["student", "tutor"].includes(role))
      return res
        .status(400)
        .json({ message: "Choose either a student or tutor account." });
    if (!Array.isArray(subjects))
      return res.status(400).json({ message: "Choose valid tutor subjects." });
    let tutorSubjects = [];
    if (role === "tutor") {
      const uniqueSubjects = [...new Set(subjects)];
      if (
        !uniqueSubjects.length ||
        uniqueSubjects.some(
          (subjectId) =>
            typeof subjectId !== "string" ||
            !mongoose.isValidObjectId(subjectId),
        )
      )
        return res
          .status(400)
          .json({ message: "Tutors must select at least one valid subject." });
      tutorSubjects = await Subject.find({
        _id: { $in: uniqueSubjects },
        active: true,
      }).distinct("_id");
      if (tutorSubjects.length !== uniqueSubjects.length)
        return res
          .status(400)
          .json({ message: "One or more selected subjects are unavailable." });
    } else if (subjects.length) {
      return res
        .status(400)
        .json({ message: "Student accounts cannot be assigned tutor subjects." });
    }
    if (await User.exists({ email: email.toLowerCase() }))
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    const user = await User.create({
      name: name.trim(),
      email,
      password: await bcrypt.hash(password, 12),
      role,
      subjects: tutorSubjects,
      qualifications:
        role === "tutor" ? String(qualifications).trim().slice(0, 1000) : "",
    });
    res.status(201).json({ token: tokenFor(user), user: safeUser(user) });
  } catch (e) {
    next(e);
  }
});
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email: String(email || "").toLowerCase(),
    }).select("+password");
    if (
      !user ||
      !user.active ||
      !(await bcrypt.compare(password || "", user.password))
    )
      return res
        .status(401)
        .json({ message: "Email or password is incorrect." });
    res.json({ token: tokenFor(user), user: safeUser(user) });
  } catch (e) {
    next(e);
  }
});
router.get("/me", protect, (req, res) =>
  res.json({ user: safeUser(req.user) }),
);
router.put("/me", protect, async (req, res, next) => {
  try {
    const { name, phone, bio, qualifications, subjects } = req.body;
    if (!name?.trim())
      return res.status(400).json({ message: "Name is required." });
    if (subjects !== undefined && req.user.role !== "tutor")
      return res
        .status(400)
        .json({ message: "Only tutor accounts can choose teaching subjects." });
    if (req.user.role === "tutor" && subjects !== undefined) {
      if (
        !Array.isArray(subjects) ||
        subjects.some(
          (subjectId) =>
            typeof subjectId !== "string" ||
            !mongoose.isValidObjectId(subjectId),
        )
      )
        return res.status(400).json({ message: "Choose valid tutor subjects." });
      const uniqueSubjects = [...new Set(subjects)];
      const activeSubjects = await Subject.find({
        _id: { $in: uniqueSubjects },
        active: true,
      }).distinct("_id");
      if (activeSubjects.length !== uniqueSubjects.length)
        return res
          .status(400)
          .json({ message: "One or more selected subjects are unavailable." });
      req.user.subjects = activeSubjects;
    }
    req.user.name = name.trim();
    req.user.phone = String(phone || "").slice(0, 30);
    req.user.bio = String(bio || "").slice(0, 1000);
    if (req.user.role === "tutor")
      req.user.qualifications = String(qualifications || "").slice(0, 1000);
    await req.user.save();
    res.json({ user: safeUser(req.user) });
  } catch (e) {
    next(e);
  }
});
export default router;
