const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  phone: { type: String, required: true },
  site: { type: String, default: "Site A" },
  status: { type: String, default: "Active" }
});

module.exports = mongoose.model("Worker", workerSchema);
