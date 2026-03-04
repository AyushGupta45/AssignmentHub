import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    read: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["evaluation", "assignment", "system"],
      default: "system",
    },
    link: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for fast queries: user's unread notifications sorted by newest
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
