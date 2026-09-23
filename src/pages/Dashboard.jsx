import React, { useEffect, useMemo, useState } from "react";

const API =
  `http://${window.location.hostname}:5001/api`;

function Dashboard({ setActivePage }) {
  const [workers, setWorkers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [fuel, setFuel] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [now, setNow] = useState(new Date());

  const [adminName, setAdminName] =
    useState("Shraddha Kourav");

  const [siteName, setSiteName] =
    useState("Site A");

  // =====================================================
  // LIVE CLOCK
  // =====================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // =====================================================
  // SETTINGS
  // =====================================================

  useEffect(() => {
    try {
      const profile = localStorage.getItem(
        "buildtrack_profile"
      );

      const site = localStorage.getItem(
        "buildtrack_site"
      );

      if (profile) {
        const parsed = JSON.parse(profile);

        if (parsed.name) {
          setAdminName(parsed.name);
        }
      }

      if (site) {
        const parsed = JSON.parse(site);

        if (parsed.siteName) {
          setSiteName(parsed.siteName);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  // =====================================================
  // FETCH HELPER
  // =====================================================

  const fetchData = async (endpoint) => {
    try {
      const response = await fetch(
        `${API}${endpoint}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed: ${endpoint}`
        );
      }

      return await response.json();
    } catch (error) {
      console.log(
        `Dashboard ${endpoint}:`,
        error
      );

      return [];
    }
  };

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        workersData,
        vehiclesData,
        fuelData,
        materialsData,
        maintenanceData,
      ] = await Promise.all([
        fetchData("/workers"),
        fetchData("/vehicles"),
        fetchData("/fuel"),
        fetchData("/materials"),
        fetchData("/maintenance"),
      ]);

      setWorkers(
        Array.isArray(workersData)
          ? workersData
          : workersData?.workers || []
      );

      setVehicles(
        Array.isArray(vehiclesData)
          ? vehiclesData
          : vehiclesData?.vehicles || []
      );

      setFuel(
        Array.isArray(fuelData)
          ? fuelData
          : fuelData?.fuel || []
      );

      setMaterials(
        Array.isArray(materialsData)
          ? materialsData
          : materialsData?.materials || []
      );

      setMaintenance(
        Array.isArray(maintenanceData)
          ? maintenanceData
          : maintenanceData?.maintenance || []
      );

      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // =====================================================
  // HELPERS
  // =====================================================

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 0,
      }
    )}`;

  const getMaterialStock = (item) =>
    Number(
      item.currentStock ??
        item.stock ??
        item.quantity ??
        0
    );

  const getMaterialMinimum = (item) =>
    Number(
      item.minimumStock ??
        item.minStock ??
        item.minQuantity ??
        0
    );

  const getMaterialPrice = (item) =>
    Number(
      item.purchasePrice ??
        item.price ??
        item.rate ??
        0
    );

  const getMaintenanceCost = (item) =>
    Number(
      item.totalCost ??
        item.cost ??
        item.amount ??
        0
    );

  const getFuelCost = (item) =>
    Number(
      item.totalAmount ??
        item.totalCost ??
        item.amount ??
        0
    );

  const getFuelLitres = (item) =>
    Number(
      item.litres ??
        item.quantity ??
        0
    );

  // =====================================================
  // BASIC COUNTS
  // =====================================================

  const activeWorkers =
    workers.filter(
      (worker) =>
        String(
          worker.status || ""
        ).toLowerCase() === "active"
    ).length;

  const activeVehicles =
    vehicles.filter(
      (vehicle) =>
        String(
          vehicle.status || ""
        ).toLowerCase() === "active"
    ).length;

  const maintenanceVehicles =
    vehicles.filter(
      (vehicle) =>
        String(
          vehicle.status || ""
        ).toLowerCase() ===
        "maintenance"
    ).length;

  // =====================================================
  // FUEL
  // =====================================================

  const totalFuelCost =
    fuel.reduce(
      (sum, item) =>
        sum + getFuelCost(item),
      0
    );

  const totalFuelLitres =
    fuel.reduce(
      (sum, item) =>
        sum + getFuelLitres(item),
      0
    );

  // =====================================================
  // MAINTENANCE
  // =====================================================

  const totalMaintenanceCost =
    maintenance.reduce(
      (sum, item) =>
        sum +
        getMaintenanceCost(item),
      0
    );

  const activeMaintenance =
    maintenance.filter(
      (item) => {
        const status =
          String(
            item.status || ""
          ).toLowerCase();

        return (
          status ===
            "in progress" ||
          status === "pending" ||
          status === "scheduled"
        );
      }
    ).length;

  const breakdownCount =
    maintenance.filter(
      (item) =>
        item.breakdown === true ||
        String(
          item.type ||
            item.maintenanceType ||
            ""
        ).toLowerCase() ===
          "breakdown"
    ).length;

  // =====================================================
  // MATERIALS
  // =====================================================

  const lowStockMaterials =
    materials.filter(
      (item) =>
        getMaterialStock(item) <=
        getMaterialMinimum(item)
    );

  const totalStockValue =
    materials.reduce(
      (sum, item) =>
        sum +
        getMaterialStock(item) *
          getMaterialPrice(item),
      0
    );

  // =====================================================
  // TOTAL EXPENSE
  // =====================================================

  const totalExpense =
    totalFuelCost +
    totalMaintenanceCost;

  // =====================================================
  // PROJECT HEALTH
  // =====================================================

  const healthScore = useMemo(() => {
    let score = 100;

    if (lowStockMaterials.length > 0) {
      score -= Math.min(
        lowStockMaterials.length * 5,
        20
      );
    }

    if (maintenanceVehicles > 0) {
      score -= Math.min(
        maintenanceVehicles * 5,
        15
      );
    }

    if (breakdownCount > 0) {
      score -= Math.min(
        breakdownCount * 8,
        20
      );
    }

    if (activeWorkers === 0) {
      score -= 10;
    }

    return Math.max(score, 0);
  }, [
    lowStockMaterials.length,
    maintenanceVehicles,
    breakdownCount,
    activeWorkers,
  ]);

  // =====================================================
  // EXPENSE %
  // =====================================================

  const fuelPercentage =
    totalExpense > 0
      ? (totalFuelCost /
          totalExpense) *
        100
      : 0;

  const maintenancePercentage =
    totalExpense > 0
      ? (totalMaintenanceCost /
          totalExpense) *
        100
      : 0;

  // =====================================================
  // RECENT ACTIVITIES
  // =====================================================

  const activities = useMemo(() => {
    const list = [];

    fuel.slice(-4).forEach((item) => {
      list.push({
        icon: "⛽",
        title: "Fuel entry recorded",
        description:
          item.vehicleId?.number ||
          item.vehicle?.number ||
          "Vehicle",
        amount: money(
          getFuelCost(item)
        ),
        date:
          item.date ||
          item.createdAt ||
          "",
      });
    });

    maintenance
      .slice(-4)
      .forEach((item) => {
        list.push({
          icon: "🔧",
          title: "Maintenance activity",
          description:
            item.vehicleId?.number ||
            item.vehicle?.number ||
            "Vehicle",
          amount: money(
            getMaintenanceCost(item)
          ),
          date:
            item.date ||
            item.createdAt ||
            "",
        });
      });

    return list
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0, 5);
  }, [
    fuel,
    maintenance,
  ]);

  // =====================================================
  // QUICK ACTION
  // =====================================================

  const goTo = (page) => {
    if (setActivePage) {
      setActivePage(page);
    }
  };

  // =====================================================
  // DATE
  // =====================================================

  const formattedDate =
    now.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  const formattedTime =
    now.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="bt-dashboard">

      <style>{`

        * {
          box-sizing: border-box;
        }

        .bt-dashboard {
          padding: 24px;
          color: #172033;
          background: #f7f8fa;
          min-height: 100%;
        }

        /* =========================================
           HERO
           ========================================= */

        .bt-hero {
          position: relative;
          overflow: hidden;
          border-radius: 22px;
          padding: 28px;
          color: white;
          background:
            linear-gradient(
              135deg,
              #101827 0%,
              #1c2b45 55%,
              #273c5d 100%
            );
          margin-bottom: 20px;
          box-shadow:
            0 16px 35px rgba(
              23,
              32,
              51,
              .16
            );
        }

        .bt-hero:before {
          content: "";
          position: absolute;
          width: 280px;
          height: 280px;
          right: -100px;
          top: -150px;
          border-radius: 50%;
          background: rgba(
            255,
            255,
            255,
            .07
          );
        }

        .bt-hero:after {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          right: 160px;
          bottom: -120px;
          border-radius: 50%;
          background: rgba(
            255,
            255,
            255,
            .05
          );
        }

        .hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .hero-kicker {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          opacity: .7;
          margin-bottom: 8px;
        }

        .hero-title {
          font-size: 30px;
          font-weight: 800;
          margin: 0;
        }

        .hero-subtitle {
          margin: 8px 0 0;
          opacity: .75;
          font-size: 14px;
        }

        .hero-right {
          text-align: right;
        }

        .hero-time {
          font-size: 25px;
          font-weight: 700;
        }

        .hero-date {
          font-size: 12px;
          opacity: .7;
          margin-top: 4px;
        }

        .live-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          padding: 6px 10px;
          border-radius: 20px;
          background: rgba(
            255,
            255,
            255,
            .1
          );
          font-size: 11px;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #65e6a5;
          box-shadow:
            0 0 0 4px
            rgba(
              101,
              230,
              165,
              .12
            );
        }

        /* =========================================
           KPI
           ========================================= */

        .kpi-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .kpi-card {
          background: white;
          border: 1px solid #e5e8ee;
          border-radius: 16px;
          padding: 18px;
          position: relative;
          overflow: hidden;
          transition: .2s;
        }

        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 10px 25px
            rgba(
              23,
              32,
              51,
              .07
            );
        }

        .kpi-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .kpi-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f3f6;
          font-size: 19px;
        }

        .kpi-label {
          color: #7a8494;
          font-size: 12px;
          font-weight: 600;
        }

        .kpi-number {
          margin-top: 10px;
          font-size: 25px;
          font-weight: 800;
        }

        .kpi-foot {
          color: #87909f;
          font-size: 11px;
          margin-top: 5px;
        }

        /* =========================================
           MAIN GRID
           ========================================= */

        .main-grid {
          display: grid;
          grid-template-columns:
            1.45fr .85fr;
          gap: 18px;
          margin-bottom: 20px;
        }

        .panel {
          background: white;
          border: 1px solid #e5e8ee;
          border-radius: 16px;
          padding: 19px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .panel-title {
          margin: 0;
          font-size: 17px;
        }

        .panel-subtitle {
          color: #8992a1;
          font-size: 11px;
          margin-top: 4px;
        }

        .refresh-btn {
          border: 1px solid #e0e4e9;
          background: white;
          border-radius: 8px;
          padding: 8px 11px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .refresh-btn:hover {
          background: #f5f6f8;
        }

        /* =========================================
           EXPENSE
           ========================================= */

        .expense-total {
          font-size: 29px;
          font-weight: 800;
          margin-bottom: 20px;
        }

        .expense-row {
          margin-bottom: 18px;
        }

        .expense-label {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 7px;
        }

        .expense-label span {
          color: #697487;
        }

        .expense-track {
          height: 10px;
          border-radius: 20px;
          background: #eef0f3;
          overflow: hidden;
        }

        .expense-fill {
          height: 100%;
          border-radius: 20px;
        }

        .fuel-fill {
          background: #273c5d;
        }

        .maintenance-fill {
          background: #65738a;
        }

        .expense-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 20px;
        }

        .expense-mini {
          padding: 12px;
          border-radius: 10px;
          background: #f7f8fa;
        }

        .expense-mini span {
          display: block;
          color: #7b8492;
          font-size: 11px;
        }

        .expense-mini strong {
          display: block;
          margin-top: 5px;
          font-size: 15px;
        }

        /* =========================================
           HEALTH
           ========================================= */

        .health-wrap {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .health-circle {
          width: 125px;
          height: 125px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            conic-gradient(
              #172033
              ${healthScore}%,
              #edf0f3 ${healthScore}%
            );
          position: relative;
          flex-shrink: 0;
        }

        .health-inner {
          width: 94px;
          height: 94px;
          border-radius: 50%;
          background: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .health-number {
          font-size: 24px;
          font-weight: 800;
        }

        .health-text {
          font-size: 9px;
          color: #8a93a1;
        }

        .health-info h3 {
          margin: 0;
          font-size: 17px;
        }

        .health-info p {
          color: #7b8492;
          font-size: 12px;
          line-height: 1.5;
        }

        .health-status {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 20px;
          background: #eaf8f0;
          color: #16834b;
          font-size: 11px;
          font-weight: 700;
        }

        /* =========================================
           ALERTS
           ========================================= */

        .alert-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px;
          border-radius: 10px;
        }

        .alert-item.warning {
          background: #fff8e8;
        }

        .alert-item.danger {
          background: #fff0ed;
        }

        .alert-item.success {
          background: #eaf8f0;
        }

        .alert-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
        }

        .alert-text strong {
          display: block;
          font-size: 12px;
        }

        .alert-text span {
          display: block;
          font-size: 10px;
          color: #7d8694;
          margin-top: 2px;
        }

        /* =========================================
           LOWER GRID
           ========================================= */

        .lower-grid {
          display: grid;
          grid-template-columns:
            1fr 1fr 1fr;
          gap: 18px;
          margin-bottom: 20px;
        }

        /* =========================================
           FLEET
           ========================================= */

        .vehicle-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .vehicle-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 11px;
          border: 1px solid #edf0f3;
          border-radius: 10px;
        }

        .vehicle-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .vehicle-icon {
          width: 35px;
          height: 35px;
          border-radius: 9px;
          background: #f1f3f6;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vehicle-name {
          font-size: 12px;
          font-weight: 700;
        }

        .vehicle-type {
          font-size: 10px;
          color: #87909e;
          margin-top: 2px;
        }

        .vehicle-status {
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 700;
        }

        .vehicle-active {
          background: #eaf8f0;
          color: #16834b;
        }

        .vehicle-maintenance {
          background: #fff8e8;
          color: #9a6a00;
        }

        .vehicle-inactive {
          background: #f0f1f3;
          color: #6f7785;
        }

        /* =========================================
           ACTIVITY
           ========================================= */

        .activity-list {
          display: flex;
          flex-direction: column;
        }

        .activity-item {
          display: flex;
          gap: 10px;
          padding: 11px 0;
          border-bottom: 1px solid #edf0f3;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 33px;
          height: 33px;
          border-radius: 9px;
          background: #f1f3f6;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-title {
          font-size: 12px;
          font-weight: 700;
        }

        .activity-desc {
          font-size: 10px;
          color: #87909e;
          margin-top: 2px;
        }

        .activity-amount {
          font-size: 11px;
          font-weight: 700;
          margin-top: 3px;
        }

        /* =========================================
           QUICK ACTIONS
           ========================================= */

        .quick-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }

        .quick-btn {
          border: 1px solid #e5e8ee;
          background: white;
          border-radius: 10px;
          padding: 13px 10px;
          text-align: left;
          cursor: pointer;
          transition: .18s;
        }

        .quick-btn:hover {
          background: #f7f8fa;
          transform: translateY(-1px);
        }

        .quick-btn-icon {
          font-size: 18px;
        }

        .quick-btn strong {
          display: block;
          font-size: 11px;
          margin-top: 6px;
        }

        .quick-btn span {
          display: block;
          font-size: 9px;
          color: #8992a1;
          margin-top: 3px;
        }

        /* =========================================
           FOOTER
           ========================================= */

        .dashboard-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 3px;
          color: #8a93a1;
          font-size: 10px;
        }

        .system-online {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .online-dot {
          width: 7px;
          height: 7px;
          background: #26a269;
          border-radius: 50%;
        }

        /* =========================================
           EMPTY
           ========================================= */

        .empty-state {
          text-align: center;
          padding: 20px;
          color: #8a93a1;
          font-size: 12px;
        }

        /* =========================================
           RESPONSIVE
           ========================================= */

        @media(max-width: 1100px) {

          .kpi-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .lower-grid {
            grid-template-columns:
              1fr 1fr;
          }

          .lower-grid
          > :last-child {
            grid-column:
              1 / -1;
          }

        }

        @media(max-width: 850px) {

          .main-grid {
            grid-template-columns:
              1fr;
          }

          .lower-grid {
            grid-template-columns:
              1fr;
          }

          .lower-grid
          > :last-child {
            grid-column: auto;
          }

          .hero-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-right {
            text-align: left;
          }

        }

        @media(max-width: 600px) {

          .bt-dashboard {
            padding: 14px;
          }

          .bt-hero {
            padding: 20px;
            border-radius: 17px;
          }

          .hero-title {
            font-size: 24px;
          }

          .kpi-grid {
            grid-template-columns:
              1fr 1fr;
            gap: 9px;
          }

          .kpi-card {
            padding: 13px;
          }

          .kpi-number {
            font-size: 20px;
          }

          .health-wrap {
            flex-direction: column;
            align-items: flex-start;
          }

        }

      `}</style>

      {/* =================================================
          HERO
          ================================================= */}

      <section className="bt-hero">

        <div className="hero-content">

          <div>

            <div className="hero-kicker">
              BUILDTRACK COMMAND CENTER
            </div>

            <h1 className="hero-title">
              Good{" "}
              {now.getHours() < 12
                ? "Morning"
                : now.getHours() < 17
                ? "Afternoon"
                : "Evening"}
              , {adminName} 👋
            </h1>

            <p className="hero-subtitle">
              Here's what's happening
              across {siteName} today.
            </p>

            <div className="live-pill">
              <span className="live-dot" />
              Live Project Monitoring
            </div>

          </div>

          <div className="hero-right">

            <div className="hero-time">
              {formattedTime}
            </div>

            <div className="hero-date">
              {formattedDate}
            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          KPI CARDS
          ================================================= */}

      <div className="kpi-grid">

        <div className="kpi-card">

          <div className="kpi-top">

            <div>
              <div className="kpi-label">
                WORKFORCE
              </div>

              <div className="kpi-number">
                {activeWorkers}
                <span
                  style={{
                    fontSize: "13px",
                    color: "#8992a1",
                    fontWeight: 500,
                  }}
                >
                  {" "}
                  / {workers.length}
                </span>
              </div>
            </div>

            <div className="kpi-icon">
              👷
            </div>

          </div>

          <div className="kpi-foot">
            Active workers
          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-top">

            <div>
              <div className="kpi-label">
                FLEET
              </div>

              <div className="kpi-number">
                {activeVehicles}
                <span
                  style={{
                    fontSize: "13px",
                    color: "#8992a1",
                    fontWeight: 500,
                  }}
                >
                  {" "}
                  / {vehicles.length}
                </span>
              </div>
            </div>

            <div className="kpi-icon">
              🚛
            </div>

          </div>

          <div className="kpi-foot">
            {maintenanceVehicles} under
            maintenance
          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-top">

            <div>
              <div className="kpi-label">
                FUEL EXPENSE
              </div>

              <div className="kpi-number">
                {money(
                  totalFuelCost
                )}
              </div>
            </div>

            <div className="kpi-icon">
              ⛽
            </div>

          </div>

          <div className="kpi-foot">
            {totalFuelLitres.toFixed(
              1
            )} litres consumed
          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-top">

            <div>
              <div className="kpi-label">
                STOCK VALUE
              </div>

              <div className="kpi-number">
                {money(
                  totalStockValue
                )}
              </div>
            </div>

            <div className="kpi-icon">
              🧱
            </div>

          </div>

          <div className="kpi-foot">
            {materials.length} materials
            tracked
          </div>

        </div>

      </div>

      {/* =================================================
          MAIN
          ================================================= */}

      <div className="main-grid">

        {/* EXPENSE */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <h2 className="panel-title">
                💰 Project Expense
              </h2>

              <div className="panel-subtitle">
                Operational spending overview
              </div>
            </div>

            <button
              className="refresh-btn"
              onClick={
                loadDashboard
              }
            >
              🔄 Refresh
            </button>

          </div>

          <div className="expense-total">
            {money(totalExpense)}
          </div>

          <div className="expense-row">

            <div className="expense-label">
              <span>
                ⛽ Fuel
              </span>

              <strong>
                {money(
                  totalFuelCost
                )}{" "}
                ({fuelPercentage.toFixed(
                  0
                )}%)
              </strong>
            </div>

            <div className="expense-track">

              <div
                className="expense-fill fuel-fill"
                style={{
                  width:
                    `${fuelPercentage}%`,
                }}
              />

            </div>

          </div>

          <div className="expense-row">

            <div className="expense-label">
              <span>
                🔧 Maintenance
              </span>

              <strong>
                {money(
                  totalMaintenanceCost
                )}{" "}
                ({maintenancePercentage.toFixed(
                  0
                )}%)
              </strong>
            </div>

            <div className="expense-track">

              <div
                className="expense-fill maintenance-fill"
                style={{
                  width:
                    `${maintenancePercentage}%`,
                }}
              />

            </div>

          </div>

          <div className="expense-summary">

            <div className="expense-mini">

              <span>
                Maintenance Records
              </span>

              <strong>
                {maintenance.length}
              </strong>

            </div>

            <div className="expense-mini">

              <span>
                Low Stock Items
              </span>

              <strong>
                {lowStockMaterials.length}
              </strong>

            </div>

          </div>

        </div>

        {/* HEALTH */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <h2 className="panel-title">
                📈 Site Health
              </h2>

              <div className="panel-subtitle">
                Overall project condition
              </div>
            </div>

          </div>

          <div className="health-wrap">

            <div className="health-circle">

              <div className="health-inner">

                <div className="health-number">
                  {healthScore}%
                </div>

                <div className="health-text">
                  HEALTH
                </div>

              </div>

            </div>

            <div className="health-info">

              <h3>
                {healthScore >= 85
                  ? "Project Stable"
                  : healthScore >= 65
                  ? "Needs Attention"
                  : "Critical Attention"}
              </h3>

              <p>
                Based on workforce,
                inventory, fleet and
                maintenance conditions.
              </p>

              <span className="health-status">
                {lowStockMaterials.length ===
                  0 &&
                breakdownCount === 0
                  ? "✓ No critical issues"
                  : "⚠ Attention required"}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          ALERTS
          ================================================= */}

      <div className="panel" style={{ marginBottom: "20px" }}>

        <div className="panel-header">

          <div>
            <h2 className="panel-title">
              🚨 Site Alerts
            </h2>

            <div className="panel-subtitle">
              Items that may require attention
            </div>
          </div>

          <span
            style={{
              fontSize: "11px",
              color: "#8992a1",
            }}
          >
            Auto calculated
          </span>

        </div>

        <div className="alert-list">

          {lowStockMaterials.length >
            0 && (
            <div className="alert-item warning">

              <div className="alert-icon">
                🧱
              </div>

              <div className="alert-text">
                <strong>
                  Low Material Stock
                </strong>

                <span>
                  {
                    lowStockMaterials.length
                  } material(s) are
                  below minimum level.
                </span>
              </div>

            </div>
          )}

          {maintenanceVehicles >
            0 && (
            <div className="alert-item warning">

              <div className="alert-icon">
                🔧
              </div>

              <div className="alert-text">
                <strong>
                  Vehicles Under Maintenance
                </strong>

                <span>
                  {maintenanceVehicles}{" "}
                  vehicle(s) currently
                  require maintenance.
                </span>
              </div>

            </div>
          )}

          {breakdownCount >
            0 && (
            <div className="alert-item danger">

              <div className="alert-icon">
                🚨
              </div>

              <div className="alert-text">
                <strong>
                  Breakdown Alert
                </strong>

                <span>
                  {breakdownCount} breakdown
                  record(s) detected.
                </span>
              </div>

            </div>
          )}

          {lowStockMaterials.length ===
            0 &&
            maintenanceVehicles === 0 &&
            breakdownCount === 0 && (
              <div className="alert-item success">

                <div className="alert-icon">
                  ✓
                </div>

                <div className="alert-text">
                  <strong>
                    Everything Looks Good
                  </strong>

                  <span>
                    No critical project alerts
                    at the moment.
                  </span>
                </div>

              </div>
            )}

        </div>

      </div>

      {/* =================================================
          LOWER GRID
          ================================================= */}

      <div className="lower-grid">

        {/* FLEET */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <h2 className="panel-title">
                🚛 Fleet Status
              </h2>

              <div className="panel-subtitle">
                Current vehicle overview
              </div>
            </div>

            <button
              className="refresh-btn"
              onClick={() =>
                goTo("vehicles")
              }
            >
              View All
            </button>

          </div>

          <div className="vehicle-list">

            {vehicles.length === 0 ? (
              <div className="empty-state">
                No vehicles available.
              </div>
            ) : (
              vehicles
                .slice(0, 5)
                .map((vehicle) => {

                  const status =
                    String(
                      vehicle.status ||
                        "Active"
                    ).toLowerCase();

                  let statusClass =
                    "vehicle-active";

                  if (
                    status ===
                    "maintenance"
                  ) {
                    statusClass =
                      "vehicle-maintenance";
                  }

                  if (
                    status ===
                    "inactive"
                  ) {
                    statusClass =
                      "vehicle-inactive";
                  }

                  return (
                    <div
                      className="vehicle-card"
                      key={
                        vehicle._id
                      }
                    >

                      <div className="vehicle-left">

                        <div className="vehicle-icon">
                          🚛
                        </div>

                        <div>

                          <div className="vehicle-name">
                            {
                              vehicle.number ||
                              "Vehicle"
                            }
                          </div>

                          <div className="vehicle-type">
                            {
                              vehicle.type ||
                              "Vehicle"
                            }{" "}
                            •{" "}
                            {
                              vehicle.driver
                                ?.name ||
                                "No driver"
                            }
                          </div>

                        </div>

                      </div>

                      <span
                        className={`vehicle-status ${statusClass}`}
                      >
                        {
                          vehicle.status ||
                          "Active"
                        }
                      </span>

                    </div>
                  );
                })
            )}

          </div>

        </div>

        {/* RECENT ACTIVITY */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <h2 className="panel-title">
                🕐 Recent Activity
              </h2>

              <div className="panel-subtitle">
                Latest project transactions
              </div>
            </div>

          </div>

          <div className="activity-list">

            {activities.length ===
            0 ? (
              <div className="empty-state">
                No recent activity.
              </div>
            ) : (
              activities.map(
                (item, index) => (
                  <div
                    className="activity-item"
                    key={index}
                  >

                    <div className="activity-icon">
                      {item.icon}
                    </div>

                    <div>

                      <div className="activity-title">
                        {
                          item.title
                        }
                      </div>

                      <div className="activity-desc">
                        {
                          item.description
                        }
                      </div>

                      <div className="activity-amount">
                        {
                          item.amount
                        }
                      </div>

                    </div>

                  </div>
                )
              )
            )}

          </div>

        </div>

        {/* QUICK ACTIONS */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <h2 className="panel-title">
                ⚡ Quick Actions
              </h2>

              <div className="panel-subtitle">
                Jump directly to a module
              </div>
            </div>

          </div>

          <div className="quick-actions">

            <button
              className="quick-btn"
              onClick={() =>
                goTo("workers")
              }
            >
              <div className="quick-btn-icon">
                👷
              </div>

              <strong>
                Workers
              </strong>

              <span>
                Manage workforce
              </span>
            </button>

            <button
              className="quick-btn"
              onClick={() =>
                goTo("vehicles")
              }
            >
              <div className="quick-btn-icon">
                🚛
              </div>

              <strong>
                Vehicles
              </strong>

              <span>
                Manage fleet
              </span>
            </button>

            <button
              className="quick-btn"
              onClick={() =>
                goTo("fuel")
              }
            >
              <div className="quick-btn-icon">
                ⛽
              </div>

              <strong>
                Fuel
              </strong>

              <span>
                Add fuel entry
              </span>
            </button>

            <button
              className="quick-btn"
              onClick={() =>
                goTo("materials")
              }
            >
              <div className="quick-btn-icon">
                🧱
              </div>

              <strong>
                Materials
              </strong>

              <span>
                Check inventory
              </span>
            </button>

            <button
              className="quick-btn"
              onClick={() =>
                goTo("maintenance")
              }
            >
              <div className="quick-btn-icon">
                🔧
              </div>

              <strong>
                Maintenance
              </strong>

              <span>
                Service vehicles
              </span>
            </button>

            <button
              className="quick-btn"
              onClick={() =>
                goTo("reports")
              }
            >
              <div className="quick-btn-icon">
                📊
              </div>

              <strong>
                Reports
              </strong>

              <span>
                View analytics
              </span>
            </button>

          </div>

        </div>

      </div>

      {/* =================================================
          FOOTER
          ================================================= */}

      <div className="dashboard-footer">

        <div className="system-online">

          <span className="online-dot" />

          BuildTrack System Online

        </div>

        <div>
          Last updated{" "}
          {lastUpdated.toLocaleTimeString(
            "en-IN",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </div>

      </div>

    </div>
  );
}

export default Dashboard;