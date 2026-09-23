const mongoose = require("mongoose");

const partSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const maintenanceSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
    },

    maintenanceType: {
      type: String,
      enum: [
        "Preventive",
        "Repair",
        "Service",
        "Emergency",
        "Inspection",
      ],
      default: "Service",
    },

    date: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: [
        "Scheduled",
        "In Progress",
        "Completed",
        "Cancelled",
      ],
      default: "Scheduled",
    },

    odometer: {
      type: Number,
      default: 0,
      min: 0,
    },

    nextServiceDate: {
      type: String,
      default: "",
    },

    nextServiceKm: {
      type: Number,
      default: 0,
      min: 0,
    },

    mechanicName: {
      type: String,
      default: "",
      trim: true,
    },

    mechanicPhone: {
      type: String,
      default: "",
      trim: true,
    },

    garageName: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    parts: [partSchema],

    partsCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    labourCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    otherCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    breakdown: {
      type: Boolean,
      default: false,
    },

    breakdownDetails: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Maintenance",
  maintenanceSchema
);