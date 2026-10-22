import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    type: { type: String, enum: ["tutor", "platform"], required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    target: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { timestamps: true },
);

schema.index(
  { booking: 1 },
  { unique: true, partialFilterExpression: { type: "tutor" } },
);
schema.index(
  { type: 1, author: 1 },
  { unique: true, partialFilterExpression: { type: "platform" } },
);

export default mongoose.model("Rating", schema);
