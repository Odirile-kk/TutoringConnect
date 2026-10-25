
import { Router } from "express";
import User from "../models/User.js";
import Rating from "../models/Rating.js";
import { protect, allow } from "../middleware/auth.js";

const r = Router();

// GET /api/tutors
// Public list: only active tutors.
r.get("/", async (req, res, next) => {
  try {
    const filter = { role: "tutor", active: true };

    if (req.query.subject) {
      filter.subjects = req.query.subject;
    }

    if (req.query.search) {
      const search = String(req.query.search).trim();

      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { qualifications: { $regex: search, $options: "i" } },
      ];
    }

    const tutors = await User.find(filter)
      .select("name email bio qualifications subjects avatar")
      .populate("subjects", "name description")
      .sort({ name: 1 });

    const stats = await Rating.aggregate([
      {
        $match: {
          type: "tutor",
          target: { $in: tutors.map((t) => t._id) },
        },
      },
      {
        $group: {
          _id: "$target",
          average: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const byTutor = new Map(
      stats.map((stat) => [String(stat._id), stat]),
    );

    res.json(
      tutors.map((tutor) => ({
        ...tutor.toJSON(),
        ratingAverage:
          byTutor.get(String(tutor._id))?.average || 0,
        ratingCount:
          byTutor.get(String(tutor._id))?.count || 0,
      })),
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/tutors/admin/list
// Admin only: retrieve ALL tutor accounts, active or inactive.
r.get(
  "/admin/list",
  protect,
  allow("admin"),
  async (req, res, next) => {
    try {
      const search = String(req.query.search || "").trim();

      const filter = { role: "tutor" };

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { bio: { $regex: search, $options: "i" } },
          {
            qualifications: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }

      const tutors = await User.find(filter)
        .select(
          "name email bio qualifications subjects avatar active createdAt",
        )
        .populate("subjects", "name description")
        .sort({ name: 1 });

      res.json(tutors);
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/tutors/:id
// Public details for one active tutor.
r.get("/:id", async (req, res, next) => {
  try {
    const tutor = await User.findOne({
      _id: req.params.id,
      role: "tutor",
      active: true,
    })
      .select("name bio qualifications subjects avatar")
      .populate("subjects", "name description");

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor not found.",
      });
    }

    const [summary, reviews] = await Promise.all([
      Rating.aggregate([
        {
          $match: {
            type: "tutor",
            target: tutor._id,
          },
        },
        {
          $group: {
            _id: null,
            average: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
      ]),
      Rating.find({
        type: "tutor",
        target: tutor._id,
      })
        .select("rating comment createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    res.json({
      ...tutor.toJSON(),
      ratingAverage: summary[0]?.average || 0,
      ratingCount: summary[0]?.count || 0,
      reviews,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/tutors
// Admin creates a tutor.
r.post("/", protect, allow("admin"), async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      qualifications,
      bio,
      subjects,
    } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Tutor password must contain at least 8 characters.",
      });
    }

    const bcrypt = (await import("bcryptjs")).default;

    const tutor = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role: "tutor",
      qualifications,
      bio,
      subjects,
    });

    res.status(201).json(
      await tutor.populate("subjects", "name"),
    );
  } catch (error) {
    next(error);
  }
});

// PUT /api/tutors/:id
// Admin updates a tutor.
r.put("/:id", protect, allow("admin"), async (req, res, next) => {
  try {
    const {
      name,
      bio,
      qualifications,
      subjects,
      avatar,
    } = req.body;

    const tutor = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "tutor",
      },
      {
        name,
        bio,
        qualifications,
        subjects,
        avatar,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .select("-password")
      .populate("subjects", "name");

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor not found.",
      });
    }

    res.json(tutor);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tutors/:id
// Admin deactivates a tutor.
r.delete("/:id", protect, allow("admin"), async (req, res, next) => {
  try {
    const tutor = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "tutor",
      },
      {
        active: false,
      },
      {
        new: true,
      },
    );

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor not found.",
      });
    }

    res.json({
      message: "Tutor deactivated.",
    });
  } catch (error) {
    next(error);
  }
});

export default r;

