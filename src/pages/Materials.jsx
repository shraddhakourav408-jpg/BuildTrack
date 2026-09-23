import React, { useEffect, useMemo, useState } from "react";

const API = `http://${window.location.hostname}:5001/api`;

const emptyMaterial = {
  name: "",
  category: "Cement",
  unit: "Bag",
  currentStock: "",
  minimumStock: "",
  site: "Site A",
  supplierName: "",
  supplierPhone: "",
  purchasePrice: "",
};

const categories = [
  "Cement",
  "Steel",
  "Sand",
  "Bricks",
  "Aggregate",
  "Electrical",
  "Plumbing",
  "Paint",
  "Hardware",
  "Other",
];

const units = [
  "Bag",
  "Kg",
  "Ton",
  "m³",
  "Piece",
  "Liter",
  "Box",
];

function Materials() {
  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const [showMaterialModal, setShowMaterialModal] =
    useState(false);

  const [showStockModal, setShowStockModal] =
    useState(false);

  const [showRequestModal, setShowRequestModal] =
    useState(false);

  const [showHistoryModal, setShowHistoryModal] =
    useState(false);

  const [editingMaterial, setEditingMaterial] =
    useState(null);

  const [selectedMaterial, setSelectedMaterial] =
    useState(null);

  const [materialForm, setMaterialForm] =
    useState(emptyMaterial);

  const [stockForm, setStockForm] = useState({
    type: "IN",
    quantity: "",
    price: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const [requestForm, setRequestForm] = useState({
    quantity: "",
    requestedBy: "Site Manager",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  // ======================================================
  // LOAD MATERIALS
  // ======================================================

  const loadMaterials = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API}/materials`);

      if (!response.ok) {
        throw new Error("Failed");
      }

      const data = await response.json();

      setMaterials(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  // ======================================================
  // FILTER
  // ======================================================

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        material.name
          ?.toLowerCase()
          .includes(searchText) ||
        material.category
          ?.toLowerCase()
          .includes(searchText) ||
        material.supplierName
          ?.toLowerCase()
          .includes(searchText);

      const matchesCategory =
        categoryFilter === "All" ||
        material.category === categoryFilter;

      const lowStock =
        Number(material.currentStock) <=
        Number(material.minimumStock);

      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "Low" && lowStock) ||
        (stockFilter === "Available" && !lowStock);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock
      );
    });
  }, [
    materials,
    search,
    categoryFilter,
    stockFilter,
  ]);

  // ======================================================
  // STATS
  // ======================================================

  const stats = useMemo(() => {
    const totalMaterials = materials.length;

    const lowStock = materials.filter(
      (m) =>
        Number(m.currentStock) <=
        Number(m.minimumStock)
    ).length;

    const totalStockValue = materials.reduce(
      (sum, material) =>
        sum +
        Number(material.currentStock || 0) *
          Number(material.purchasePrice || 0),
      0
    );

    const totalStockUnits = materials.reduce(
      (sum, material) =>
        sum + Number(material.currentStock || 0),
      0
    );

    return {
      totalMaterials,
      lowStock,
      totalStockValue,
      totalStockUnits,
    };
  }, [materials]);

  // ======================================================
  // FORM HANDLERS
  // ======================================================

  const handleMaterialChange = (e) => {
    const { name, value } = e.target;

    setMaterialForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // ADD / EDIT MATERIAL
  // ======================================================

  const openAddMaterial = () => {
    setEditingMaterial(null);
    setMaterialForm(emptyMaterial);
    setShowMaterialModal(true);
  };

  const openEditMaterial = (material) => {
    setEditingMaterial(material);

    setMaterialForm({
      name: material.name || "",
      category: material.category || "Cement",
      unit: material.unit || "Bag",
      currentStock: material.currentStock ?? "",
      minimumStock: material.minimumStock ?? "",
      site: material.site || "Site A",
      supplierName: material.supplierName || "",
      supplierPhone: material.supplierPhone || "",
      purchasePrice: material.purchasePrice ?? "",
    });

    setShowMaterialModal(true);
  };

  const saveMaterial = async (e) => {
    e.preventDefault();

    if (!materialForm.name.trim()) {
      alert("Material name required");
      return;
    }

    if (!materialForm.category) {
      alert("Select category");
      return;
    }

    if (!materialForm.unit) {
      alert("Select unit");
      return;
    }

    try {
      const url = editingMaterial
        ? `${API}/materials/${editingMaterial._id}`
        : `${API}/materials`;

      const method = editingMaterial
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...materialForm,
          currentStock:
            Number(materialForm.currentStock) || 0,
          minimumStock:
            Number(materialForm.minimumStock) || 0,
          purchasePrice:
            Number(materialForm.purchasePrice) || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed"
        );
      }

      alert(
        editingMaterial
          ? "Material updated successfully"
          : "Material added successfully"
      );

      setShowMaterialModal(false);

      loadMaterials();
    } catch (error) {
      console.error(error);
      alert(error.message || "Server connection failed");
    }
  };

  // ======================================================
  // DELETE
  // ======================================================

  const deleteMaterial = async (id) => {
    const ok = window.confirm(
      "Delete this material permanently?"
    );

    if (!ok) return;

    try {
      const response = await fetch(
        `${API}/materials/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed"
        );
      }

      alert("Material deleted");

      loadMaterials();
    } catch (error) {
      console.error(error);
      alert(error.message || "Delete failed");
    }
  };

  // ======================================================
  // STOCK
  // ======================================================

  const openStockModal = (material, type) => {
    setSelectedMaterial(material);

    setStockForm({
      type,
      quantity: "",
      price:
        type === "IN"
          ? material.purchasePrice || ""
          : material.purchasePrice || "",
      date: new Date()
        .toISOString()
        .split("T")[0],
      note: "",
    });

    setShowStockModal(true);
  };

  const saveStock = async (e) => {
    e.preventDefault();

    const quantity = Number(
      stockForm.quantity
    );

    if (!quantity || quantity <= 0) {
      alert("Enter valid quantity");
      return;
    }

    if (
      stockForm.type === "OUT" &&
      quantity >
        Number(selectedMaterial.currentStock)
    ) {
      alert(
        `Available stock: ${selectedMaterial.currentStock} ${selectedMaterial.unit}`
      );
      return;
    }

    try {
      const response = await fetch(
        `${API}/materials/${selectedMaterial._id}/stock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...stockForm,
            quantity,
            price:
              Number(stockForm.price) || 0,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed"
        );
      }

      alert(
        stockForm.type === "IN"
          ? "Stock added successfully"
          : "Stock issued successfully"
      );

      setShowStockModal(false);

      loadMaterials();
    } catch (error) {
      console.error(error);
      alert(error.message || "Stock update failed");
    }
  };

  // ======================================================
  // MATERIAL REQUEST
  // ======================================================

  const openRequestModal = (material) => {
    setSelectedMaterial(material);

    setRequestForm({
      quantity: "",
      requestedBy: "Site Manager",
      date: new Date()
        .toISOString()
        .split("T")[0],
      note: "",
    });

    setShowRequestModal(true);
  };

  const createRequest = async (e) => {
    e.preventDefault();

    const quantity = Number(
      requestForm.quantity
    );

    if (!quantity || quantity <= 0) {
      alert("Enter valid quantity");
      return;
    }

    try {
      const response = await fetch(
        `${API}/materials/${selectedMaterial._id}/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...requestForm,
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed"
        );
      }

      alert("Material request created");

      setShowRequestModal(false);

      loadMaterials();
    } catch (error) {
      console.error(error);
      alert(
        error.message ||
          "Request creation failed"
      );
    }
  };

  // ======================================================
  // REQUEST STATUS
  // ======================================================

  const updateRequestStatus = async (
    materialId,
    requestId,
    status
  ) => {
    try {
      const response = await fetch(
        `${API}/materials/${materialId}/request/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed"
        );
      }

      alert(
        `Request marked as ${status}`
      );

      loadMaterials();
    } catch (error) {
      console.error(error);
      alert(
        error.message ||
          "Request update failed"
      );
    }
  };

  // ======================================================
  // HISTORY
  // ======================================================

  const openHistory = (material) => {
    setSelectedMaterial(material);
    setShowHistoryModal(true);
  };

  // ======================================================
  // HELPERS
  // ======================================================

  const isLowStock = (material) =>
    Number(material.currentStock) <=
    Number(material.minimumStock);

  const formatMoney = (value) =>
    `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="materials-page">

      <style>{`
        .materials-page {
          padding: 24px;
          color: #172033;
        }

        .materials-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .materials-header h1 {
          margin: 0;
          font-size: 28px;
        }

        .materials-header p {
          margin: 6px 0 0;
          color: #687386;
        }

        .add-material-btn {
          border: none;
          background: #172033;
          color: white;
          padding: 12px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
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
          color: #737d8f;
          font-size: 13px;
        }

        .stat-card strong {
          display: block;
          margin-top: 8px;
          font-size: 25px;
        }

        .filters-box {
          background: white;
          border: 1px solid #e5e8ee;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          gap: 12px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .filters-box input,
        .filters-box select {
          padding: 11px 12px;
          border: 1px solid #dfe3e9;
          border-radius: 9px;
          outline: none;
          background: white;
        }

        .search-input {
          flex: 1;
          min-width: 220px;
        }

        .materials-table-box {
          background: white;
          border: 1px solid #e5e8ee;
          border-radius: 14px;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1100px;
        }

        th {
          background: #f7f8fa;
          text-align: left;
          padding: 14px;
          font-size: 12px;
          color: #687386;
          text-transform: uppercase;
        }

        td {
          padding: 14px;
          border-top: 1px solid #edf0f3;
          font-size: 14px;
        }

        .material-name {
          font-weight: 700;
        }

        .material-category {
          font-size: 12px;
          color: #788294;
          margin-top: 3px;
        }

        .stock-number {
          font-weight: 700;
        }

        .low-stock {
          color: #c0392b;
          font-weight: 700;
        }

        .stock-ok {
          color: #16834b;
          font-weight: 700;
        }

        .status-badge {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .status-low {
          background: #fff0ed;
          color: #c0392b;
        }

        .status-good {
          background: #eaf8f0;
          color: #16834b;
        }

        .action-buttons {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .action-buttons button {
          border: 1px solid #dfe3e9;
          background: white;
          padding: 7px 9px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 12px;
        }

        .action-buttons button:hover {
          background: #f4f6f8;
        }

        .empty-state {
          padding: 50px;
          text-align: center;
          color: #7a8494;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, .55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .modal {
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
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
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group.full {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          border: 1px solid #dfe3e9;
          border-radius: 9px;
          padding: 11px;
          outline: none;
          font-size: 14px;
        }

        .form-group textarea {
          min-height: 80px;
          resize: vertical;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .cancel-btn,
        .save-btn {
          border: none;
          padding: 11px 17px;
          border-radius: 9px;
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

        .selected-info {
          background: #f7f8fa;
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 16px;
        }

        .selected-info strong {
          display: block;
          font-size: 17px;
        }

        .history-item {
          border: 1px solid #e5e8ee;
          border-radius: 10px;
          padding: 13px;
          margin-bottom: 9px;
        }

        .history-top {
          display: flex;
          justify-content: space-between;
        }

        .request-item {
          border: 1px solid #e5e8ee;
          border-radius: 10px;
          padding: 13px;
          margin-top: 10px;
        }

        .request-actions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .request-actions button {
          border: 1px solid #ddd;
          background: white;
          border-radius: 7px;
          padding: 7px 10px;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .materials-page {
            padding: 14px;
          }

          .materials-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full {
            grid-column: auto;
          }
        }
      `}</style>

      {/* HEADER */}

      <div className="materials-header">
        <div>
          <h1>Material Management</h1>
          <p>
            Manage construction materials,
            inventory and site requests
          </p>
        </div>

        <button
          className="add-material-btn"
          onClick={openAddMaterial}
        >
          + Add Material
        </button>
      </div>

      {/* STATS */}

      <div className="stats-grid">

        <div className="stat-card">
          <span>Total Materials</span>
          <strong>
            {stats.totalMaterials}
          </strong>
        </div>

        <div className="stat-card">
          <span>Total Stock</span>
          <strong>
            {stats.totalStockUnits.toLocaleString(
              "en-IN"
            )}
          </strong>
        </div>

        <div className="stat-card">
          <span>Stock Value</span>
          <strong>
            {formatMoney(
              stats.totalStockValue
            )}
          </strong>
        </div>

        <div className="stat-card">
          <span>Low Stock</span>
          <strong
            className={
              stats.lowStock > 0
                ? "low-stock"
                : "stock-ok"
            }
          >
            {stats.lowStock}
          </strong>
        </div>

      </div>

      {/* FILTERS */}

      <div className="filters-box">

        <input
          className="search-input"
          placeholder="Search material, category or supplier..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
        >
          <option value="All">
            All Categories
          </option>

          {categories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) =>
            setStockFilter(e.target.value)
          }
        >
          <option value="All">
            All Stock
          </option>
          <option value="Low">
            Low Stock
          </option>
          <option value="Available">
            Available
          </option>
        </select>

      </div>

      {/* TABLE */}

      <div className="materials-table-box">

        {loading ? (
          <div className="empty-state">
            Loading materials...
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="empty-state">
            No materials found.
            <br />
            Add your first material using
            <b> + Add Material</b>.
          </div>
        ) : (
          <table>

            <thead>
              <tr>
                <th>Material</th>
                <th>Site</th>
                <th>Stock</th>
                <th>Min. Stock</th>
                <th>Supplier</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredMaterials.map(
                (material) => {

                  const low =
                    isLowStock(material);

                  return (
                    <tr key={material._id}>

                      <td>
                        <div className="material-name">
                          {material.name}
                        </div>

                        <div className="material-category">
                          {material.category}
                        </div>
                      </td>

                      <td>
                        {material.site}
                      </td>

                      <td>
                        <span
                          className={
                            low
                              ? "low-stock"
                              : "stock-number"
                          }
                        >
                          {material.currentStock}
                        </span>{" "}
                        {material.unit}
                      </td>

                      <td>
                        {material.minimumStock}{" "}
                        {material.unit}
                      </td>

                      <td>
                        {material.supplierName ||
                          "—"}
                      </td>

                      <td>
                        {formatMoney(
                          material.purchasePrice
                        )}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            low
                              ? "status-low"
                              : "status-good"
                          }`}
                        >
                          {low
                            ? "LOW STOCK"
                            : "IN STOCK"}
                        </span>
                      </td>

                      <td>

                        <div className="action-buttons">

                          <button
                            onClick={() =>
                              openStockModal(
                                material,
                                "IN"
                              )
                            }
                          >
                            + Stock
                          </button>

                          <button
                            onClick={() =>
                              openStockModal(
                                material,
                                "OUT"
                              )
                            }
                          >
                            − Issue
                          </button>

                          <button
                            onClick={() =>
                              openRequestModal(
                                material
                              )
                            }
                          >
                            Request
                          </button>

                          <button
                            onClick={() =>
                              openHistory(
                                material
                              )
                            }
                          >
                            History
                          </button>

                          <button
                            onClick={() =>
                              openEditMaterial(
                                material
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteMaterial(
                                material._id
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
          ADD / EDIT MATERIAL MODAL
          ================================================= */}

      {showMaterialModal && (
        <div className="modal-overlay">

          <div className="modal">

            <h2>
              {editingMaterial
                ? "Edit Material"
                : "Add Material"}
            </h2>

            <form onSubmit={saveMaterial}>

              <div className="form-grid">

                <div className="form-group full">
                  <label>
                    Material Name *
                  </label>

                  <input
                    name="name"
                    value={materialForm.name}
                    onChange={
                      handleMaterialChange
                    }
                    placeholder="e.g. Cement"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Category *
                  </label>

                  <select
                    name="category"
                    value={
                      materialForm.category
                    }
                    onChange={
                      handleMaterialChange
                    }
                  >
                    {categories.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Unit *
                  </label>

                  <select
                    name="unit"
                    value={materialForm.unit}
                    onChange={
                      handleMaterialChange
                    }
                  >
                    {units.map((unit) => (
                      <option
                        key={unit}
                        value={unit}
                      >
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                {!editingMaterial && (
                  <div className="form-group">
                    <label>
                      Opening Stock
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="currentStock"
                      value={
                        materialForm.currentStock
                      }
                      onChange={
                        handleMaterialChange
                      }
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>
                    Minimum Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="minimumStock"
                    value={
                      materialForm.minimumStock
                    }
                    onChange={
                      handleMaterialChange
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Site
                  </label>

                  <input
                    name="site"
                    value={materialForm.site}
                    onChange={
                      handleMaterialChange
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Supplier Name
                  </label>

                  <input
                    name="supplierName"
                    value={
                      materialForm.supplierName
                    }
                    onChange={
                      handleMaterialChange
                    }
                    placeholder="Supplier name"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Supplier Phone
                  </label>

                  <input
                    name="supplierPhone"
                    value={
                      materialForm.supplierPhone
                    }
                    onChange={
                      handleMaterialChange
                    }
                    placeholder="10 digit phone"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Purchase Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="purchasePrice"
                    value={
                      materialForm.purchasePrice
                    }
                    onChange={
                      handleMaterialChange
                    }
                    placeholder="₹"
                  />
                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowMaterialModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                >
                  {editingMaterial
                    ? "Update Material"
                    : "Save Material"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =================================================
          STOCK MODAL
          ================================================= */}

      {showStockModal &&
        selectedMaterial && (
          <div className="modal-overlay">

            <div className="modal">

              <h2>
                {stockForm.type === "IN"
                  ? "Add Stock"
                  : "Issue Stock"}
              </h2>

              <div className="selected-info">
                <strong>
                  {selectedMaterial.name}
                </strong>

                Current Stock:{" "}
                {selectedMaterial.currentStock}{" "}
                {selectedMaterial.unit}
              </div>

              <form onSubmit={saveStock}>

                <div className="form-grid">

                  <div className="form-group">
                    <label>
                      Quantity *
                    </label>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={
                        stockForm.quantity
                      }
                      onChange={(e) =>
                        setStockForm(
                          (prev) => ({
                            ...prev,
                            quantity:
                              e.target.value,
                          })
                        )
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Price / Unit
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        stockForm.price
                      }
                      onChange={(e) =>
                        setStockForm(
                          (prev) => ({
                            ...prev,
                            price:
                              e.target.value,
                          })
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Date
                    </label>

                    <input
                      type="date"
                      value={
                        stockForm.date
                      }
                      onChange={(e) =>
                        setStockForm(
                          (prev) => ({
                            ...prev,
                            date:
                              e.target.value,
                          })
                        )
                      }
                    />
                  </div>

                  <div className="form-group full">
                    <label>
                      Note
                    </label>

                    <textarea
                      value={
                        stockForm.note
                      }
                      onChange={(e) =>
                        setStockForm(
                          (prev) => ({
                            ...prev,
                            note:
                              e.target.value,
                          })
                        )
                      }
                      placeholder="Optional note..."
                    />
                  </div>

                </div>

                <div className="modal-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() =>
                      setShowStockModal(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-btn"
                  >
                    {stockForm.type === "IN"
                      ? "Add Stock"
                      : "Issue Stock"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      {/* =================================================
          REQUEST MODAL
          ================================================= */}

      {showRequestModal &&
        selectedMaterial && (
          <div className="modal-overlay">

            <div className="modal">

              <h2>
                Material Request
              </h2>

              <div className="selected-info">
                <strong>
                  {selectedMaterial.name}
                </strong>

                Available:{" "}
                {selectedMaterial.currentStock}{" "}
                {selectedMaterial.unit}
              </div>

              <form onSubmit={createRequest}>

                <div className="form-grid">

                  <div className="form-group">
                    <label>
                      Required Quantity *
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        requestForm.quantity
                      }
                      onChange={(e) =>
                        setRequestForm(
                          (prev) => ({
                            ...prev,
                            quantity:
                              e.target.value,
                          })
                        )
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Requested By
                    </label>

                    <input
                      value={
                        requestForm.requestedBy
                      }
                      onChange={(e) =>
                        setRequestForm(
                          (prev) => ({
                            ...prev,
                            requestedBy:
                              e.target.value,
                          })
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Date
                    </label>

                    <input
                      type="date"
                      value={
                        requestForm.date
                      }
                      onChange={(e) =>
                        setRequestForm(
                          (prev) => ({
                            ...prev,
                            date:
                              e.target.value,
                          })
                        )
                      }
                    />
                  </div>

                  <div className="form-group full">
                    <label>
                      Note
                    </label>

                    <textarea
                      value={
                        requestForm.note
                      }
                      onChange={(e) =>
                        setRequestForm(
                          (prev) => ({
                            ...prev,
                            note:
                              e.target.value,
                          })
                        )
                      }
                      placeholder="Why is this material required?"
                    />
                  </div>

                </div>

                <div className="modal-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() =>
                      setShowRequestModal(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-btn"
                  >
                    Create Request
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      {/* =================================================
          HISTORY MODAL
          ================================================= */}

      {showHistoryModal &&
        selectedMaterial && (
          <div className="modal-overlay">

            <div className="modal">

              <h2>
                {selectedMaterial.name} —
                History
              </h2>

              <div className="selected-info">
                Current Stock:{" "}
                <strong>
                  {selectedMaterial.currentStock}{" "}
                  {selectedMaterial.unit}
                </strong>
              </div>

              <h3>
                Stock Transactions
              </h3>

              {selectedMaterial
                .transactions?.length === 0 ? (
                <p>
                  No stock transactions yet.
                </p>
              ) : (
                selectedMaterial.transactions?.map(
                  (transaction) => (
                    <div
                      className="history-item"
                      key={
                        transaction._id
                      }
                    >

                      <div className="history-top">

                        <strong>
                          {transaction.type ===
                          "IN"
                            ? "Stock In"
                            : "Stock Out"}
                        </strong>

                        <strong
                          className={
                            transaction.type ===
                            "IN"
                              ? "stock-ok"
                              : "low-stock"
                          }
                        >
                          {transaction.type ===
                          "IN"
                            ? "+"
                            : "-"}
                          {
                            transaction.quantity
                          }{" "}
                          {
                            selectedMaterial.unit
                          }
                        </strong>

                      </div>

                      <div>
                        Date:{" "}
                        {transaction.date}
                      </div>

                      <div>
                        Cost:{" "}
                        {formatMoney(
                          transaction.totalCost
                        )}
                      </div>

                      {transaction.note && (
                        <div>
                          Note:{" "}
                          {transaction.note}
                        </div>
                      )}

                    </div>
                  )
                )
              )}

              <h3>
                Material Requests
              </h3>

              {selectedMaterial
                .requests?.length === 0 ? (
                <p>
                  No requests yet.
                </p>
              ) : (
                selectedMaterial.requests?.map(
                  (request) => (
                    <div
                      className="request-item"
                      key={request._id}
                    >

                      <strong>
                        {request.quantity}{" "}
                        {
                          selectedMaterial.unit
                        }
                      </strong>

                      <div>
                        Requested by:{" "}
                        {
                          request.requestedBy
                        }
                      </div>

                      <div>
                        Date:{" "}
                        {request.date}
                      </div>

                      <div>
                        Status:{" "}
                        <b>
                          {request.status}
                        </b>
                      </div>

                      {request.note && (
                        <div>
                          Note:{" "}
                          {request.note}
                        </div>
                      )}

                      <div className="request-actions">

                        {request.status ===
                          "Pending" && (
                          <>
                            <button
                              onClick={() =>
                                updateRequestStatus(
                                  selectedMaterial._id,
                                  request._id,
                                  "Approved"
                                )
                              }
                            >
                              Approve
                            </button>

                            <button
                              onClick={() =>
                                updateRequestStatus(
                                  selectedMaterial._id,
                                  request._id,
                                  "Rejected"
                                )
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {request.status ===
                          "Approved" && (
                          <button
                            onClick={() =>
                              updateRequestStatus(
                                selectedMaterial._id,
                                request._id,
                                "Issued"
                              )
                            }
                          >
                            Issue Material
                          </button>
                        )}

                      </div>

                    </div>
                  )
                )
              )}

              <div className="modal-actions">

                <button
                  className="cancel-btn"
                  onClick={() =>
                    setShowHistoryModal(false)
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

export default Materials;