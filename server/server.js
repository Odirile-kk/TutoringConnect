// Starts the Express API, wires up route handlers, and connects the app to MongoDB.
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { MONGODB_URI, PORT } from "./config.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import subjectRoutes from "./routes/subjects.js";
import tutorRoutes from "./routes/tutors.js";
import availabilityRoutes from "./routes/availability.js";
import bookingRoutes from "./routes/bookings.js";
import ratingRoutes from "./routes/ratings.js";
import supportRoutes from "./routes/support.js";
import adminRoutes from "./routes/admin.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true, message: "API running" }));
app.use("/api/auth", authRoutes);
app.use("/api/me", profileRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/admin", adminRoutes);

if (!MONGODB_URI) {
  console.error(
    "MongoDB connection failed: MONGODB_URI is not set. Create server/.env using server/.env.example and set the connection string."
  );
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected.");
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
  })
  .catch((error) => console.error("MongoDB connection failed:", error.message));
