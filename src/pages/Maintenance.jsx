import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

const API =
  "https://buildtrack-3ccw.onrender.com/api";

const emptyForm = {
  vehicleId: "",
  maintenanceType: "Service",
  date: new Date()
    .toISOString()
    .split("T")[0],

  description: "",

  priority: "Medium",

  status: "Scheduled",

  odometer: "",

  nextServiceDate: "",

  nextServiceKm: "",

  mechanicName: "",

  mechanicPhone: "",

  garageName: "",

  location: "",

  labourCost: "",

  otherCost: "",

  breakdown: false,

  breakdownDetails: "",
};

const emptyPart = {
  name: "",
  quantity: "",
  price: "",
};

function Maintenance() {
  const [vehicles, setVehicles] =
    useState([]);

  const [records, setRecords] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [showModal, setShowModal] =
    useState(false);

  const [showHistory, setShowHistory] =
    useState(false);

  const [selectedVehicle, setSelectedVehicle] =
    useState(null);

  const [editingRecord, setEditingRecord] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  const [parts, setParts] =
    useState([]);

  // ==================================================
  // LOAD VEHICLES
  // ==================================================

  const loadVehicles = async () => {
    try {
      const response =
        await fetch(
          `${API}/vehicles`
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load vehicles"
        );
      }

      const data =
        await response.json();

      setVehicles(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);
      alert(
        "Failed to load vehicles"
      );
    }
  };

  // ==================================================
  // LOAD MAINTENANCE
  // ==================================================

  const loadMaintenance = async () => {
    try {
      setLoading(true);

      const response =
        await fetch(
          `${API}/maintenance`
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load maintenance"
        );
      }

      const data =
        await response.json();

      setRecords(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);

      alert(
        "Server connection failed"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
    loadMaintenance();
  }, []);

  // ==================================================
  // FORM CHANGE
  // ==================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==================================================
  // VEHICLE SELECT
  // ==================================================

  const selectedFormVehicle =
    vehicles.find(
      (vehicle) =>
        vehicle._id ===
        form.vehicleId
    );

  // ==================================================
  // PARTS
  // ==================================================

  const addPart = () => {
    setParts((prev) => [
      ...prev,
      {
        ...emptyPart,
      },
    ]);
  };

  const removePart = (index) => {
    setParts((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  const updatePart = (
    index,
    field,
    value
  ) => {
    setParts((prev) =>
      prev.map((part, i) =>
        i === index
          ? {
              ...part,
              [field]: value,
            }
          : part
      )
    );
  };

  const partsTotal =
    parts.reduce(
      (sum, part) =>
        sum +
        Number(part.quantity || 0) *
          Number(part.price || 0),
      0
    );

  const labour =
    Number(form.labourCost) || 0;

  const other =
    Number(form.otherCost) || 0;

  const totalCost =
    partsTotal +
    labour +
    other;

  // ==================================================
  // OPEN ADD
  // ==================================================

  const openAdd = () => {
    setEditingRecord(null);

    setForm({
      ...emptyForm,

      date: new Date()
        .toISOString()
        .split("T")[0],
    });

    setParts([]);

    setShowModal(true);
  };

  // ==================================================
  // OPEN EDIT
  // ==================================================

  const openEdit = (record) => {
    setEditingRecord(record);

    setForm({
      vehicleId:
        record.vehicleId?._id ||
        record.vehicleId ||
        "",

      maintenanceType:
        record.maintenanceType ||
        "Service",

      date:
        record.date ||
        new Date()
          .toISOString()
          .split("T")[0],

      description:
        record.description || "",

      priority:
        record.priority ||
        "Medium",

      status:
        record.status ||
        "Scheduled",

      odometer:
        record.odometer ?? "",

      nextServiceDate:
        record.nextServiceDate ||
        "",

      nextServiceKm:
        record.nextServiceKm ?? "",

      mechanicName:
        record.mechanicName ||
        "",

      mechanicPhone:
        record.mechanicPhone ||
        "",

      garageName:
        record.garageName ||
        "",

      location:
        record.location ||
        "",

      labourCost:
        record.labourCost ?? "",

      otherCost:
        record.otherCost ?? "",

      breakdown:
        Boolean(record.breakdown),

      breakdownDetails:
        record.breakdownDetails ||
        "",
    });

    setParts(
      (record.parts || []).map(
        (part) => ({
          name:
            part.name || "",

          quantity:
            part.quantity ?? "",

          price:
            part.price ?? "",
        })
      )
    );

    setShowModal(true);
  };

  // ==================================================
  // SAVE
  // ==================================================

  const saveMaintenance = async (
    e
  ) => {
    e.preventDefault();

    if (!form.vehicleId) {
      alert(
        "Please select a vehicle"
      );
      return;
    }

    if (!form.date) {
      alert(
        "Maintenance date is required"
      );
      return;
    }

    try {
      const url = editingRecord
        ? `${API}/maintenance/${editingRecord._id}`
        : `${API}/maintenance`;

      const method = editingRecord
        ? "PUT"
        : "POST";

      const response =
        await fetch(url, {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            ...form,

            odometer:
              Number(
                form.odometer
              ) || 0,

            nextServiceKm:
              Number(
                form.nextServiceKm
              ) || 0,

            labourCost:
              Number(
                form.labourCost
              ) || 0,

            otherCost:
              Number(
                form.otherCost
              ) || 0,

            parts,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save maintenance"
        );
      }

      alert(
        editingRecord
          ? "Maintenance updated successfully"
          : "Maintenance added successfully"
      );

      setShowModal(false);

      loadMaintenance();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Server connection failed"
      );
    }
  };

  // ==================================================
  // DELETE
  // ==================================================

  const deleteRecord = async (
    id
  ) => {
    const confirmDelete =
      window.confirm(
        "Delete this maintenance record?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API}/maintenance/${id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Delete failed"
        );
      }

      alert(
        "Maintenance deleted"
      );

      loadMaintenance();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Delete failed"
      );
    }
  };

  // ==================================================
  // STATUS
  // ==================================================

  const getDueStatus = (
    record
  ) => {
    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    if (
      record.nextServiceDate
    ) {
      const serviceDate =
        new Date(
          record.nextServiceDate
        );

      serviceDate.setHours(
        0,
        0,
        0,
        0
      );

      const diff =
        Math.ceil(
          (
            serviceDate -
            today
          ) /
            (1000 *
              60 *
              60 *
              24)
        );

      if (diff < 0) {
        return "Overdue";
      }

      if (diff <= 15) {
        return "Due Soon";
      }
    }

    return "Up to Date";
  };

  // ==================================================
  // FILTER
  // ==================================================

  const filteredRecords =
    useMemo(() => {
      return records.filter(
        (record) => {
          const vehicle =
            record.vehicleId;

          const vehicleNumber =
            vehicle?.number ||
            "";

          const vehicleType =
            vehicle?.type ||
            "";

          const driverName =
            record.driverId?.name ||
            "";

          const searchText =
            search.toLowerCase();

          const matchesSearch =
            vehicleNumber
              .toLowerCase()
              .includes(
                searchText
              ) ||
            vehicleType
              .toLowerCase()
              .includes(
                searchText
              ) ||
            driverName
              .toLowerCase()
              .includes(
                searchText
              ) ||
            (
              record.description ||
              ""
            )
              .toLowerCase()
              .includes(
                searchText
              );

          const matchesType =
            typeFilter ===
              "All" ||
            record.maintenanceType ===
              typeFilter;

          const matchesStatus =
            statusFilter ===
              "All" ||
            record.status ===
              statusFilter;

          const matchesPriority =
            priorityFilter ===
              "All" ||
            record.priority ===
              priorityFilter;

          return (
            matchesSearch &&
            matchesType &&
            matchesStatus &&
            matchesPriority
          );
        }
      );
    }, [
      records,
      search,
      typeFilter,
      statusFilter,
      priorityFilter,
    ]);

  // ==================================================
  // STATS
  // ==================================================

  const stats =
    useMemo(() => {
      const total =
        records.length;

      const inProgress =
        records.filter(
          (r) =>
            r.status ===
            "In Progress"
        ).length;

      const scheduled =
        records.filter(
          (r) =>
            r.status ===
            "Scheduled"
        ).length;

      const breakdowns =
        records.filter(
          (r) =>
            r.breakdown
        ).length;

      const totalCost =
        records.reduce(
          (sum, r) =>
            sum +
            Number(
              r.totalCost || 0
            ),
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
              r.date?.startsWith(
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

      const overdue =
        records.filter(
          (r) =>
            getDueStatus(r) ===
            "Overdue"
        ).length;

      const dueSoon =
        records.filter(
          (r) =>
            getDueStatus(r) ===
            "Due Soon"
        ).length;

      return {
        total,
        inProgress,
        scheduled,
        breakdowns,
        totalCost,
        monthlyCost,
        overdue,
        dueSoon,
      };
    }, [records]);

  // ==================================================
  // VEHICLE HISTORY
  // ==================================================

  const openVehicleHistory = (
    vehicle
  ) => {
    setSelectedVehicle(vehicle);

    setShowHistory(true);
  };

  const vehicleHistory =
    selectedVehicle
      ? records.filter(
          (record) =>
            record.vehicleId?._id ===
            selectedVehicle._id
        )
      : [];

  // ==================================================
  // MONEY
  // ==================================================

  const money = (value) =>
    `₹${Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="maintenance-page">

      <style>{`

        .maintenance-page {
          padding: 24px;
          color: #172033;
        }

        .maintenance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 20px;
        }

        .maintenance-header h1 {
          margin: 0;
          font-size: 28px;
        }

        .maintenance-header p {
          margin: 6px 0 0;
          color: #687386;
        }

        .add-btn {
          background: #172033;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 18px;
          cursor: pointer;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e8ee;
          border-radius: 14px;
          padding: 18px;
        }

        .stat-card span {
          font-size: 13px;
          color: #737d8f;
        }

        .stat-card strong {
          display: block;
          font-size: 25px;
          margin-top: 8px;
        }

        .filters {
          background: white;
          border: 1px solid #e5e8ee;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 18px;
        }

        .filters input,
        .filters select {
          padding: 11px;
          border: 1px solid #dfe3e9;
          border-radius: 9px;
          outline: none;
          background: white;
        }

        .search {
          flex: 1;
          min-width: 230px;
        }

        .table-box {
          background: white;
          border: 1px solid #e5e8ee;
          border-radius: 14px;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 1250px;
          border-collapse: collapse;
        }

        th {
          padding: 14px;
          text-align: left;
          background: #f7f8fa;
          color: #687386;
          font-size: 12px;
        }

        td {
          padding: 14px;
          border-top: 1px solid #edf0f3;
          font-size: 13px;
        }

        .vehicle-name {
          font-weight: 700;
        }

        .vehicle-type {
          color: #7a8494;
          font-size: 12px;
          margin-top: 3px;
        }

        .badge {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .priority-low {
          background: #eef6ff;
          color: #2774b9;
        }

        .priority-medium {
          background: #fff8e7;
          color: #9a6b00;
        }

        .priority-high {
          background: #fff0ed;
          color: #c0392b;
        }

        .priority-critical {
          background: #fbe9ee;
          color: #a4163c;
        }

        .status-scheduled {
          background: #eef6ff;
          color: #2774b9;
        }

        .status-progress {
          background: #fff8e7;
          color: #9a6b00;
        }

        .status-completed {
          background: #eaf8f0;
          color: #16834b;
        }

        .status-cancelled {
          background: #f1f2f4;
          color: #6d7480;
        }

        .due-overdue {
          color: #c0392b;
          font-weight: 700;
        }

        .due-soon {
          color: #b27600;
          font-weight: 700;
        }

        .due-good {
          color: #16834b;
          font-weight: 700;
        }

        .action-buttons {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .action-buttons button {
          border: 1px solid #dfe3e9;
          background: white;
          border-radius: 7px;
          padding: 7px 9px;
          cursor: pointer;
          font-size: 12px;
        }

        .empty {
          padding: 50px;
          text-align: center;
          color: #7a8494;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(
            15,
            23,
            42,
            .55
          );
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .modal {
          width: 100%;
          max-width: 850px;
          max-height: 92vh;
          overflow-y: auto;
          background: white;
          border-radius: 16px;
          padding: 24px;
        }

        .modal h2 {
          margin-top: 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 14px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .full {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 11px;
          border: 1px solid #dfe3e9;
          border-radius: 9px;
          outline: none;
          font-size: 14px;
        }

        textarea {
          min-height: 80px;
          resize: vertical;
        }

        .vehicle-info {
          background: #f7f8fa;
          border-radius: 10px;
          padding: 14px;
          margin-top: 10px;
        }

        .vehicle-info strong {
          display: block;
          font-size: 17px;
        }

        .section-title {
          margin-top: 25px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e8ebef;
        }

        .parts-row {
          display: grid;
          grid-template-columns:
            2fr 1fr 1fr auto;
          gap: 8px;
          margin-bottom: 8px;
        }

        .parts-row input {
          padding: 10px;
          border: 1px solid #dfe3e9;
          border-radius: 8px;
        }

        .remove-part {
          border: none;
          background: #fff0ed;
          color: #c0392b;
          border-radius: 8px;
          cursor: pointer;
          padding: 0 12px;
        }

        .add-part {
          border: 1px solid #dfe3e9;
          background: white;
          padding: 9px 12px;
          border-radius: 8px;
          cursor: pointer;
        }

        .cost-summary {
          background: #f7f8fa;
          border-radius: 10px;
          padding: 15px;
          margin-top: 12px;
        }

        .cost-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
        }

        .cost-total {
          border-top: 1px solid #ddd;
          margin-top: 8px;
          padding-top: 10px;
          font-weight: 800;
          font-size: 18px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
        }

        .cancel-btn,
        .save-btn {
          border: none;
          border-radius: 9px;
          padding: 11px 18px;
          cursor: pointer;
          font-weight: 600;
        }

        .cancel-btn {
          background: #eef0f3;
        }

        .save-btn {
          background: #172033;
          color: white;
        }

        .breakdown-box {
          border: 1px solid #f0d4d0;
          background: #fff7f5;
          padding: 13px;
          border-radius: 10px;
        }

        .history-card {
          border: 1px solid #e5e8ee;
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 10px;
        }

        .history-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        @media (max-width: 900px) {

          .stats-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }

        @media (max-width: 600px) {

          .maintenance-page {
            padding: 14px;
          }

          .maintenance-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .stats-grid {
            grid-template-columns:
              1fr 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .full {
            grid-column: auto;
          }

          .parts-row {
            grid-template-columns: 1fr;
          }

        }

      `}</style>

      {/* HEADER */}

      <div className="maintenance-header">

        <div>
          <h1>
            Maintenance Management
          </h1>

          <p>
            Manage vehicle service,
            repairs and maintenance
          </p>
        </div>

        <button
          className="add-btn"
          onClick={openAdd}
        >
          + Add Maintenance
        </button>

      </div>

      {/* STATS */}

      <div className="stats-grid">

        <div className="stat-card">
          <span>
            Total Records
          </span>

          <strong>
            {stats.total}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            In Progress
          </span>

          <strong>
            {stats.inProgress}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            Due / Overdue
          </span>

          <strong>
            {stats.dueSoon +
              stats.overdue}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            This Month Cost
          </span>

          <strong>
            {money(
              stats.monthlyCost
            )}
          </strong>
        </div>

      </div>

      {/* FILTERS */}

      <div className="filters">

        <input
          className="search"
          placeholder="Search vehicle, driver or problem..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(
              e.target.value
            )
          }
        >
          <option value="All">
            All Types
          </option>

          <option value="Preventive">
            Preventive
          </option>

          <option value="Repair">
            Repair
          </option>

          <option value="Service">
            Service
          </option>

          <option value="Emergency">
            Emergency
          </option>

          <option value="Inspection">
            Inspection
          </option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
        >
          <option value="All">
            All Status
          </option>

          <option value="Scheduled">
            Scheduled
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Completed">
            Completed
          </option>

          <option value="Cancelled">
            Cancelled
          </option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(
              e.target.value
            )
          }
        >
          <option value="All">
            All Priority
          </option>

          <option value="Low">
            Low
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="High">
            High
          </option>

          <option value="Critical">
            Critical
          </option>
        </select>

      </div>

      {/* TABLE */}

      <div className="table-box">

        {loading ? (
          <div className="empty">
            Loading maintenance...
          </div>
        ) : filteredRecords.length ===
          0 ? (
          <div className="empty">
            No maintenance records found.
            <br />
            Click
            <b>
              {" "}
              + Add Maintenance
            </b>
            to create one.
          </div>
        ) : (
          <table>

            <thead>

              <tr>

                <th>
                  Vehicle
                </th>

                <th>
                  Driver
                </th>

                <th>
                  Type
                </th>

                <th>
                  Date
                </th>

                <th>
                  Priority
                </th>

                <th>
                  Status
                </th>

                <th>
                  Cost
                </th>

                <th>
                  Service
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredRecords.map(
                (record) => {

                  const due =
                    getDueStatus(
                      record
                    );

                  return (
                    <tr
                      key={
                        record._id
                      }
                    >

                      <td>

                        <div className="vehicle-name">
                          {record.vehicleId
                            ?.number ||
                            "—"}
                        </div>

                        <div className="vehicle-type">
                          {record.vehicleId
                            ?.type ||
                            ""}
                        </div>

                      </td>

                      <td>
                        {record.driverId
                          ?.name ||
                          "Unassigned"}
                      </td>

                      <td>
                        {
                          record.maintenanceType
                        }
                      </td>

                      <td>
                        {record.date}
                      </td>

                      <td>

                        <span
                          className={`badge priority-${record.priority?.toLowerCase()}`}
                        >
                          {
                            record.priority
                          }
                        </span>

                      </td>

                      <td>

                        <span
                          className={`badge ${
                            record.status ===
                            "Completed"
                              ? "status-completed"
                              : record.status ===
                                "In Progress"
                              ? "status-progress"
                              : record.status ===
                                "Cancelled"
                              ? "status-cancelled"
                              : "status-scheduled"
                          }`}
                        >
                          {
                            record.status
                          }
                        </span>

                      </td>

                      <td>
                        {money(
                          record.totalCost
                        )}
                      </td>

                      <td>

                        <span
                          className={
                            due ===
                            "Overdue"
                              ? "due-overdue"
                              : due ===
                                "Due Soon"
                              ? "due-soon"
                              : "due-good"
                          }
                        >
                          {due}
                        </span>

                      </td>

                      <td>

                        <div className="action-buttons">

                          <button
                            onClick={() =>
                              openEdit(
                                record
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              openVehicleHistory(
                                record.vehicleId
                              )
                            }
                          >
                            History
                          </button>

                          <button
                            onClick={() =>
                              deleteRecord(
                                record._id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>
        )}

      </div>

      {/* =================================================
          ADD / EDIT MODAL
          ================================================= */}

      {showModal && (
        <div className="modal-overlay">

          <div className="modal">

            <h2>
              {editingRecord
                ? "Edit Maintenance"
                : "Add Maintenance"}
            </h2>

            <form
              onSubmit={
                saveMaintenance
              }
            >

              <div className="form-grid">

                {/* VEHICLE */}

                <div className="form-group full">

                  <label>
                    Vehicle *
                  </label>

                  <select
                    name="vehicleId"
                    value={
                      form.vehicleId
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select Vehicle
                    </option>

                    {vehicles.map(
                      (vehicle) => (
                        <option
                          key={
                            vehicle._id
                          }
                          value={
                            vehicle._id
                          }
                        >
                          {
                            vehicle.number
                          }{" "}
                          —{" "}
                          {
                            vehicle.type
                          }
                        </option>
                      )
                    )}

                  </select>

                  {selectedFormVehicle && (
                    <div className="vehicle-info">

                      <strong>
                        {
                          selectedFormVehicle.number
                        }
                      </strong>

                      Type:{" "}
                      {
                        selectedFormVehicle.type
                      }

                      <br />

                      Site:{" "}
                      {
                        selectedFormVehicle.site ||
                        "Site A"
                      }

                      <br />

                      Driver:{" "}
                      {selectedFormVehicle
                        .driver
                        ?.name ||
                        "Unassigned"}

                    </div>
                  )}

                </div>

                {/* TYPE */}

                <div className="form-group">

                  <label>
                    Maintenance Type
                  </label>

                  <select
                    name="maintenanceType"
                    value={
                      form.maintenanceType
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option>
                      Preventive
                    </option>

                    <option>
                      Repair
                    </option>

                    <option>
                      Service
                    </option>

                    <option>
                      Emergency
                    </option>

                    <option>
                      Inspection
                    </option>

                  </select>

                </div>

                {/* DATE */}

                <div className="form-group">

                  <label>
                    Date *
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={
                      form.date
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                {/* PRIORITY */}

                <div className="form-group">

                  <label>
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={
                      form.priority
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option>
                      Low
                    </option>

                    <option>
                      Medium
                    </option>

                    <option>
                      High
                    </option>

                    <option>
                      Critical
                    </option>

                  </select>

                </div>

                {/* STATUS */}

                <div className="form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option>
                      Scheduled
                    </option>

                    <option>
                      In Progress
                    </option>

                    <option>
                      Completed
                    </option>

                    <option>
                      Cancelled
                    </option>

                  </select>

                </div>

                {/* ODOMETER */}

                <div className="form-group">

                  <label>
                    Current Odometer (KM)
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="odometer"
                    value={
                      form.odometer
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. 43430"
                  />

                </div>

                {/* NEXT DATE */}

                <div className="form-group">

                  <label>
                    Next Service Date
                  </label>

                  <input
                    type="date"
                    name="nextServiceDate"
                    value={
                      form.nextServiceDate
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

                {/* NEXT KM */}

                <div className="form-group">

                  <label>
                    Next Service KM
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="nextServiceKm"
                    value={
                      form.nextServiceKm
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. 45000"
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="form-group full">

                  <label>
                    Problem / Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Describe service or problem..."
                  />

                </div>

                {/* MECHANIC */}

                <div className="form-group">

                  <label>
                    Mechanic Name
                  </label>

                  <input
                    name="mechanicName"
                    value={
                      form.mechanicName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Mechanic name"
                  />

                </div>

                {/* PHONE */}

                <div className="form-group">

                  <label>
                    Mechanic Phone
                  </label>

                  <input
                    name="mechanicPhone"
                    value={
                      form.mechanicPhone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="10 digit phone"
                  />

                </div>

                {/* GARAGE */}

                <div className="form-group">

                  <label>
                    Garage / Service Centre
                  </label>

                  <input
                    name="garageName"
                    value={
                      form.garageName
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

                {/* LOCATION */}

                <div className="form-group">

                  <label>
                    Location
                  </label>

                  <input
                    name="location"
                    value={
                      form.location
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Breakdown / service location"
                  />

                </div>

              </div>

              {/* BREAKDOWN */}

              <h3 className="section-title">
                Breakdown
              </h3>

              <div className="breakdown-box">

                <label>

                  <input
                    type="checkbox"
                    name="breakdown"
                    checked={
                      form.breakdown
                    }
                    onChange={
                      handleChange
                    }
                  />

                  {" "}
                  This is a breakdown
                </label>

                {form.breakdown && (
                  <textarea
                    name="breakdownDetails"
                    value={
                      form.breakdownDetails
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter breakdown details..."
                    style={{
                      marginTop:
                        "10px",
                      width:
                        "100%",
                    }}
                  />
                )}

              </div>

              {/* PARTS */}

              <h3 className="section-title">
                Spare Parts
              </h3>

              {parts.map(
                (part, index) => (
                  <div
                    className="parts-row"
                    key={index}
                  >

                    <input
                      placeholder="Part name"
                      value={
                        part.name
                      }
                      onChange={(e) =>
                        updatePart(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Qty"
                      value={
                        part.quantity
                      }
                      onChange={(e) =>
                        updatePart(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      value={
                        part.price
                      }
                      onChange={(e) =>
                        updatePart(
                          index,
                          "price",
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="remove-part"
                      onClick={() =>
                        removePart(
                          index
                        )
                      }
                    >
                      ×
                    </button>

                  </div>
                )
              )}

              <button
                type="button"
                className="add-part"
                onClick={addPart}
              >
                + Add Spare Part
              </button>

              {/* COST */}

              <h3 className="section-title">
                Cost
              </h3>

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Labour Cost
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.labourCost
                    }
                    onChange={(e) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          labourCost:
                            e.target.value,
                        })
                      )
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    Other Cost
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.otherCost
                    }
                    onChange={(e) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          otherCost:
                            e.target.value,
                        })
                      )
                    }
                  />

                </div>

              </div>

              <div className="cost-summary">

                <div className="cost-row">
                  <span>
                    Parts Cost
                  </span>

                  <strong>
                    {money(
                      partsTotal
                    )}
                  </strong>
                </div>

                <div className="cost-row">
                  <span>
                    Labour Cost
                  </span>

                  <strong>
                    {money(
                      labour
                    )}
                  </strong>
                </div>

                <div className="cost-row">
                  <span>
                    Other Cost
                  </span>

                  <strong>
                    {money(
                      other
                    )}
                  </strong>
                </div>

                <div className="cost-row cost-total">
                  <span>
                    Total Cost
                  </span>

                  <strong>
                    {money(
                      totalCost
                    )}
                  </strong>
                </div>

              </div>

              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                >
                  {editingRecord
                    ? "Update Maintenance"
                    : "Save Maintenance"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =================================================
          VEHICLE HISTORY MODAL
          ================================================= */}

      {showHistory &&
        selectedVehicle && (
          <div className="modal-overlay">

            <div className="modal">

              <h2>
                Vehicle Maintenance History
              </h2>

              <div className="vehicle-info">

                <strong>
                  {
                    selectedVehicle.number
                  }
                </strong>

                Type:{" "}
                {
                  selectedVehicle.type
                }

                <br />

                Site:{" "}
                {
                  selectedVehicle.site ||
                  "Site A"
                }

              </div>

              {vehicleHistory.length ===
              0 ? (
                <p>
                  No maintenance history
                  for this vehicle.
                </p>
              ) : (
                vehicleHistory.map(
                  (record) => (
                    <div
                      className="history-card"
                      key={
                        record._id
                      }
                    >

                      <div className="history-top">

                        <strong>
                          {
                            record.maintenanceType
                          }
                        </strong>

                        <strong>
                          {money(
                            record.totalCost
                          )}
                        </strong>

                      </div>

                      <div>
                        Date:{" "}
                        {
                          record.date
                        }
                      </div>

                      <div>
                        Status:{" "}
                        {
                          record.status
                        }
                      </div>

                      <div>
                        Odometer:{" "}
                        {
                          record.odometer ||
                          0
                        }{" "}
                        KM
                      </div>

                      {record.description && (
                        <div>
                          Problem:{" "}
                          {
                            record.description
                          }
                        </div>
                      )}

                    </div>
                  )
                )
              )}

              <div className="modal-actions">

                <button
                  className="cancel-btn"
                  onClick={() =>
                    setShowHistory(
                      false
                    )
                  }
                >
                  Close
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

export default Maintenance;