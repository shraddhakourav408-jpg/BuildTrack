const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },

  type: {
    type: String,
    required: true,
    trim: true,
  },

  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    default: null,
  },

  site: {
    type: String,
    default: "Site A",
  },

  status: {
    type: String,
    enum: ["Active", "Maintenance", "Inactive"],
    default: "Active",
  },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);