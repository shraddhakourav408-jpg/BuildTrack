const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Worker = require("./models/Worker");
const Attendance = require("./models/Attendance");
const Vehicle = require("./models/Vehicle");
const Fuel = require("./models/Fuel");
const Material = require("./models/Material");
const Maintenance = require("./models/Maintenance");
console.log("Vehicle Model:", typeof Vehicle);


const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());


// =====================================================
// MONGODB
// =====================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });


// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
  res.json({
    message: "BuildTrack Backend is running 🚀",
  });
});


// =====================================================
// WORKER APIs
// =====================================================


// ADD WORKER
app.post("/api/workers", async (req, res) => {
  try {
    const worker = await Worker.create(req.body);

    res.status(201).json(worker);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
});


// GET WORKERS
app.get("/api/workers", async (req, res) => {
  try {
    const workers = await Worker.find();

    res.json(workers);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});


// UPDATE WORKER
app.put("/api/workers/:id", async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!worker) {
      return res.status(404).json({
        error: "Worker not found",
      });
    }

    res.json(worker);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
});


// DELETE WORKER
app.delete("/api/workers/:id", async (req, res) => {
  try {
    await Worker.findByIdAndDelete(req.params.id);

    await Attendance.deleteMany({
      workerId: req.params.id,
    });

    // If deleted worker was assigned to any vehicle,
    // automatically remove that driver assignment.
    await Vehicle.updateMany(
      {
        driver: req.params.id,
      },
      {
        $set: {
          driver: null,
        },
      }
    );

    res.json({
      message: "Worker deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});


// =====================================================
// VEHICLE APIs
// =====================================================


// ADD VEHICLE
app.post("/api/vehicles", async (req, res) => {
  try {
    const {
      number,
      type,
      driver,
      site,
      status,
    } = req.body;

    if (!number || !type) {
      return res.status(400).json({
        error: "Vehicle number and type are required",
      });
    }

    // Check duplicate vehicle number
    const existingVehicle = await Vehicle.findOne({
      number: number.trim().toUpperCase(),
    });

    if (existingVehicle) {
      return res.status(400).json({
        error: "Vehicle with this number already exists",
      });
    }

    // Check driver if supplied
    if (driver) {
      const worker = await Worker.findById(driver);

      if (!worker) {
        return res.status(404).json({
          error: "Selected driver/worker not found",
        });
      }
    }

    const vehicle = await Vehicle.create({
      number: number.trim().toUpperCase(),
      type,
      driver: driver || null,
      site: site || "Site A",
      status: status || "Active",
    });

    const populatedVehicle = await Vehicle.findById(
      vehicle._id
    ).populate("driver", "name role phone status site");

    res.status(201).json(populatedVehicle);

  } catch (err) {
    console.error("Add vehicle error:", err);

    res.status(400).json({
      error: err.message,
    });
  }
});


// GET ALL VEHICLES
app.get("/api/vehicles", async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .populate(
        "driver",
        "name role phone status site"
      )
      .sort({ createdAt: -1 });

    res.json(vehicles);

  } catch (err) {
    console.error("Get vehicles error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});


// GET SINGLE VEHICLE
app.get("/api/vehicles/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(
      req.params.id
    ).populate(
      "driver",
      "name role phone status site"
    );

    if (!vehicle) {
      return res.status(404).json({
        error: "Vehicle not found",
      });
    }

    res.json(vehicle);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});


// UPDATE VEHICLE
app.put("/api/vehicles/:id", async (req, res) => {
  try {
    const {
      number,
      type,
      driver,
      site,
      status,
    } = req.body;

    if (!number || !type) {
      return res.status(400).json({
        error: "Vehicle number and type are required",
      });
    }

    // Check driver
    if (driver) {
      const worker = await Worker.findById(driver);

      if (!worker) {
        return res.status(404).json({
          error: "Selected driver/worker not found",
        });
      }
    }

    // Check duplicate vehicle number
    const duplicate = await Vehicle.findOne({
      number: number.trim().toUpperCase(),
      _id: { $ne: req.params.id },
    });

    if (duplicate) {
      return res.status(400).json({
        error: "Another vehicle already uses this number",
      });
    }

    const vehicle =
      await Vehicle.findByIdAndUpdate(
        req.params.id,
        {
          number: number.trim().toUpperCase(),
          type,
          driver: driver || null,
          site: site || "Site A",
          status: status || "Active",
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "driver",
        "name role phone status site"
      );

    if (!vehicle) {
      return res.status(404).json({
        error: "Vehicle not found",
      });
    }

    res.json(vehicle);

  } catch (err) {
    console.error("Update vehicle error:", err);

    res.status(400).json({
      error: err.message,
    });
  }
});


// DELETE VEHICLE
app.delete("/api/vehicles/:id", async (req, res) => {
  try {
    const vehicle =
      await Vehicle.findByIdAndDelete(
        req.params.id
      );

    if (!vehicle) {
      return res.status(404).json({
        error: "Vehicle not found",
      });
    }

    res.json({
      message: "Vehicle deleted successfully",
    });

  } catch (err) {
    console.error("Delete vehicle error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});


// =====================================================
// ATTENDANCE APIs
// =====================================================


// GET ATTENDANCE
app.get("/api/attendance", async (req, res) => {
  try {
    const { date, month } = req.query;

    if (date) {
      const records = await Attendance.find({
        date: date,
      });

      return res.json(records);
    }

    if (month) {
      const records = await Attendance.find({
        date: {
          $regex: `^${month}`,
        },
      });

      return res.json(records);
    }

    const records = await Attendance.find();

    res.json(records);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});


// =====================================================
// SAVE / UPDATE ATTENDANCE
// =====================================================

app.put("/api/attendance", async (req, res) => {
  try {
    const {
      workerId,
      date,
      status,
      checkIn,
      checkOut,
    } = req.body;

    if (!workerId || !date) {
      return res.status(400).json({
        error: "Worker and date are required",
      });
    }

    if (
      status &&
      !["Present", "Absent", "Leave"].includes(status)
    ) {
      return res.status(400).json({
        error: "Invalid attendance status",
      });
    }

    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({
        error: "Worker not found",
      });
    }

    let existing = await Attendance.findOne({
      workerId,
      date,
    });

    const finalStatus =
      status ||
      existing?.status ||
      "Present";

    const finalCheckIn =
      checkIn !== undefined
        ? checkIn
        : existing?.checkIn || "";

    const finalCheckOut =
      checkOut !== undefined
        ? checkOut
        : existing?.checkOut || "";

    // =================================================
    // CALCULATE WORKING HOURS
    // =================================================

    let workingHours = "0h 0m";

    if (finalCheckIn && finalCheckOut) {
      const [inHour, inMinute] =
        finalCheckIn.split(":").map(Number);

      const [outHour, outMinute] =
        finalCheckOut.split(":").map(Number);

      const start =
        inHour * 60 + inMinute;

      const end =
        outHour * 60 + outMinute;

      if (end >= start) {
        const totalMinutes =
          end - start;

        const hours =
          Math.floor(totalMinutes / 60);

        const minutes =
          totalMinutes % 60;

        workingHours =
          `${hours}h ${minutes}m`;
      }
    }

    // =================================================
    // LATE CHECK
    // =================================================

    let late = false;

    if (finalCheckIn) {
      const [hour, minute] =
        finalCheckIn.split(":").map(Number);

      const checkInMinutes =
        hour * 60 + minute;

      const officeStart =
        9 * 60;

      late =
        checkInMinutes >= officeStart;
    }

    const attendance =
      await Attendance.findOneAndUpdate(
        {
          workerId,
          date,
        },
        {
          workerId,
          date,
          status: finalStatus,
          checkIn: finalCheckIn,
          checkOut: finalCheckOut,
          workingHours,
          late,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

    res.json(attendance);

  } catch (err) {
    console.error(
      "Attendance save error:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
});


// =====================================================
// DELETE ATTENDANCE
// =====================================================

app.delete("/api/attendance", async (req, res) => {
  try {
    const {
      workerId,
      date,
    } = req.query;

    if (!workerId || !date) {
      return res.status(400).json({
        error:
          "Worker ID and date are required",
      });
    }

    await Attendance.findOneAndDelete({
      workerId,
      date,
    });

    res.json({
      message:
        "Attendance deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});


// =====================================================
// START SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

  // =====================================================
// VEHICLE APIs
// =====================================================

// GET ALL VEHICLES
app.get("/api/vehicles", async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .populate("driver", "name role phone");

    res.json(vehicles);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});


// ADD VEHICLE
app.post("/api/vehicles", async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);

    const populatedVehicle =
      await Vehicle.findById(vehicle._id)
        .populate("driver", "name role phone");

    res.status(201).json(populatedVehicle);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
});


// DELETE VEHICLE
app.delete("/api/vehicles/:id", async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);

    await Fuel.deleteMany({
      vehicleId: req.params.id,
    });

    res.json({
      message: "Vehicle deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});


// =====================================================
// FUEL MANAGEMENT APIs
// =====================================================


// GET FUEL RECORDS
app.get("/api/fuel", async (req, res) => {
  try {
    const { vehicleId, month } = req.query;

    let query = {};

    if (vehicleId) {
      query.vehicleId = vehicleId;
    }

    if (month) {
      query.date = {
        $regex: `^${month}`,
      };
    }

    const records = await Fuel.find(query)
      .populate({
        path: "vehicleId",
        select: "number type site driver",
        populate: {
          path: "driver",
          select: "name role",
        },
      })
      .populate("driverId", "name role")
      .sort({ date: -1, createdAt: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});


// ADD FUEL
app.post("/api/fuel", async (req, res) => {
  try {
    const {
      vehicleId,
      date,
      fuelType,
      litres,
      pricePerLitre,
      odometer,
      fuelStation,
    } = req.body;

    if (
      !vehicleId ||
      !date ||
      !litres ||
      pricePerLitre === undefined ||
      odometer === undefined
    ) {
      return res.status(400).json({
        error: "Please fill all required fields",
      });
    }

    const vehicle = await Vehicle.findById(vehicleId)
      .populate("driver", "name role");

    if (!vehicle) {
      return res.status(404).json({
        error: "Vehicle not found",
      });
    }

    // Find previous fuel record
    const previousRecord = await Fuel.findOne({
      vehicleId,
    }).sort({
      odometer: -1,
    });

    const previousOdometer =
      previousRecord?.odometer || 0;

    const currentOdometer =
      Number(odometer);

    let mileage = 0;

    if (
      previousOdometer > 0 &&
      currentOdometer > previousOdometer
    ) {
      const distance =
        currentOdometer - previousOdometer;

      mileage =
        Number(
          (distance / Number(litres)).toFixed(2)
        );
    }

    const totalAmount =
      Number(litres) *
      Number(pricePerLitre);

    const fuel = await Fuel.create({
      vehicleId,
      driverId: vehicle.driver?._id || null,
      date,
      fuelType: fuelType || "Diesel",
      litres: Number(litres),
      pricePerLitre: Number(pricePerLitre),
      totalAmount: Number(totalAmount.toFixed(2)),
      odometer: currentOdometer,
      fuelStation: fuelStation || "",
      previousOdometer,
      mileage,
    });

    const result = await Fuel.findById(fuel._id)
      .populate({
        path: "vehicleId",
        select: "number type site driver",
        populate: {
          path: "driver",
          select: "name role",
        },
      })
      .populate("driverId", "name role");

    res.status(201).json(result);
  } catch (err) {
    console.error("Fuel save error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});


// DELETE FUEL RECORD
app.delete("/api/fuel/:id", async (req, res) => {
  try {
    const fuel = await Fuel.findByIdAndDelete(
      req.params.id
    );

    if (!fuel) {
      return res.status(404).json({
        error: "Fuel record not found",
      });
    }

    res.json({
      message: "Fuel record deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});


// FUEL DASHBOARD
app.get("/api/fuel/stats", async (req, res) => {
  try {
    const records = await Fuel.find();

    const totalLitres = records.reduce(
      (sum, item) =>
        sum + Number(item.litres || 0),
      0
    );

    const totalCost = records.reduce(
      (sum, item) =>
        sum + Number(item.totalAmount || 0),
      0
    );

    const averagePrice =
      totalLitres > 0
        ? totalCost / totalLitres
        : 0;

    const vehiclesUsed =
      new Set(
        records.map((item) =>
          item.vehicleId.toString()
        )
      ).size;

    res.json({
      totalLitres: Number(totalLitres.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      averagePrice: Number(
        averagePrice.toFixed(2)
      ),
      vehiclesUsed,
      totalEntries: records.length,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
// ======================================================
// MATERIAL MANAGEMENT APIs
// ======================================================

// GET ALL MATERIALS
app.get("/api/materials", async (req, res) => {
  try {
    const materials = await Material.find().sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    console.error("Get materials error:", error);
    res.status(500).json({
      message: "Failed to load materials",
    });
  }
});


// GET SINGLE MATERIAL
app.get("/api/materials/:id", async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    res.json(material);
  } catch (error) {
    console.error("Get material error:", error);

    res.status(500).json({
      message: "Failed to load material",
    });
  }
});


// CREATE MATERIAL
app.post("/api/materials", async (req, res) => {
  try {
    const {
      name,
      category,
      unit,
      currentStock,
      minimumStock,
      site,
      supplierName,
      supplierPhone,
      purchasePrice,
    } = req.body;

    if (!name || !category || !unit) {
      return res.status(400).json({
        message: "Name, category and unit are required",
      });
    }

    const material = new Material({
      name: name.trim(),
      category: category.trim(),
      unit: unit.trim(),
      currentStock: Number(currentStock) || 0,
      minimumStock: Number(minimumStock) || 0,
      site: site || "Site A",
      supplierName: supplierName || "",
      supplierPhone: supplierPhone || "",
      purchasePrice: Number(purchasePrice) || 0,
      transactions: [],
      requests: [],
    });

    await material.save();

    res.status(201).json(material);
  } catch (error) {
    console.error("Create material error:", error);

    res.status(500).json({
      message: "Failed to create material",
    });
  }
});


// UPDATE MATERIAL MASTER
app.put("/api/materials/:id", async (req, res) => {
  try {
    const {
      name,
      category,
      unit,
      minimumStock,
      site,
      supplierName,
      supplierPhone,
      purchasePrice,
    } = req.body;

    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    material.name = name ?? material.name;
    material.category = category ?? material.category;
    material.unit = unit ?? material.unit;
    material.minimumStock =
      Number(minimumStock) >= 0
        ? Number(minimumStock)
        : material.minimumStock;

    material.site = site ?? material.site;
    material.supplierName = supplierName ?? material.supplierName;
    material.supplierPhone = supplierPhone ?? material.supplierPhone;

    material.purchasePrice =
      Number(purchasePrice) >= 0
        ? Number(purchasePrice)
        : material.purchasePrice;

    await material.save();

    res.json(material);
  } catch (error) {
    console.error("Update material error:", error);

    res.status(500).json({
      message: "Failed to update material",
    });
  }
});


// DELETE MATERIAL
app.delete("/api/materials/:id", async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    res.json({
      message: "Material deleted successfully",
    });
  } catch (error) {
    console.error("Delete material error:", error);

    res.status(500).json({
      message: "Failed to delete material",
    });
  }
});


// ======================================================
// STOCK IN / STOCK OUT
// ======================================================

app.post("/api/materials/:id/stock", async (req, res) => {
  try {
    const {
      type,
      quantity,
      price,
      date,
      note,
    } = req.body;

    if (!["IN", "OUT"].includes(type)) {
      return res.status(400).json({
        message: "Invalid stock type",
      });
    }

    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    if (type === "OUT" && material.currentStock < qty) {
      return res.status(400).json({
        message: `Insufficient stock. Available stock: ${material.currentStock} ${material.unit}`,
      });
    }

    const entryPrice =
      Number(price) >= 0
        ? Number(price)
        : material.purchasePrice || 0;

    const totalCost = qty * entryPrice;

    if (type === "IN") {
      material.currentStock += qty;

      material.purchasePrice = entryPrice;
    } else {
      material.currentStock -= qty;
    }

    material.transactions.unshift({
      type,
      quantity: qty,
      price: entryPrice,
      totalCost,
      date: date || new Date().toISOString().split("T")[0],
      note: note || "",
    });

    await material.save();

    res.json(material);
  } catch (error) {
    console.error("Stock update error:", error);

    res.status(500).json({
      message: "Failed to update stock",
    });
  }
});


// ======================================================
// MATERIAL REQUEST
// ======================================================

app.post("/api/materials/:id/request", async (req, res) => {
  try {
    const {
      quantity,
      requestedBy,
      date,
      note,
    } = req.body;

    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      return res.status(400).json({
        message: "Valid quantity is required",
      });
    }

    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    material.requests.unshift({
      quantity: qty,
      requestedBy: requestedBy || "Site Manager",
      date: date || new Date().toISOString().split("T")[0],
      status: "Pending",
      note: note || "",
    });

    await material.save();

    res.json(material);
  } catch (error) {
    console.error("Material request error:", error);

    res.status(500).json({
      message: "Failed to create material request",
    });
  }
});


// ======================================================
// APPROVE / REJECT MATERIAL REQUEST
// ======================================================

app.put(
  "/api/materials/:materialId/request/:requestId",
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatus = [
        "Pending",
        "Approved",
        "Issued",
        "Rejected",
      ];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid request status",
        });
      }

      const material = await Material.findById(
        req.params.materialId
      );

      if (!material) {
        return res.status(404).json({
          message: "Material not found",
        });
      }

      const request = material.requests.id(
        req.params.requestId
      );

      if (!request) {
        return res.status(404).json({
          message: "Request not found",
        });
      }

      // When request is issued, automatically deduct stock.
      if (
        status === "Issued" &&
        request.status !== "Issued"
      ) {
        if (material.currentStock < request.quantity) {
          return res.status(400).json({
            message: `Insufficient stock. Available: ${material.currentStock} ${material.unit}`,
          });
        }

        material.currentStock -= request.quantity;

        material.transactions.unshift({
          type: "OUT",
          quantity: request.quantity,
          price: material.purchasePrice || 0,
          totalCost:
            request.quantity *
            (material.purchasePrice || 0),
          date:
            new Date()
              .toISOString()
              .split("T")[0],
          note: `Issued against material request`,
        });
      }

      request.status = status;

      await material.save();

      res.json(material);
    } catch (error) {
      console.error("Request status error:", error);

      res.status(500).json({
        message: "Failed to update request",
      });
    }
  }
);
// ======================================================
// MAINTENANCE MANAGEMENT APIs
// ======================================================


// GET ALL MAINTENANCE
app.get("/api/maintenance", async (req, res) => {
  try {
    const records = await Maintenance.find()
      .populate(
        "vehicleId",
        "number type site status driver"
      )
      .populate(
        "driverId",
        "name role phone status site"
      )
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    console.error("Get maintenance error:", error);

    res.status(500).json({
      message: "Failed to load maintenance records",
    });
  }
});


// GET SINGLE MAINTENANCE
app.get("/api/maintenance/:id", async (req, res) => {
  try {
    const record = await Maintenance.findById(
      req.params.id
    )
      .populate(
        "vehicleId",
        "number type site status driver"
      )
      .populate(
        "driverId",
        "name role phone status site"
      );

    if (!record) {
      return res.status(404).json({
        message: "Maintenance record not found",
      });
    }

    res.json(record);
  } catch (error) {
    console.error("Get maintenance error:", error);

    res.status(500).json({
      message: "Failed to load maintenance record",
    });
  }
});


// CREATE MAINTENANCE
app.post("/api/maintenance", async (req, res) => {
  try {
    const {
      vehicleId,
      maintenanceType,
      date,
      description,
      priority,
      status,
      odometer,
      nextServiceDate,
      nextServiceKm,
      mechanicName,
      mechanicPhone,
      garageName,
      location,
      parts,
      labourCost,
      otherCost,
      breakdown,
      breakdownDetails,
    } = req.body;

    if (!vehicleId) {
      return res.status(400).json({
        message: "Vehicle is required",
      });
    }

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    let driverId = vehicle.driver || null;

    const safeParts = Array.isArray(parts)
      ? parts
          .filter((part) => part.name)
          .map((part) => {
            const quantity =
              Number(part.quantity) || 0;

            const price =
              Number(part.price) || 0;

            return {
              name: part.name.trim(),
              quantity,
              price,
              total: quantity * price,
            };
          })
      : [];

    const partsCost = safeParts.reduce(
      (sum, part) => sum + part.total,
      0
    );

    const safeLabour = Number(labourCost) || 0;
    const safeOther = Number(otherCost) || 0;

    const totalCost =
      partsCost +
      safeLabour +
      safeOther;

    const record = new Maintenance({
      vehicleId,
      driverId,

      maintenanceType:
        maintenanceType || "Service",

      date,

      description:
        description || "",

      priority:
        priority || "Medium",

      status:
        status || "Scheduled",

      odometer:
        Number(odometer) || 0,

      nextServiceDate:
        nextServiceDate || "",

      nextServiceKm:
        Number(nextServiceKm) || 0,

      mechanicName:
        mechanicName || "",

      mechanicPhone:
        mechanicPhone || "",

      garageName:
        garageName || "",

      location:
        location || "",

      parts: safeParts,

      partsCost,

      labourCost: safeLabour,

      otherCost: safeOther,

      totalCost,

      breakdown:
        Boolean(breakdown),

      breakdownDetails:
        breakdownDetails || "",
    });

    await record.save();

    const populatedRecord =
      await Maintenance.findById(record._id)
        .populate(
          "vehicleId",
          "number type site status driver"
        )
        .populate(
          "driverId",
          "name role phone status site"
        );

    res.status(201).json(
      populatedRecord
    );
  } catch (error) {
    console.error(
      "Create maintenance error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create maintenance record",
    });
  }
});


// UPDATE MAINTENANCE
app.put("/api/maintenance/:id", async (req, res) => {
  try {
    const {
      vehicleId,
      maintenanceType,
      date,
      description,
      priority,
      status,
      odometer,
      nextServiceDate,
      nextServiceKm,
      mechanicName,
      mechanicPhone,
      garageName,
      location,
      parts,
      labourCost,
      otherCost,
      breakdown,
      breakdownDetails,
    } = req.body;

    const record =
      await Maintenance.findById(
        req.params.id
      );

    if (!record) {
      return res.status(404).json({
        message: "Maintenance record not found",
      });
    }

    const vehicle =
      await Vehicle.findById(
        vehicleId || record.vehicleId
      );

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    const safeParts = Array.isArray(parts)
      ? parts
          .filter((part) => part.name)
          .map((part) => {
            const quantity =
              Number(part.quantity) || 0;

            const price =
              Number(part.price) || 0;

            return {
              name: part.name.trim(),
              quantity,
              price,
              total: quantity * price,
            };
          })
      : [];

    const partsCost = safeParts.reduce(
      (sum, part) => sum + part.total,
      0
    );

    const safeLabour =
      Number(labourCost) || 0;

    const safeOther =
      Number(otherCost) || 0;

    const totalCost =
      partsCost +
      safeLabour +
      safeOther;

    record.vehicleId =
      vehicleId || record.vehicleId;

    record.driverId =
      vehicle.driver || null;

    record.maintenanceType =
      maintenanceType ||
      record.maintenanceType;

    record.date =
      date || record.date;

    record.description =
      description ??
      record.description;

    record.priority =
      priority || record.priority;

    record.status =
      status || record.status;

    record.odometer =
      Number(odometer) || 0;

    record.nextServiceDate =
      nextServiceDate || "";

    record.nextServiceKm =
      Number(nextServiceKm) || 0;

    record.mechanicName =
      mechanicName || "";

    record.mechanicPhone =
      mechanicPhone || "";

    record.garageName =
      garageName || "";

    record.location =
      location || "";

    record.parts =
      safeParts;

    record.partsCost =
      partsCost;

    record.labourCost =
      safeLabour;

    record.otherCost =
      safeOther;

    record.totalCost =
      totalCost;

    record.breakdown =
      Boolean(breakdown);

    record.breakdownDetails =
      breakdownDetails || "";

    await record.save();

    const populatedRecord =
      await Maintenance.findById(
        record._id
      )
        .populate(
          "vehicleId",
          "number type site status driver"
        )
        .populate(
          "driverId",
          "name role phone status site"
        );

    res.json(
      populatedRecord
    );
  } catch (error) {
    console.error(
      "Update maintenance error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update maintenance",
    });
  }
});


// DELETE MAINTENANCE
app.delete(
  "/api/maintenance/:id",
  async (req, res) => {
    try {
      const record =
        await Maintenance.findByIdAndDelete(
          req.params.id
        );

      if (!record) {
        return res.status(404).json({
          message:
            "Maintenance record not found",
        });
      }

      res.json({
        message:
          "Maintenance record deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete maintenance error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete maintenance",
      });
    }
  }
);


// MAINTENANCE STATS
app.get(
  "/api/maintenance/stats",
  async (req, res) => {
    try {
      const records =
        await Maintenance.find();

      const totalRecords =
        records.length;

      const inProgress =
        records.filter(
          (r) =>
            r.status === "In Progress"
        ).length;

      const scheduled =
        records.filter(
          (r) =>
            r.status === "Scheduled"
        ).length;

      const completed =
        records.filter(
          (r) =>
            r.status === "Completed"
        ).length;

      const breakdowns =
        records.filter(
          (r) =>
            r.breakdown === true
        ).length;

      const totalCost =
        records.reduce(
          (sum, r) =>
            sum +
            Number(r.totalCost || 0),
          0
        );

      const currentMonth =
        new Date()
          .toISOString()
          .slice(0, 7);

      const monthlyCost =
        records
          .filter(
            (r) =>
              r.date &&
              r.date.startsWith(
                currentMonth
              )
          )
          .reduce(
            (sum, r) =>
              sum +
              Number(
                r.totalCost || 0
              ),
            0
          );

      res.json({
        totalRecords,
        inProgress,
        scheduled,
        completed,
        breakdowns,
        totalCost,
        monthlyCost,
      });
    } catch (error) {
      console.error(
        "Maintenance stats error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load maintenance stats",
      });
    }
  }
);
// ======================================================
// BUILDTRACK REPORTS API
// ======================================================

app.get("/api/reports/summary", async (req, res) => {
  try {
    const { month, vehicleId } = req.query;

    // -----------------------------
    // BASIC DATA
    // -----------------------------

    const workers = await Worker.find();

    const vehicles = await Vehicle.find()
      .populate("driver", "name role phone status");

    let fuelQuery = {};

    let maintenanceQuery = {};

    // -----------------------------
    // MONTH FILTER
    // -----------------------------

    if (month && month !== "all") {
      fuelQuery.date = {
        $regex: `^${month}`,
      };

      maintenanceQuery.date = {
        $regex: `^${month}`,
      };
    }

    // -----------------------------
    // VEHICLE FILTER
    // -----------------------------

    if (vehicleId && vehicleId !== "all") {
      fuelQuery.vehicleId = vehicleId;
      maintenanceQuery.vehicleId = vehicleId;
    }

    const fuelRecords = await Fuel.find(
      fuelQuery
    ).populate(
      "vehicleId",
      "number type site status"
    );

    const maintenanceRecords =
      await Maintenance.find(
        maintenanceQuery
      ).populate(
        "vehicleId",
        "number type site status"
      );

    const materials =
      await Material.find();

    // ==================================================
    // FUEL
    // ==================================================

    const totalFuelLitres =
      fuelRecords.reduce(
        (sum, record) =>
          sum +
          Number(record.litres || 0),
        0
      );

    const fuelCost =
      fuelRecords.reduce(
        (sum, record) =>
          sum +
          Number(record.totalAmount || 0),
        0
      );

    const averageFuelPrice =
      totalFuelLitres > 0
        ? fuelCost / totalFuelLitres
        : 0;

    // ==================================================
    // MAINTENANCE
    // ==================================================

    const maintenanceCost =
      maintenanceRecords.reduce(
        (sum, record) =>
          sum +
          Number(record.totalCost || 0),
        0
      );

    const maintenanceCompleted =
      maintenanceRecords.filter(
        (record) =>
          record.status ===
          "Completed"
      ).length;

    const maintenanceInProgress =
      maintenanceRecords.filter(
        (record) =>
          record.status ===
          "In Progress"
      ).length;

    const maintenanceScheduled =
      maintenanceRecords.filter(
        (record) =>
          record.status ===
          "Scheduled"
      ).length;

    const breakdowns =
      maintenanceRecords.filter(
        (record) =>
          record.breakdown === true
      ).length;

    // ==================================================
    // MATERIALS
    // ==================================================

    const lowStockMaterials =
      materials.filter(
        (material) =>
          Number(
            material.currentStock || 0
          ) <=
          Number(
            material.minimumStock || 0
          )
      );

    const materialStockValue =
      materials.reduce(
        (sum, material) =>
          sum +
          Number(
            material.currentStock || 0
          ) *
            Number(
              material.purchasePrice || 0
            ),
        0
      );

    const totalMaterialStock =
      materials.reduce(
        (sum, material) =>
          sum +
          Number(
            material.currentStock || 0
          ),
        0
      );

    // ==================================================
    // TOTAL EXPENSE
    // ==================================================

    const totalExpense =
      fuelCost +
      maintenanceCost;

    // ==================================================
    // VEHICLE ANALYTICS
    // ==================================================

    const vehicleAnalytics =
      vehicles.map((vehicle) => {
        const vehicleFuel =
          fuelRecords.filter(
            (record) =>
              record.vehicleId?._id?.toString() ===
              vehicle._id.toString()
          );

        const vehicleMaintenance =
          maintenanceRecords.filter(
            (record) =>
              record.vehicleId?._id?.toString() ===
              vehicle._id.toString()
          );

        const litres =
          vehicleFuel.reduce(
            (sum, record) =>
              sum +
              Number(
                record.litres || 0
              ),
            0
          );

        const fuelExpense =
          vehicleFuel.reduce(
            (sum, record) =>
              sum +
              Number(
                record.totalAmount || 0
              ),
            0
          );

        const maintenanceExpense =
          vehicleMaintenance.reduce(
            (sum, record) =>
              sum +
              Number(
                record.totalCost || 0
              ),
            0
          );

        return {
          id: vehicle._id,
          number: vehicle.number,
          type: vehicle.type,
          site: vehicle.site,
          status: vehicle.status,

          driver:
            vehicle.driver?.name ||
            "Unassigned",

          litres,

          fuelExpense,

          maintenanceExpense,

          totalExpense:
            fuelExpense +
            maintenanceExpense,

          maintenanceCount:
            vehicleMaintenance.length,
        };
      });

    // ==================================================
    // MATERIAL REPORT
    // ==================================================

    const materialReport =
      materials.map((material) => ({
        id: material._id,

        name: material.name,

        category:
          material.category,

        unit:
          material.unit,

        currentStock:
          Number(
            material.currentStock || 0
          ),

        minimumStock:
          Number(
            material.minimumStock || 0
          ),

        price:
          Number(
            material.purchasePrice || 0
          ),

        stockValue:
          Number(
            material.currentStock || 0
          ) *
          Number(
            material.purchasePrice || 0
          ),

        lowStock:
          Number(
            material.currentStock || 0
          ) <=
          Number(
            material.minimumStock || 0
          ),
      }));

    // ==================================================
    // MAINTENANCE TYPE ANALYTICS
    // ==================================================

    const maintenanceTypes = [
      "Preventive",
      "Repair",
      "Service",
      "Emergency",
      "Inspection",
    ];

    const maintenanceTypeReport =
      maintenanceTypes.map(
        (type) => {
          const list =
            maintenanceRecords.filter(
              (record) =>
                record.maintenanceType ===
                type
            );

          return {
            type,

            count: list.length,

            cost: list.reduce(
              (sum, record) =>
                sum +
                Number(
                  record.totalCost || 0
                ),
              0
            ),
          };
        }
      );

    // ==================================================
    // FUEL TYPE ANALYTICS
    // ==================================================

    const fuelTypes = [
      "Diesel",
      "Petrol",
      "CNG",
    ];

    const fuelTypeReport =
      fuelTypes.map(
        (type) => {
          const list =
            fuelRecords.filter(
              (record) =>
                record.fuelType ===
                type
            );

          return {
            type,

            litres: list.reduce(
              (sum, record) =>
                sum +
                Number(
                  record.litres || 0
                ),
              0
            ),

            cost: list.reduce(
              (sum, record) =>
                sum +
                Number(
                  record.totalAmount || 0
                ),
              0
            ),
          };
        }
      );

    // ==================================================
    // RESPONSE
    // ==================================================

    res.json({
      overview: {
        workers:
          workers.length,

        vehicles:
          vehicles.length,

        materials:
          materials.length,

        totalMaterialStock,

        materialStockValue,

        lowStock:
          lowStockMaterials.length,

        totalFuelLitres,

        fuelCost,

        averageFuelPrice,

        maintenanceCost,

        totalExpense,

        maintenanceTotal:
          maintenanceRecords.length,

        maintenanceCompleted,

        maintenanceInProgress,

        maintenanceScheduled,

        breakdowns,
      },

      vehicles:
        vehicleAnalytics,

      materials:
        materialReport,

      maintenanceTypes:
        maintenanceTypeReport,

      fuelTypes:
        fuelTypeReport,

      alerts: {
        lowStock:
          lowStockMaterials,

        breakdowns:
          maintenanceRecords.filter(
            (record) =>
              record.breakdown ===
              true &&
              record.status !==
                "Completed"
          ),
      },

      generatedAt:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "Reports API error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to generate reports",
    });
  }
});
app.listen(PORT, () => {
  console.log(
    `BuildTrack server running on port ${PORT}`
  );
});