const mongoose = require("mongoose");

const fuelSchema = new mongoose.Schema(
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

    date: {
      type: String,
      required: true,
    },

    fuelType: {
      type: String,
      enum: ["Diesel", "Petrol", "CNG"],
      default: "Diesel",
    },

    litres: {
      type: Number,
      required: true,
      min: 0,
    },

    pricePerLitre: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    odometer: {
      type: Number,
      required: true,
      min: 0,
    },

    fuelStation: {
      type: String,
      default: "",
      trim: true,
    },

    previousOdometer: {
      type: Number,
      default: 0,
    },

    mileage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Fuel", fuelSchema);