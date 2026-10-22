import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    catalogKey: { type: String, unique: true, sparse: true },
    description: { type: String, default: "" },
    category: { type: String, default: "General" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export default mongoose.model("Subject", schema);
