import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
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
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    booked: { type: Boolean, default: false },
  },
  { timestamps: true },
);
schema.index({ tutor: 1, date: 1, startTime: 1 }, { unique: true });
export default mongoose.model("Availability", schema);
