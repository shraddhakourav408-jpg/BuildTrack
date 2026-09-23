import { useEffect, useState } from "react";
import {
  Truck,
  Plus,
  Search,
  X,
  Edit,
  Trash2,
} from "lucide-react";

function Vehicles() {
  const API = `http://${window.location.hostname}:5001/api/vehicles`;
  const WORKER_API = `http://${window.location.hostname}:5001/api/workers`;

  const [vehicles, setVehicles] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] =
    useState(null);

  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] =
    useState("All Sites");
  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [form, setForm] = useState({
    number: "",
    type: "",
    driver: "",
    site: "Site A",
    status: "Active",
  });


  // =====================================================
  // LOAD VEHICLES
  // =====================================================

  const loadVehicles = async () => {
    try {
      const response = await fetch(API);

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to load vehicles");
        return;
      }

      setVehicles(data);

    } catch (error) {
      console.error("Vehicle loading error:", error);
    }
  };


  // =====================================================
  // LOAD WORKERS
  // =====================================================

  const loadWorkers = async () => {
    try {
      const response = await fetch(WORKER_API);

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to load workers");
        return;
      }

      setWorkers(data);

    } catch (error) {
      console.error("Worker loading error:", error);
    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadVehicles();
    loadWorkers();
  }, []);


  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  const openAddForm = () => {
    setEditingVehicleId(null);

    setForm({
      number: "",
      type: "",
      driver: "",
      site: "Site A",
      status: "Active",
    });

    setShowModal(true);
  };


  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  const editVehicle = (vehicle) => {
    setEditingVehicleId(vehicle._id);

    setForm({
      number: vehicle.number || "",
      type: vehicle.type || "",
      driver: vehicle.driver?._id || "",
      site: vehicle.site || "Site A",
      status: vehicle.status || "Active",
    });

    setShowModal(true);
  };


  // =====================================================
  // ADD / UPDATE VEHICLE
  // =====================================================

  const saveVehicle = async (e) => {
    e.preventDefault();

    if (!form.number || !form.type) {
      alert(
        "Vehicle number and vehicle type are required"
      );
      return;
    }


    try {
      const isEditing =
        Boolean(editingVehicleId);

      const url = isEditing
        ? `${API}/${editingVehicleId}`
        : API;

      const method = isEditing
        ? "PUT"
        : "POST";


      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: form.number,
          type: form.type,
          driver: form.driver || null,
          site: form.site,
          status: form.status,
        }),
      });


      const data = await response.json();


      if (!response.ok) {
        alert(
          data.error ||
            "Failed to save vehicle"
        );
        return;
      }


      if (isEditing) {
        setVehicles(
          vehicles.map((vehicle) =>
            vehicle._id === editingVehicleId
              ? data
              : vehicle
          )
        );

        alert(
          "Vehicle updated successfully!"
        );

      } else {
        setVehicles([
          data,
          ...vehicles,
        ]);

        alert(
          "Vehicle added successfully!"
        );
      }


      setForm({
        number: "",
        type: "",
        driver: "",
        site: "Site A",
        status: "Active",
      });

      setEditingVehicleId(null);
      setShowModal(false);

    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    }
  };


  // =====================================================
  // DELETE VEHICLE
  // =====================================================

  const deleteVehicle = async (vehicle) => {
    const confirmDelete =
      window.confirm(
        `Delete vehicle ${vehicle.number}?`
      );

    if (!confirmDelete) {
      return;
    }


    try {
      const response = await fetch(
        `${API}/${vehicle._id}`,
        {
          method: "DELETE",
        }
      );


      const data = await response.json();


      if (!response.ok) {
        alert(
          data.error ||
            "Failed to delete vehicle"
        );
        return;
      }


      setVehicles(
        vehicles.filter(
          (item) =>
            item._id !== vehicle._id
        )
      );


      alert(
        "Vehicle deleted successfully!"
      );

    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    }
  };


  // =====================================================
  // FILTER VEHICLES
  // =====================================================

  const filteredVehicles =
    vehicles.filter((vehicle) => {

      const driverName =
        vehicle.driver?.name || "";

      const driverPhone =
        vehicle.driver?.phone || "";

      const searchText =
        `${vehicle.number}
        ${vehicle.type}
        ${driverName}
        ${driverPhone}`
          .toLowerCase();

      const matchesSearch =
        searchText.includes(
          search.toLowerCase()
        );

      const matchesSite =
        siteFilter === "All Sites" ||
        vehicle.site === siteFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        vehicle.status === statusFilter;

      return (
        matchesSearch &&
        matchesSite &&
        matchesStatus
      );
    });


  // =====================================================
  // STATISTICS
  // =====================================================

  const activeVehicles =
    vehicles.filter(
      (vehicle) =>
        vehicle.status === "Active"
    ).length;


  const maintenanceVehicles =
    vehicles.filter(
      (vehicle) =>
        vehicle.status === "Maintenance"
    ).length;


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="page-container">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>

          <div className="eyebrow">
            VEHICLE MANAGEMENT
          </div>

          <h1>Vehicles</h1>

          <p>
            Manage construction vehicles,
            drivers and site assignments.
          </p>

        </div>


        <button
          className="add-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Vehicle
        </button>

      </div>


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="stats">

        <div className="card">

          <div className="card-icon orange">
            <Truck size={20} />
          </div>

          <p>Total Vehicles</p>

          <h2>
            {vehicles.length}
          </h2>

          <span className="growth">
            Registered vehicles
          </span>

        </div>


        <div className="card">

          <div className="card-icon blue">
            <Truck size={20} />
          </div>

          <p>Active Vehicles</p>

          <h2>
            {activeVehicles}
          </h2>

          <span className="growth">
            Currently active
          </span>

        </div>


        <div className="card">

          <div className="card-icon green">
            <Truck size={20} />
          </div>

          <p>
            Vehicles in Maintenance
          </p>

          <h2>
            {maintenanceVehicles}
          </h2>

          <span className="warning">
            Needs attention
          </span>

        </div>

      </div>


      {/* =================================================
          SEARCH + FILTERS
      ================================================= */}

      <div className="filters">

        <div className="search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search vehicles..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          value={siteFilter}
          onChange={(e) =>
            setSiteFilter(e.target.value)
          }
        >

          <option>
            All Sites
          </option>

          <option>
            Site A
          </option>

          <option>
            Site B
          </option>

          <option>
            Site C
          </option>

          <option>
            Site D
          </option>

        </select>


        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >

          <option>
            All Status
          </option>

          <option>
            Active
          </option>

          <option>
            Maintenance
          </option>

          <option>
            Inactive
          </option>

        </select>

      </div>


      {/* =================================================
          VEHICLE TABLE
      ================================================= */}

      <div className="table-card">

        <table>

          <thead>

            <tr>

              <th>
                VEHICLE
              </th>

              <th>
                TYPE
              </th>

              <th>
                DRIVER
              </th>

              <th>
                SITE
              </th>

              <th>
                STATUS
              </th>

              <th>
                ACTIONS
              </th>

            </tr>

          </thead>


          <tbody>

            {filteredVehicles.length > 0 ? (

              filteredVehicles.map(
                (vehicle) => (

                  <tr
                    key={vehicle._id}
                  >

                    {/* VEHICLE */}

                    <td>

                      <div className="vehicle-name">

                        <div className="vehicle-icon">

                          <Truck size={18} />

                        </div>

                        <strong>
                          {vehicle.number}
                        </strong>

                      </div>

                    </td>


                    {/* TYPE */}

                    <td>
                      {vehicle.type}
                    </td>


                    {/* DRIVER */}

                    <td>

                      {vehicle.driver ? (

                        <div>

                          <strong>
                            {vehicle.driver.name}
                          </strong>

                          <br />

                          <small>
                            {vehicle.driver.role}
                          </small>

                        </div>

                      ) : (

                        <span>
                          No Driver
                        </span>

                      )}

                    </td>


                    {/* SITE */}

                    <td>
                      {vehicle.site}
                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={`status ${
                          vehicle.status ===
                          "Active"
                            ? "active-status"
                            : vehicle.status ===
                              "Maintenance"
                            ? "maintenance-status"
                            : "inactive-status"
                        }`}
                      >

                        {vehicle.status}

                      </span>

                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                        }}
                      >

                        <button
                          type="button"
                          onClick={() =>
                            editVehicle(
                              vehicle
                            )
                          }
                          title="Edit Vehicle"
                        >

                          <Edit size={16} />

                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            deleteVehicle(
                              vehicle
                            )
                          }
                          title="Delete Vehicle"
                        >

                          <Trash2
                            size={16}
                          />

                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )

            ) : (

              <tr>

                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                  }}
                >

                  No vehicles found

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


      {/* =================================================
          ADD / EDIT VEHICLE MODAL
      ================================================= */}

      {showModal && (

        <div className="modal-overlay">

          <div className="modal">

            <button
              className="modal-close"
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingVehicleId(null);
              }}
            >

              <X size={20} />

            </button>


            <h2>

              {editingVehicleId
                ? "Edit Vehicle"
                : "Add Vehicle"}

            </h2>


            <form
              onSubmit={saveVehicle}
            >

              {/* VEHICLE NUMBER */}

              <label>
                Vehicle Number
              </label>

              <input
                type="text"
                name="number"
                placeholder="Example: MP09 AB 1234"
                value={form.number}
                onChange={handleChange}
                required
              />


              {/* VEHICLE TYPE */}

              <label>
                Vehicle Type
              </label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select Vehicle Type
                </option>

                <option value="Truck">
                  Truck
                </option>

                <option value="Excavator">
                  Excavator
                </option>

                <option value="Loader">
                  Loader
                </option>

                <option value="Crane">
                  Crane
                </option>

                <option value="JCB">
                  JCB
                </option>

                <option value="Tractor">
                  Tractor
                </option>

                <option value="Tipper">
                  Tipper
                </option>

                <option value="Other">
                  Other
                </option>

              </select>


              {/* DRIVER */}

              <label>
                Driver
              </label>

              <select
                name="driver"
                value={form.driver}
                onChange={handleChange}
              >

                <option value="">
                  No Driver / Unassigned
                </option>

                {workers
                  .filter(
                    (worker) =>
                      worker.status ===
                      "Active"
                  )
                  .map((worker) => (

                    <option
                      key={worker._id}
                      value={worker._id}
                    >

                      {worker.name}
                      {" — "}
                      {worker.role}

                    </option>

                  ))}

              </select>


              {/* SITE */}

              <label>
                Site
              </label>

              <select
                name="site"
                value={form.site}
                onChange={handleChange}
              >

                <option>
                  Site A
                </option>

                <option>
                  Site B
                </option>

                <option>
                  Site C
                </option>

                <option>
                  Site D
                </option>

              </select>


              {/* STATUS */}

              <label>
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >

                <option>
                  Active
                </option>

                <option>
                  Maintenance
                </option>

                <option>
                  Inactive
                </option>

              </select>


              {/* SUBMIT */}

              <button
                className="submit-button"
                type="submit"
              >

                {editingVehicleId
                  ? "Update Vehicle"
                  : "Add Vehicle"}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Vehicles;