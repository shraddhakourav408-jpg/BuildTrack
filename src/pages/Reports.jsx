import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

const API =
  `http://${window.location.hostname}:5001/api`;

function Reports() {
  const [report, setReport] =
    useState(null);

  const [vehicles, setVehicles] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [month, setMonth] =
    useState("all");

  const [vehicleId, setVehicleId] =
    useState("all");

  const [activeSection, setActiveSection] =
    useState("overview");

  // ==================================================
  // LOAD VEHICLES
  // ==================================================

  const loadVehicles = async () => {
    try {
      const response =
        await fetch(
          `${API}/vehicles`
        );

      const data =
        await response.json();

      setVehicles(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);
    }
  };

  // ==================================================
  // LOAD REPORT
  // ==================================================

  const loadReport = async () => {
    try {
      setLoading(true);

      const params =
        new URLSearchParams();

      params.set(
        "month",
        month
      );

      params.set(
        "vehicleId",
        vehicleId
      );

      const response =
        await fetch(
          `${API}/reports/summary?${params.toString()}`
        );

      if (!response.ok) {
        throw new Error(
          "Report failed"
        );
      }

      const data =
        await response.json();

      setReport(data);
    } catch (error) {
      console.error(error);

      alert(
        "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    loadReport();
  }, [month, vehicleId]);

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
  // CSV
  // ==================================================

  const downloadCSV = (
    filename,
    rows
  ) => {
    if (!rows.length) {
      alert(
        "No data available"
      );
      return;
    }

    const headers =
      Object.keys(
        rows[0]
      );

    const csv = [
      headers.join(","),
      ...rows.map(
        (row) =>
          headers
            .map((header) => {
              const value =
                row[header] ??
                "";

              return `"${String(
                value
              ).replace(
                /"/g,
                '""'
              )}"`;
            })
            .join(",")
      ),
    ].join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;
    link.download =
      filename;

    link.click();

    URL.revokeObjectURL(
      url
    );
  };

  // ==================================================
  // EXPORT VEHICLES
  // ==================================================

  const exportVehicles = () => {
    if (!report) return;

    const rows =
      report.vehicles.map(
        (vehicle) => ({
          Vehicle:
            vehicle.number,

          Type:
            vehicle.type,

          Site:
            vehicle.site,

          Driver:
            vehicle.driver,

          "Fuel Litres":
            vehicle.litres,

          "Fuel Expense":
            vehicle.fuelExpense,

          "Maintenance Expense":
            vehicle.maintenanceExpense,

          "Total Expense":
            vehicle.totalExpense,

          "Maintenance Count":
            vehicle.maintenanceCount,
        })
      );

    downloadCSV(
      "BuildTrack-Vehicle-Report.csv",
      rows
    );
  };

  // ==================================================
  // EXPORT MATERIALS
  // ==================================================

  const exportMaterials = () => {
    if (!report) return;

    const rows =
      report.materials.map(
        (material) => ({
          Material:
            material.name,

          Category:
            material.category,

          Unit:
            material.unit,

          "Current Stock":
            material.currentStock,

          "Minimum Stock":
            material.minimumStock,

          "Price":
            material.price,

          "Stock Value":
            material.stockValue,

          Status:
            material.lowStock
              ? "Low Stock"
              : "In Stock",
        })
      );

    downloadCSV(
      "BuildTrack-Material-Report.csv",
      rows
    );
  };

  // ==================================================
  // PRINT
  // ==================================================

  const printReport = () => {
    window.print();
  };

  // ==================================================
  // MAX COST
  // ==================================================

  const maxMaintenanceCost =
    useMemo(() => {
      if (
        !report?.maintenanceTypes
          ?.length
      ) {
        return 1;
      }

      return Math.max(
        ...report.maintenanceTypes.map(
          (item) =>
            Number(
              item.cost || 0
            )
        ),
        1
      );
    }, [report]);

  // ==================================================
  // LOADING
  // ==================================================

  if (loading && !report) {
    return (
      <div
        style={{
          padding: "30px",
        }}
      >
        Loading BuildTrack Reports...
      </div>
    );
  }

  if (!report) {
    return (
      <div
        style={{
          padding: "30px",
        }}
      >
        Report data unavailable.
      </div>
    );
  }

  const o =
    report.overview;

  return (
    <div className="reports-page">

      <style>{`

        .reports-page {
          padding: 24px;
          color: #172033;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 22px;
        }

        .report-header h1 {
          margin: 0;
          font-size: 29px;
        }

        .report-header p {
          margin: 6px 0 0;
          color: #707b8d;
        }

        .report-actions {
          display: flex;
          gap: 9px;
        }

        .report-actions button {
          border: 1px solid #dfe3e9;
          background: white;
          padding: 10px 14px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 600;
        }

        .report-actions button.primary {
          background: #172033;
          color: white;
          border-color: #172033;
        }

        .filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          background: white;
          border: 1px solid #e5e8ee;
          padding: 14px;
          border-radius: 13px;
          margin-bottom: 20px;
        }

        .filters select {
          padding: 10px 12px;
          border: 1px solid #dfe3e9;
          border-radius: 8px;
          background: white;
        }

        .report-nav {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .report-nav button {
          border: 1px solid #dfe3e9;
          background: white;
          padding: 10px 14px;
          border-radius: 9px;
          cursor: pointer;
        }

        .report-nav button.active {
          background: #172033;
          color: white;
          border-color: #172033;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .kpi {
          background: white;
          border: 1px solid #e5e8ee;
          border-radius: 14px;
          padding: 18px;
        }

        .kpi-label {
          color: #737d8f;
          font-size: 13px;
        }

        .kpi-value {
          font-size: 25px;
          font-weight: 800;
          margin-top: 8px;
        }

        .kpi-small {
          font-size: 12px;
          margin-top: 5px;
          color: #7b8493;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns:
            1.4fr 1fr;
          gap: 18px;
          margin-bottom: 20px;
        }

        .panel {
          background: white;
          border: 1px solid #e5e8ee;
          border-radius: 14px;
          padding: 19px;
        }

        .panel h2 {
          margin-top: 0;
          font-size: 18px;
        }

        .expense-item {
          margin: 18px 0;
        }

        .expense-head {
          display: flex;
          justify-content: space-between;
          margin-bottom: 7px;
          font-size: 13px;
        }

        .bar {
          height: 10px;
          border-radius: 20px;
          background: #eef0f3;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 20px;
          background: #172033;
        }

        .alert {
          padding: 12px;
          border-radius: 9px;
          margin-bottom: 9px;
          font-size: 13px;
        }

        .alert-red {
          background: #fff0ed;
          color: #b52e20;
        }

        .alert-yellow {
          background: #fff8e7;
          color: #956800;
        }

        .alert-green {
          background: #eaf8f0;
          color: #16834b;
        }

        .table-panel {
          background: white;
          border: 1px solid #e5e8ee;
          border-radius: 14px;
          overflow-x: auto;
          margin-bottom: 20px;
        }

        .table-panel table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        .table-panel th {
          text-align: left;
          background: #f7f8fa;
          padding: 13px;
          color: #687386;
          font-size: 12px;
        }

        .table-panel td {
          padding: 13px;
          border-top: 1px solid #edf0f3;
          font-size: 13px;
        }

        .badge {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .badge-low {
          background: #fff0ed;
          color: #c0392b;
        }

        .badge-good {
          background: #eaf8f0;
          color: #16834b;
        }

        .chart-row {
          margin-bottom: 15px;
        }

        .chart-head {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .chart-track {
          height: 13px;
          background: #eef0f3;
          border-radius: 20px;
          overflow: hidden;
        }

        .chart-value {
          height: 100%;
          background: #172033;
          border-radius: 20px;
        }

        .empty {
          text-align: center;
          padding: 30px;
          color: #778193;
        }

        .generated {
          color: #8a93a2;
          font-size: 12px;
          margin-top: 10px;
        }

        @media(max-width: 1000px) {
          .kpi-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        @media(max-width: 600px) {
          .reports-page {
            padding: 14px;
          }

          .report-header {
            flex-direction: column;
          }

          .kpi-grid {
            grid-template-columns:
              1fr 1fr;
          }
        }

        @media print {

          .reports-page {
            padding: 0;
          }

          .report-actions,
          .filters,
          .report-nav {
            display: none !important;
          }

          .panel,
          .kpi,
          .table-panel {
            break-inside: avoid;
          }

          body {
            background: white !important;
          }
        }

      `}</style>

      {/* HEADER */}

      <div className="report-header">

        <div>
          <h1>
            Reports & Analytics
          </h1>

          <p>
            BuildTrack project performance
            and management insights
          </p>

          <div className="generated">
            Generated:{" "}
            {new Date(
              report.generatedAt
            ).toLocaleString(
              "en-IN"
            )}
          </div>
        </div>

        <div className="report-actions">

          <button
            onClick={printReport}
          >
            🖨 Print / PDF
          </button>

          <button
            className="primary"
            onClick={() =>
              exportVehicles()
            }
          >
            ↓ Export CSV
          </button>

        </div>

      </div>

      {/* FILTERS */}

      <div className="filters">

        <select
          value={month}
          onChange={(e) =>
            setMonth(
              e.target.value
            )
          }
        >
          <option value="all">
            All Time
          </option>

          <option value="2026-09">
            September 2026
          </option>

          <option value="2026-08">
            August 2026
          </option>

          <option value="2026-07">
            July 2026
          </option>

          <option value="2026-06">
            June 2026
          </option>
        </select>

        <select
          value={vehicleId}
          onChange={(e) =>
            setVehicleId(
              e.target.value
            )
          }
        >
          <option value="all">
            All Vehicles
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

      </div>

      {/* NAVIGATION */}

      <div className="report-nav">

        {[
          [
            "overview",
            "📊 Overview",
          ],
          [
            "vehicles",
            "🚛 Fleet",
          ],
          [
            "materials",
            "🧱 Materials",
          ],
          [
            "maintenance",
            "🔧 Maintenance",
          ],
        ].map(
          ([key, label]) => (
            <button
              key={key}
              className={
                activeSection ===
                key
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection(
                  key
                )
              }
            >
              {label}
            </button>
          )
        )}

      </div>

      {/* =================================================
          OVERVIEW
          ================================================= */}

      {activeSection ===
        "overview" && (
        <>

          <div className="kpi-grid">

            <div className="kpi">
              <div className="kpi-label">
                Total Workers
              </div>

              <div className="kpi-value">
                {o.workers}
              </div>
            </div>

            <div className="kpi">
              <div className="kpi-label">
                Total Vehicles
              </div>

              <div className="kpi-value">
                {o.vehicles}
              </div>
            </div>

            <div className="kpi">
              <div className="kpi-label">
                Fuel Expense
              </div>

              <div className="kpi-value">
                {money(
                  o.fuelCost
                )}
              </div>

              <div className="kpi-small">
                {o.totalFuelLitres.toFixed(
                  1
                )} L consumed
              </div>
            </div>

            <div className="kpi">
              <div className="kpi-label">
                Maintenance Expense
              </div>

              <div className="kpi-value">
                {money(
                  o.maintenanceCost
                )}
              </div>
            </div>

          </div>

          <div className="dashboard-grid">

            <div className="panel">

              <h2>
                💰 Expense Overview
              </h2>

              <div className="expense-item">

                <div className="expense-head">
                  <span>
                    Fuel
                  </span>

                  <strong>
                    {money(
                      o.fuelCost
                    )}
                  </strong>
                </div>

                <div className="bar">

                  <div
                    className="bar-fill"
                    style={{
                      width:
                        o.totalExpense >
                        0
                          ? `${
                              (
                                o.fuelCost /
                                o.totalExpense
                              ) *
                              100
                            }%`
                          : "0%",
                    }}
                  />

                </div>

              </div>

              <div className="expense-item">

                <div className="expense-head">
                  <span>
                    Maintenance
                  </span>

                  <strong>
                    {money(
                      o.maintenanceCost
                    )}
                  </strong>
                </div>

                <div className="bar">

                  <div
                    className="bar-fill"
                    style={{
                      width:
                        o.totalExpense >
                        0
                          ? `${
                              (
                                o.maintenanceCost /
                                o.totalExpense
                              ) *
                              100
                            }%`
                          : "0%",
                    }}
                  />

                </div>

              </div>

              <div className="expense-head">

                <strong>
                  Total Operational Expense
                </strong>

                <strong>
                  {money(
                    o.totalExpense
                  )}
                </strong>

              </div>

            </div>

            <div className="panel">

              <h2>
                🚨 Alerts
              </h2>

              {o.lowStock > 0 && (
                <div className="alert alert-red">
                  ⚠️ {o.lowStock} material(s)
                  are below minimum stock.
                </div>
              )}

              {o.breakdowns > 0 && (
                <div className="alert alert-red">
                  🚨 {o.breakdowns} active
                  breakdown record(s).
                </div>
              )}

              {o.maintenanceInProgress >
                0 && (
                <div className="alert alert-yellow">
                  🔧{" "}
                  {
                    o.maintenanceInProgress
                  } vehicle(s) are under
                  maintenance.
                </div>
              )}

              {o.lowStock === 0 &&
                o.breakdowns === 0 && (
                  <div className="alert alert-green">
                    ✓ No critical alerts.
                  </div>
                )}

            </div>

          </div>

          <div className="dashboard-grid">

            <div className="panel">

              <h2>
                ⛽ Fuel Analysis
              </h2>

              {report.fuelTypes.map(
                (item) => (
                  <div
                    className="chart-row"
                    key={
                      item.type
                    }
                  >

                    <div className="chart-head">

                      <span>
                        {
                          item.type
                        }
                      </span>

                      <strong>
                        {item.litres.toFixed(
                          1
                        )} L ·{" "}
                        {money(
                          item.cost
                        )}
                      </strong>

                    </div>

                    <div className="chart-track">

                      <div
                        className="chart-value"
                        style={{
                          width:
                            o.totalFuelLitres >
                            0
                              ? `${
                                  (
                                    item.litres /
                                    o.totalFuelLitres
                                  ) *
                                  100
                                }%`
                              : "0%",
                        }}
                      />

                    </div>

                  </div>
                )
              )}

            </div>

            <div className="panel">

              <h2>
                🔧 Maintenance Analysis
              </h2>

              {report.maintenanceTypes.map(
                (item) => (
                  <div
                    className="chart-row"
                    key={
                      item.type
                    }
                  >

                    <div className="chart-head">

                      <span>
                        {
                          item.type
                        }
                      </span>

                      <strong>
                        {item.count} ·{" "}
                        {money(
                          item.cost
                        )}
                      </strong>

                    </div>

                    <div className="chart-track">

                      <div
                        className="chart-value"
                        style={{
                          width:
                            maxMaintenanceCost >
                            0
                              ? `${
                                  (
                                    item.cost /
                                    maxMaintenanceCost
                                  ) *
                                  100
                                }%`
                              : "0%",
                        }}
                      />

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

        </>
      )}

      {/* =================================================
          VEHICLES
          ================================================= */}

      {activeSection ===
        "vehicles" && (
        <div className="table-panel">

          <div
            style={{
              padding:
                "18px",
              display:
                "flex",
              justifyContent:
                "space-between",
            }}
          >

            <h2
              style={{
                margin: 0,
              }}
            >
              Fleet Performance
            </h2>

            <button
              onClick={
                exportVehicles
              }
            >
              ↓ Export CSV
            </button>

          </div>

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
                  Fuel
                </th>

                <th>
                  Fuel Cost
                </th>

                <th>
                  Maintenance
                </th>

                <th>
                  Total Expense
                </th>

                <th>
                  Status
                </th>
              </tr>

            </thead>

            <tbody>

              {report.vehicles.map(
                (vehicle) => (
                  <tr
                    key={
                      vehicle.id
                    }
                  >

                    <td>
                      <strong>
                        {
                          vehicle.number
                        }
                      </strong>
                      <br />
                      <small>
                        {
                          vehicle.type
                        }
                      </small>
                    </td>

                    <td>
                      {
                        vehicle.driver
                      }
                    </td>

                    <td>
                      {vehicle.litres.toFixed(
                        1
                      )} L
                    </td>

                    <td>
                      {money(
                        vehicle.fuelExpense
                      )}
                    </td>

                    <td>
                      {money(
                        vehicle.maintenanceExpense
                      )}
                    </td>

                    <td>
                      <strong>
                        {money(
                          vehicle.totalExpense
                        )}
                      </strong>
                    </td>

                    <td>
                      {vehicle.status}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>
      )}

      {/* =================================================
          MATERIALS
          ================================================= */}

      {activeSection ===
        "materials" && (
        <div className="table-panel">

          <div
            style={{
              padding:
                "18px",
              display:
                "flex",
              justifyContent:
                "space-between",
            }}
          >

            <h2
              style={{
                margin: 0,
              }}
            >
              Inventory Report
            </h2>

            <button
              onClick={
                exportMaterials
              }
            >
              ↓ Export CSV
            </button>

          </div>

          <table>

            <thead>

              <tr>
                <th>
                  Material
                </th>

                <th>
                  Category
                </th>

                <th>
                  Stock
                </th>

                <th>
                  Minimum
                </th>

                <th>
                  Price
                </th>

                <th>
                  Stock Value
                </th>

                <th>
                  Status
                </th>
              </tr>

            </thead>

            <tbody>

              {report.materials.map(
                (material) => (
                  <tr
                    key={
                      material.id
                    }
                  >

                    <td>
                      <strong>
                        {
                          material.name
                        }
                      </strong>
                    </td>

                    <td>
                      {
                        material.category
                      }
                    </td>

                    <td>
                      {
                        material.currentStock
                      }{" "}
                      {
                        material.unit
                      }
                    </td>

                    <td>
                      {
                        material.minimumStock
                      }{" "}
                      {
                        material.unit
                      }
                    </td>

                    <td>
                      {money(
                        material.price
                      )}
                    </td>

                    <td>
                      {money(
                        material.stockValue
                      )}
                    </td>

                    <td>

                      <span
                        className={`badge ${
                          material.lowStock
                            ? "badge-low"
                            : "badge-good"
                        }`}
                      >
                        {material.lowStock
                          ? "LOW STOCK"
                          : "IN STOCK"}
                      </span>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>
      )}

      {/* =================================================
          MAINTENANCE
          ================================================= */}

      {activeSection ===
        "maintenance" && (
        <div className="table-panel">

          <div
            style={{
              padding:
                "18px",
            }}
          >

            <h2
              style={{
                marginTop: 0,
              }}
            >
              Maintenance Summary
            </h2>

            <div className="kpi-grid">

              <div className="kpi">
                <div className="kpi-label">
                  Total
                </div>

                <div className="kpi-value">
                  {
                    o.maintenanceTotal
                  }
                </div>
              </div>

              <div className="kpi">
                <div className="kpi-label">
                  Completed
                </div>

                <div className="kpi-value">
                  {
                    o.maintenanceCompleted
                  }
                </div>
              </div>

              <div className="kpi">
                <div className="kpi-label">
                  In Progress
                </div>

                <div className="kpi-value">
                  {
                    o.maintenanceInProgress
                  }
                </div>
              </div>

              <div className="kpi">
                <div className="kpi-label">
                  Breakdowns
                </div>

                <div className="kpi-value">
                  {o.breakdowns}
                </div>
              </div>

            </div>

            <h3>
              Maintenance Cost by Type
            </h3>

            {report.maintenanceTypes.map(
              (item) => (
                <div
                  className="chart-row"
                  key={
                    item.type
                  }
                >

                  <div className="chart-head">

                    <span>
                      {
                        item.type
                      }
                    </span>

                    <strong>
                      {item.count} records ·{" "}
                      {money(
                        item.cost
                      )}
                    </strong>

                  </div>

                  <div className="chart-track">

                    <div
                      className="chart-value"
                      style={{
                        width:
                          maxMaintenanceCost >
                          0
                            ? `${
                                (
                                  item.cost /
                                  maxMaintenanceCost
                                ) *
                                100
                              }%`
                            : "0%",
                      }}
                    />

                  </div>

                </div>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default Reports;