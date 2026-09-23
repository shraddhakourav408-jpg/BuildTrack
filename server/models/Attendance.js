const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Leave"],
      required: true,
    },

    checkIn: {
      type: String,
      default: "",
    },

    checkOut: {
      type: String,
      default: "",
    },

    workingHours: {
      type: String,
      default: "0h 0m",
    },

    late: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index(
  { workerId: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "Attendance",
  attendanceSchema
);