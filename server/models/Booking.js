import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
const schema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    availability: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Availability",
      required: true,
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    meetingLink: {
      type: String,
      default: () =>
        `https://teams.microsoft.com/l/meetup-join/demo-${randomUUID()}`,
    },
    status: {
      type: String,
      enum: ["confirmed", "completed", "cancelled"],
      default: "confirmed",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);
schema.index({ availability: 1, status: 1 });
export default mongoose.model("Booking", schema);
