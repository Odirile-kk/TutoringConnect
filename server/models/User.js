import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["student", "tutor", "admin"],
      default: "student",
    },
    phone: { type: String, default: "" },
    bio: { type: String, default: "" },
    qualifications: { type: String, default: "" },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    avatar: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export default mongoose.model("User", userSchema);
