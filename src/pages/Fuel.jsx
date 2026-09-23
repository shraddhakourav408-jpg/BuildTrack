import { useEffect, useMemo, useState } from "react";
import {
  Fuel as FuelIcon,
  Plus,
  Search,
  X,
  Trash2,
  Gauge,
  IndianRupee,
  Droplets,
  Truck,
} from "lucide-react";

function Fuel() {
  const API = `http://${window.location.hostname}:5001`;

  const [vehicles, setVehicles] = useState([]);
  const [records, setRecords] = useState([]);

  const [showModal, setShowModal] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [vehicleFilter, setVehicleFilter] =
    useState("All Vehicles");

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] = useState({
    vehicleId: "",
    date: new Date()
      .toISOString()
      .split("T")[0],
    fuelType: "Diesel",
    litres: "",
    pricePerLitre: "",
    odometer: "",
    fuelStation: "",
  });

  // =====================================================
  // LOAD VEHICLES
  // =====================================================

  const loadVehicles = async () => {
    try {
      const response = await fetch(
        `${API}/api/vehicles`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load vehicles"
        );
      }

      setVehicles(data);
    } catch (error) {
      console.error(
        "Vehicle loading error:",
        error
      );
    }
  };

  // =====================================================
  // LOAD FUEL
  // =====================================================

  const loadFuel = async () => {
    try {
      const response = await fetch(
        `${API}/api/fuel`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load fuel"
        );
      }

      setRecords(data);
    } catch (error) {
      console.error(
        "Fuel loading error:",
        error
      );
    }
  };

  useEffect(() => {
    loadVehicles();
    loadFuel();
  }, []);

  // =====================================================
  // SELECTED VEHICLE
  // =====================================================

  const selectedVehicle = vehicles.find(
    (vehicle) =>
      vehicle._id === form.vehicleId
  );

  // =====================================================
  // TOTAL AMOUNT
  // =====================================================

  const totalAmount = useMemo(() => {
    const litres =
      Number(form.litres) || 0;

    const price =
      Number(form.pricePerLitre) || 0;

    return litres * price;
  }, [
    form.litres,
    form.pricePerLitre,
  ]);

  // =====================================================
  // ADD FUEL
  // =====================================================

  const addFuel = async (e) => {
    e.preventDefault();

    if (
      !form.vehicleId ||
      !form.date ||
      !form.litres ||
      !form.pricePerLitre ||
      !form.odometer
    ) {
      alert(
        "Please fill all required fields"
      );
      return;
    }

    if (Number(form.litres) <= 0) {
      alert("Litres must be greater than 0");
      return;
    }

    if (Number(form.pricePerLitre) <= 0) {
      alert(
        "Price per litre must be greater than 0"
      );
      return;
    }

    if (Number(form.odometer) < 0) {
      alert("Invalid odometer reading");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/api/fuel`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to add fuel entry"
        );
        return;
      }

      setRecords([
        data,
        ...records,
      ]);

      setForm({
        vehicleId: "",
        date: new Date()
          .toISOString()
          .split("T")[0],
        fuelType: "Diesel",
        litres: "",
        pricePerLitre: "",
        odometer: "",
        fuelStation: "",
      });

      setShowModal(false);

      alert(
        "Fuel entry added successfully!"
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

  // =====================================================
  // DELETE
  // =====================================================

  const deleteFuel = async (id) => {
    const confirmDelete =
      window.confirm(
        "Delete this fuel record?"
      );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API}/api/fuel/${id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to delete record"
        );
        return;
      }

      setRecords(
        records.filter(
          (item) =>
            item._id !== id
        )
      );

      alert(
        "Fuel record deleted successfully"
      );
    } catch (error) {
      alert(
        "Server connection failed"
      );
    }
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredRecords =
    records.filter((record) => {
      const vehicle =
        record.vehicleId;

      const vehicleName =
        vehicle?.number || "";

      const driverName =
        record.driverId?.name ||
        vehicle?.driver?.name ||
        "";

      const matchesSearch =
        `${vehicleName} ${driverName} ${record.fuelStation}`
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesVehicle =
        vehicleFilter ===
          "All Vehicles" ||
        vehicle?._id ===
          vehicleFilter;

      return (
        matchesSearch &&
        matchesVehicle
      );
    });

  // =====================================================
  // STATS
  // =====================================================

  const totalLitres =
    records.reduce(
      (sum, item) =>
        sum +
        Number(item.litres || 0),
      0
    );

  const totalCost =
    records.reduce(
      (sum, item) =>
        sum +
        Number(
          item.totalAmount || 0
        ),
      0
    );

  const averagePrice =
    totalLitres > 0
      ? totalCost / totalLitres
      : 0;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <div className="eyebrow">
            VEHICLE MANAGEMENT
          </div>

          <h1>Fuel Management</h1>

          <p>
            Track fuel consumption,
            expenses and vehicle
            efficiency.
          </p>
        </div>

        <button
          className="add-button"
          onClick={() =>
            setShowModal(true)
          }
        >
          <Plus size={18} />
          Add Fuel Entry
        </button>
      </div>

      {/* STATS */}
      <div className="stats">

        <div className="card">
          <div className="card-icon orange">
            <Droplets size={20} />
          </div>

          <p>Total Fuel Used</p>

          <h2>
            {totalLitres.toFixed(1)} L
          </h2>

          <span className="growth">
            Across all vehicles
          </span>
        </div>

        <div className="card">
          <div className="card-icon blue">
            <IndianRupee size={20} />
          </div>

          <p>Total Fuel Cost</p>

          <h2>
            ₹
            {totalCost.toLocaleString(
              "en-IN",
              {
                maximumFractionDigits: 0,
              }
            )}
          </h2>

          <span className="growth">
            Total recorded expense
          </span>
        </div>

        <div className="card">
          <div className="card-icon green">
            <Gauge size={20} />
          </div>

          <p>Average Price / Litre</p>

          <h2>
            ₹
            {averagePrice.toFixed(2)}
          </h2>

          <span className="growth">
            Current average
          </span>
        </div>

        <div className="card">
          <div className="card-icon orange">
            <Truck size={20} />
          </div>

          <p>Vehicles Using Fuel</p>

          <h2>
            {
              new Set(
                records.map(
                  (item) =>
                    item.vehicleId?._id
                )
              ).size
            }
          </h2>

          <span className="growth">
            Registered vehicles
          </span>
        </div>

      </div>

      {/* FILTERS */}
      <div className="filters">

        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search vehicle, driver or station..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />
        </div>

        <select
          value={vehicleFilter}
          onChange={(e) =>
            setVehicleFilter(
              e.target.value
            )
          }
        >
          <option>
            All Vehicles
          </option>

          {vehicles.map(
            (vehicle) => (
              <option
                key={vehicle._id}
                value={vehicle._id}
              >
                {vehicle.number}
              </option>
            )
          )}
        </select>

      </div>

      {/* TABLE */}
      <div className="table-card">

        <table>

          <thead>
            <tr>
              <th>DATE</th>
              <th>VEHICLE</th>
              <th>DRIVER</th>
              <th>FUEL</th>
              <th>QUANTITY</th>
              <th>PRICE/L</th>
              <th>TOTAL</th>
              <th>ODOMETER</th>
              <th>MILEAGE</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>

            {filteredRecords.length >
            0 ? (
              filteredRecords.map(
                (record) => {

                  const vehicle =
                    record.vehicleId;

                  const driver =
                    record.driverId ||
                    vehicle?.driver;

                  return (
                    <tr
                      key={
                        record._id
                      }
                    >

                      <td>
                        {record.date}
                      </td>

                      <td>
                        <div className="vehicle-name">

                          <div className="vehicle-icon">
                            <FuelIcon
                              size={18}
                            />
                          </div>

                          <strong>
                            {
                              vehicle?.number ||
                              "Unknown"
                            }
                          </strong>

                        </div>
                      </td>

                      <td>
                        {driver?.name ||
                          "Unassigned"}
                      </td>

                      <td>
                        {record.fuelType}
                      </td>

                      <td>
                        {record.litres} L
                      </td>

                      <td>
                        ₹
                        {
                          record.pricePerLitre
                        }
                      </td>

                      <td>
                        <strong>
                          ₹
                          {Number(
                            record.totalAmount
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </td>

                      <td>
                        {
                          record.odometer
                        }{" "}
                        km
                      </td>

                      <td>
                        {record.mileage >
                        0
                          ? `${record.mileage} km/L`
                          : "—"}
                      </td>

                      <td>
                        <button
                          className="delete-worker-btn"
                          onClick={() =>
                            deleteFuel(
                              record._id
                            )
                          }
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </td>

                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td
                  colSpan="10"
                  style={{
                    textAlign:
                      "center",
                    padding:
                      "40px",
                  }}
                >
                  No fuel records found
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

      {/* ADD FUEL MODAL */}
      {showModal && (
        <div className="modal-overlay">

          <div className="modal">

            <button
              className="modal-close"
              onClick={() =>
                setShowModal(false)
              }
            >
              <X size={20} />
            </button>

            <h2>
              Add Fuel Entry
            </h2>

            <form
              onSubmit={addFuel}
            >

              <label>
                Vehicle *
              </label>

              <select
                value={
                  form.vehicleId
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    vehicleId:
                      e.target.value,
                  })
                }
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
                      {vehicle.number} —{" "}
                      {vehicle.type}
                    </option>
                  )
                )}
              </select>

              {/* AUTO VEHICLE INFO */}
              {selectedVehicle && (
                <div
                  style={{
                    padding:
                      "12px",
                    margin:
                      "10px 0 15px",
                    borderRadius:
                      "10px",
                    background:
                      "#f5f7fa",
                  }}
                >
                  <strong>
                    {
                      selectedVehicle
                        .number
                    }
                  </strong>

                  <div>
                    Driver:{" "}
                    {
                      selectedVehicle
                        .driver
                        ?.name ||
                      "Unassigned"
                    }
                  </div>

                  <div>
                    Site:{" "}
                    {
                      selectedVehicle.site
                    }
                  </div>

                  <div>
                    Type:{" "}
                    {
                      selectedVehicle.type
                    }
                  </div>
                </div>
              )}

              <label>
                Date *
              </label>

              <input
                type="date"
                value={
                  form.date
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    date:
                      e.target.value,
                  })
                }
              />

              <label>
                Fuel Type
              </label>

              <select
                value={
                  form.fuelType
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    fuelType:
                      e.target.value,
                  })
                }
              >
                <option>
                  Diesel
                </option>
                <option>
                  Petrol
                </option>
                <option>
                  CNG
                </option>
              </select>

              <label>
                Quantity (Litres) *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 80"
                value={
                  form.litres
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    litres:
                      e.target.value,
                  })
                }
              />

              <label>
                Price / Litre *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 92"
                value={
                  form.pricePerLitre
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    pricePerLitre:
                      e.target.value,
                  })
                }
              />

              {/* AUTOMATIC TOTAL */}
              <div
                style={{
                  padding:
                    "12px",
                  margin:
                    "10px 0",
                  borderRadius:
                    "10px",
                  background:
                    "#f5f7fa",
                  fontWeight:
                    "600",
                }}
              >
                Total Amount: ₹
                {totalAmount.toFixed(
                  2
                )}
              </div>

              <label>
                Current Odometer (km) *
              </label>

              <input
                type="number"
                min="0"
                placeholder="e.g. 12450"
                value={
                  form.odometer
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    odometer:
                      e.target.value,
                  })
                }
              />

              <label>
                Fuel Station
              </label>

              <input
                type="text"
                placeholder="e.g. HP Petrol Pump"
                value={
                  form.fuelStation
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    fuelStation:
                      e.target.value,
                  })
                }
              />

              <button
                className="submit-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Save Fuel Entry"}
              </button>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Fuel;