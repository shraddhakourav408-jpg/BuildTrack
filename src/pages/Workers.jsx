import { useEffect, useState } from "react";

function Workers() {
  const API = "https://buildtrack-3ccw.onrender.com";

  const [workers, setWorkers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("All Sites");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [editingWorkerId, setEditingWorkerId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    phone: "",
    site: "Site A",
    status: "Active",
  });

  // LOAD WORKERS
  useEffect(() => {
    fetch(`${API}/api/workers`)
      .then((res) => res.json())
      .then((data) => setWorkers(data))
      .catch((err) =>
        console.error("Failed to load workers:", err)
      );
  }, []);

  // FORM CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // EDIT WORKER - EXISTING WORKER
  const editWorker = (worker) => {
    setEditingWorkerId(worker._id);

    setForm({
      name: worker.name,
      role: worker.role,
      phone: worker.phone,
      site: worker.site,
      status: worker.status,
    });

    setShowForm(true);
  };

  // UPDATE WORKER
  const updateWorker = async () => {
    if (!form.name || !form.role || !form.phone) {
  alert("Please fill all required fields");
  return;
}

if (!/^[A-Za-z ]+$/.test(form.name)) {
  alert("Worker Name should contain only letters");
  return;
}

if (!/^[A-Za-z ]+$/.test(form.role)) {
  alert("Role should contain only letters");
  return;
}

if (!/^\d{10}$/.test(form.phone)) {
  alert("Phone number must be exactly 10 digits");
  return;
}
    try {
      const response = await fetch(
        `${API}/${editingWorkerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update worker");
        return;
      }

      setWorkers(
        workers.map((worker) =>
          worker._id === editingWorkerId
            ? data
            : worker
        )
      );

      setEditingWorkerId(null);

      setForm({
        name: "",
        role: "",
        phone: "",
        site: "Site A",
        status: "Active",
      });

      setShowForm(false);

      alert("Worker updated successfully!");
    } catch (error) {
      alert("Server connection failed");
      console.error(error);
    }
  };

  // DELETE WORKER
  const deleteWorker = async (worker) => {
    const confirmDelete = window.confirm(
      `Delete ${worker.name}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/${worker._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete worker");
        return;
      }

      setWorkers(
        workers.filter(
          (item) => item._id !== worker._id
        )
      );

      alert("Worker deleted successfully!");
    } catch (error) {
      alert("Server connection failed");
      console.error(error);
    }
  };

  // ADD WORKER
  const addWorker = async () => {
    if (!form.name || !form.role || !form.phone) {
  alert("Please fill all required fields");
  return;
}

if (!/^[A-Za-z ]+$/.test(form.name)) {
  alert("Worker Name should contain only letters");
  return;
}

if (!/^[A-Za-z ]+$/.test(form.role)) {
  alert("Role should contain only letters");
  return;
}

if (!/^\d{10}$/.test(form.phone)) {
  alert("Phone number must be exactly 10 digits");
  return;
}

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to add worker");
        return;
      }

      setWorkers([...workers, data]);

      setForm({
        name: "",
        role: "",
        phone: "",
        site: "Site A",
        status: "Active",
      });

      setShowForm(false);

      alert("Worker added successfully!");
    } catch (error) {
      alert("Server connection failed");
      console.error(error);
    }
  };

  // SEARCH + FILTER
  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      worker.role
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      worker.phone.includes(search);

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

  const activeWorkers = workers.filter(
    (worker) => worker.status === "Active"
  ).length;

  return (
    <div className="workers-page">

      {/* HEADER */}
      <div className="workers-header">
        <div>
          <p className="small-title">
            WORKFORCE MANAGEMENT
          </p>

          <h1>Workers</h1>

          <p>
            Manage workers and their site assignments.
          </p>
        </div>

        <button
          className="add-worker-btn"
          onClick={() => {
            setEditingWorkerId(null);

            setForm({
              name: "",
              role: "",
              phone: "",
              site: "Site A",
              status: "Active",
            });

            setShowForm(true);
          }}
        >
          + Add Worker
        </button>
      </div>

      {/* STATISTICS */}
      <div className="worker-stats">

        <div className="worker-stat-card">
          <span>Total Workers</span>
          <h2>{workers.length}</h2>
        </div>

        <div className="worker-stat-card">
          <span>Active Workers</span>
          <h2>{activeWorkers}</h2>
        </div>

        <div className="worker-stat-card">
          <span>Active Sites</span>
          <h2>4</h2>
        </div>

      </div>

      {/* SEARCH + FILTERS */}
      <div className="worker-filters">

        <input
          type="text"
          placeholder="Search workers..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={siteFilter}
          onChange={(e) =>
            setSiteFilter(e.target.value)
          }
        >
          <option>All Sites</option>
          <option>Site A</option>
          <option>Site B</option>
          <option>Site C</option>
          <option>Site D</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option>All Status</option>
          <option>Active</option>
          <option>On Leave</option>
        </select>

      </div>

      {/* WORKER TABLE */}
      <div className="worker-table">

        <div className="table-header">
          <span>WORKER</span>
          <span>ROLE</span>
          <span>CONTACT</span>
          <span>SITE</span>
          <span>STATUS</span>
          <span>ACTIONS</span>
        </div>

        {filteredWorkers.length > 0 ? (

          filteredWorkers.map((worker) => (

            <div
              className="worker-row"
              key={worker._id}
            >

              <div className="worker-name">

                <div className="avatar">
                  {worker.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .substring(0, 2)}
                </div>

                <strong>
                  {worker.name}
                </strong>

              </div>

              <span>{worker.role}</span>

              <span>☎ {worker.phone}</span>

              <span>{worker.site}</span>

              <span>
                <b
                  className={
                    worker.status === "Active"
                      ? "status-active"
                      : "status-leave"
                  }
                >
                  {worker.status}
                </b>
              </span>

              <div className="worker-actions">

                <button
                  onClick={() =>
                    editWorker(worker)
                  }
                  className="edit-worker-btn"
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteWorker(worker)
                  }
                  className="delete-worker-btn"
                >
                  Delete
                </button>

              </div>

            </div>

          ))

        ) : (

          <div className="no-workers">
            No workers found
          </div>

        )}

      </div>

      {/* ADD / EDIT WORKER MODAL */}
      {showForm && (

        <div className="modal-overlay">

          <div className="worker-modal">

            <button
              className="close-btn"
              onClick={() => {
                setShowForm(false);
                setEditingWorkerId(null);
              }}
            >
              ×
            </button>

            <h2>
              {editingWorkerId
                ? "Edit Worker"
                : "Add Worker"}
            </h2>

            <label>Worker Name</label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter worker name"
            />

            <label>Role</label>

            <input
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="Enter role"
            />

            <label>Phone</label>

            <input
  name="phone"
  value={form.phone}
  onChange={handleChange}
  placeholder="Enter 10 digit phone number"
  maxLength="10"
/>

            <label>Site</label>

            <select
              name="site"
              value={form.site}
              onChange={handleChange}
            >
              <option>Site A</option>
              <option>Site B</option>
              <option>Site C</option>
              <option>Site D</option>
            </select>

            <label>Status</label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option>Active</option>
              <option>On Leave</option>
            </select>

            <button
              className="submit-worker-btn"
              onClick={
                editingWorkerId
                  ? updateWorker
                  : addWorker
              }
            >
              {editingWorkerId
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