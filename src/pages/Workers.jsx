import { useEffect, useState } from "react";

function Workers() {
  // PRODUCTION BACKEND
  const API = "https://buildtrack-3ccw.onrender.com";

  const [workers, setWorkers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState(null);

  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("All Sites");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    role: "",
    phone: "",
    site: "Site A",
    status: "Active",
  });

  // =========================
  // LOAD WORKERS
  // =========================
  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API}/api/workers`);

      if (!response.ok) {
        throw new Error("Failed to load workers");
      }

      const data = await response.json();

      setWorkers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load workers:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORM CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setForm({
      name: "",
      role: "",
      phone: "",
      site: "Site A",
      status: "Active",
    });

    setEditingWorkerId(null);
  };

  // =========================
  // OPEN ADD FORM
  // =========================
  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  // =========================
  // EDIT WORKER
  // =========================
  const editWorker = (worker) => {
    setEditingWorkerId(worker._id);

    setForm({
      name: worker.name || "",
      role: worker.role || "",
      phone: worker.phone || "",
      site: worker.site || "Site A",
      status: worker.status || "Active",
    });

    setShowForm(true);
  };

  // =========================
  // VALIDATION
  // =========================
  const validateForm = () => {
    const name = form.name.trim();
    const role = form.role.trim();
    const phone = form.phone.trim();

    if (!name || !role || !phone) {
      alert("Please fill all required fields");
      return false;
    }

    if (!/^[A-Za-z ]+$/.test(name)) {
      alert("Worker Name should contain only letters");
      return false;
    }

    if (!/^[A-Za-z ]+$/.test(role)) {
      alert("Role should contain only letters");
      return false;
    }

    if (!/^\d{10}$/.test(phone)) {
      alert("Phone number must be exactly 10 digits");
      return false;
    }

    return true;
  };

  // =========================
  // ADD / UPDATE WORKER
  // =========================
  const saveWorker = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      let response;

      // UPDATE
      if (editingWorkerId) {
        response = await fetch(
          `${API}/api/workers/${editingWorkerId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: form.name.trim(),
              role: form.role.trim(),
              phone: form.phone.trim(),
              site: form.site,
              status: form.status,
            }),
          }
        );
      }

      // ADD
      else {
        response = await fetch(`${API}/api/workers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            role: form.role.trim(),
            phone: form.phone.trim(),
            site: form.site,
            status: form.status,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            (editingWorkerId
              ? "Failed to update worker"
              : "Failed to add worker")
        );
        return;
      }

      // UPDATE LOCAL LIST
      if (editingWorkerId) {
        setWorkers((prevWorkers) =>
          prevWorkers.map((worker) =>
            worker._id === editingWorkerId ? data : worker
          )
        );

        alert("Worker updated successfully!");
      }

      // ADD TO LOCAL LIST
      else {
        setWorkers((prevWorkers) => [
          ...prevWorkers,
          data,
        ]);

        alert("Worker added successfully!");
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Worker API error:", error);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE WORKER
  // =========================
  const deleteWorker = async (worker) => {
    const confirmDelete = window.confirm(
      `Delete ${worker.name}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/api/workers/${worker._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete worker");
        return;
      }

      setWorkers((prevWorkers) =>
        prevWorkers.filter(
          (item) => item._id !== worker._id
        )
      );

      alert("Worker deleted successfully!");
    } catch (error) {
      console.error("Delete worker error:", error);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SEARCH + FILTER
  // =========================
  const filteredWorkers = workers.filter((worker) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      (worker.name || "")
        .toLowerCase()
        .includes(searchText) ||
      (worker.role || "")
        .toLowerCase()
        .includes(searchText) ||
      (worker.phone || "").includes(search);

    const matchesSite =
      siteFilter === "All Sites" ||
      worker.site === siteFilter;

    const matchesStatus =
      statusFilter === "All Status" ||
      worker.status === statusFilter;

    return (
      matchesSearch &&
      matchesSite &&
      matchesStatus
    );
  });

  // =========================
  // STATISTICS
  // =========================
  const activeWorkers = workers.filter(
    (worker) => worker.status === "Active"
  ).length;

  const inactiveWorkers = workers.filter(
    (worker) => worker.status === "Inactive"
  ).length;

  return (
    <div className="workers-page">

      {/* ================= HEADER ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1>Workers</h1>
          <p>
            Manage construction site workers
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          style={{
            background: "#e8752a",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          + Add Worker
        </button>
      </div>

      {/* ================= STATS ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div className="stat-card">
          <h3>Total Workers</h3>
          <h2>{workers.length}</h2>
        </div>

        <div className="stat-card">
          <h3>Active Workers</h3>
          <h2>{activeWorkers}</h2>
        </div>

        <div className="stat-card">
          <h3>Inactive Workers</h3>
          <h2>{inactiveWorkers}</h2>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Search worker..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: "7px",
            minWidth: "220px",
          }}
        />

        <select
          value={siteFilter}
          onChange={(e) =>
            setSiteFilter(e.target.value)
          }
          style={{
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: "7px",
          }}
        >
          <option>All Sites</option>
          <option>Site A</option>
          <option>Site B</option>
          <option>Site C</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          style={{
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: "7px",
          }}
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* ================= WORKERS TABLE ================= */}
      <div
        style={{
          background: "white",
          borderRadius: "10px",
          overflowX: "auto",
        }}
      >
        {loading && workers.length === 0 ? (
          <p
            style={{
              padding: "30px",
              textAlign: "center",
            }}
          >
            Loading workers...
          </p>
        ) : filteredWorkers.length === 0 ? (
          <p
            style={{
              padding: "30px",
              textAlign: "center",
            }}
          >
            No workers found
          </p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Site</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredWorkers.map((worker) => (
                <tr key={worker._id}>
                  <td>{worker.name}</td>
                  <td>{worker.role}</td>
                  <td>{worker.phone}</td>
                  <td>{worker.site}</td>

                  <td>
                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: "15px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {worker.status}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() =>
                        editWorker(worker)
                      }
                      style={{
                        marginRight: "8px",
                        padding: "7px 12px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteWorker(worker)
                      }
                      style={{
                        padding: "7px 12px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= ADD / EDIT MODAL ================= */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              width: "100%",
              maxWidth: "520px",
              borderRadius: "15px",
              padding: "25px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2>
                {editingWorkerId
                  ? "Edit Worker"
                  : "Add Worker"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                style={{
                  border: "none",
                  background: "#f1f1f1",
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ×
              </button>
            </div>

            {/* WORKER NAME */}
            <label>Worker Name</label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter worker name"
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "7px",
                marginBottom: "15px",
                border: "1px solid #ddd",
                borderRadius: "7px",
                boxSizing: "border-box",
              }}
            />

            {/* ROLE */}
            <label>Role</label>

            <input
              type="text"
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="Enter role"
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "7px",
                marginBottom: "15px",
                border: "1px solid #ddd",
                borderRadius: "7px",
                boxSizing: "border-box",
              }}
            />

            {/* PHONE */}
            <label>Phone</label>

            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="10 digit phone number"
              maxLength="10"
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "7px",
                marginBottom: "15px",
                border: "1px solid #ddd",
                borderRadius: "7px",
                boxSizing: "border-box",
              }}
            />

            {/* SITE */}
            <label>Site</label>

            <select
              name="site"
              value={form.site}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "7px",
                marginBottom: "15px",
                border: "1px solid #ddd",
                borderRadius: "7px",
                boxSizing: "border-box",
              }}
            >
              <option>Site A</option>
              <option>Site B</option>
              <option>Site C</option>
            </select>

            {/* STATUS */}
            <label>Status</label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "7px",
                marginBottom: "20px",
                border: "1px solid #ddd",
                borderRadius: "7px",
                boxSizing: "border-box",
              }}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>

            {/* SAVE BUTTON */}
            <button
              type="button"
              disabled={loading}
              onClick={saveWorker}
              style={{
                width: "100%",
                background: "#e8752a",
                color: "white",
                border: "none",
                padding: "13px",
                borderRadius: "8px",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "600",
                fontSize: "15px",
              }}
            >
              {loading
                ? "Saving..."
                : editingWorkerId
                ? "Update Worker"
                : "Add Worker"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workers;