const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCost: {
      type: Number,
      default: 0,
    },

    date: {
      type: String,
      required: true,
    },

    note: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

const requestSchema = new mongoose.Schema(
  {
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    requestedBy: {
      type: String,
      default: "Site Manager",
    },

    date: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Issued", "Rejected"],
      default: "Pending",
    },

    note: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

const materialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    minimumStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    site: {
      type: String,
      default: "Site A",
      trim: true,
    },

    supplierName: {
      type: String,
      default: "",
      trim: true,
    },

    supplierPhone: {
      type: String,
      default: "",
      trim: true,
    },

    purchasePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    transactions: [transactionSchema],

    requests: [requestSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Material", materialSchema);