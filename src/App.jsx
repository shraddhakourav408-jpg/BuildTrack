import {
  useState,
  useEffect,
} from "react";

import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Truck,
  Fuel,
  Package,
  Wrench,
  FileText,
  Bell,
  Search,
  Settings,
  LogOut,
  HardHat,
  Menu,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

import "./App.css";

import Login from "./pages/Login.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Workers from "./pages/Workers.jsx";
import Attendance from "./pages/Attendance.jsx";
import Vehicles from "./pages/Vehicles.jsx";
import FuelPage from "./pages/Fuel.jsx";
import Materials from "./pages/Materials.jsx";
import Maintenance from "./pages/Maintenance.jsx";
import Reports from "./pages/Reports.jsx";
import SettingsPage from "./pages/Settings.jsx";


function App() {

  // =====================================================
  // AUTH
  // =====================================================

  const [isLoggedIn, setIsLoggedIn] =
    useState(() => {

      return (
        localStorage.getItem(
          "buildtrack_logged_in"
        ) === "true" ||
        sessionStorage.getItem(
          "buildtrack_logged_in"
        ) === "true"
      );

    });


  const handleLogin = () => {

    setIsLoggedIn(true);

  };


  const handleLogout = () => {

    localStorage.removeItem(
      "buildtrack_logged_in"
    );

    sessionStorage.removeItem(
      "buildtrack_logged_in"
    );

    setIsLoggedIn(false);

  };


  // =====================================================
  // APP STATE
  // =====================================================

  const [activePage, setActivePage] =
    useState("dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    readNotifications,
    setReadNotifications,
  ] = useState([]);


  // =====================================================
  // API
  // =====================================================

  const API =
    "https://buildtrack-3ccw.onrender.com/api";


  // =====================================================
  // NAVIGATION
  // =====================================================

  const navigationItems = [

    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },

    {
      id: "workers",
      label: "Workers",
      icon: Users,
    },

    {
      id: "attendance",
      label: "Attendance",
      icon: ClipboardCheck,
    },

    {
      id: "vehicles",
      label: "Vehicles",
      icon: Truck,
    },

    {
      id: "fuel",
      label: "Fuel Management",
      icon: Fuel,
    },

    {
      id: "materials",
      label: "Materials",
      icon: Package,
    },

    {
      id: "maintenance",
      label: "Maintenance",
      icon: Wrench,
    },

    {
      id: "reports",
      label: "Reports",
      icon: FileText,
    },

  ];


  // =====================================================
  // PAGE CHANGE
  // =====================================================

  const changePage = (page) => {

    setActivePage(page);

    setSidebarOpen(false);

    setNotificationOpen(false);

  };


  // =====================================================
  // SAFE API
  // =====================================================

  const getData = async (
    endpoint
  ) => {

    try {

     const response = await fetch(`${API}${endpoint}`,

      );

      if (!response.ok) {
        return [];
      }

      const data =
        await response.json();

      if (Array.isArray(data)) {
        return data;
      }

      return (
        data?.workers ||
        data?.vehicles ||
        data?.fuel ||
        data?.materials ||
        data?.maintenance ||
        []
      );

    } catch (error) {

      console.log(
        "Notification API:",
        error
      );

      return [];

    }

  };


  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const loadNotifications =
    async () => {

      if (!isLoggedIn) {
        return;
      }

      try {

        const [
          workers,
          vehicles,
          fuel,
          materials,
          maintenance,
        ] = await Promise.all([

          getData("/workers"),
          getData("/vehicles"),
          getData("/fuel"),
          getData("/materials"),
          getData("/maintenance"),

        ]);


        const generated = [];


        // LOW STOCK

        materials.forEach(
          (material) => {

            const stock =
              Number(
                material.currentStock ??
                material.stock ??
                material.quantity ??
                0
              );

            const minimum =
              Number(
                material.minimumStock ??
                material.minStock ??
                material.minQuantity ??
                0
              );

            if (
              minimum > 0 &&
              stock <= minimum
            ) {

              generated.push({

                id:
                  `stock-${material._id}`,

                type:
                  "warning",

                title:
                  "Low Material Stock",

                message:
                  `${material.name || "Material"} is below minimum stock level.`,

                time:
                  "Inventory Alert",

                page:
                  "materials",

              });

            }

          }
        );


        // VEHICLE MAINTENANCE

        vehicles.forEach(
          (vehicle) => {

            const status =
              String(
                vehicle.status || ""
              ).toLowerCase();

            if (
              status ===
              "maintenance"
            ) {

              generated.push({

                id:
                  `vehicle-${vehicle._id}`,

                type:
                  "warning",

                title:
                  "Vehicle Maintenance",

                message:
                  `${vehicle.number || "Vehicle"} is under maintenance.`,

                time:
                  "Fleet Alert",

                page:
                  "vehicles",

              });

            }

          }
        );


        // BREAKDOWN

        maintenance.forEach(
          (item) => {

            const type =
              String(
                item.type ||
                item.maintenanceType ||
                ""
              ).toLowerCase();

            if (
              item.breakdown === true ||
              type === "breakdown" ||
              type === "break down"
            ) {

              generated.push({

                id:
                  `breakdown-${item._id}`,

                type:
                  "danger",

                title:
                  "Vehicle Breakdown",

                message:
                  "A breakdown record requires attention.",

                time:
                  "Maintenance Alert",

                page:
                  "maintenance",

              });

            }

          }
        );


        // PENDING MAINTENANCE

        maintenance.forEach(
          (item) => {

            const status =
              String(
                item.status || ""
              ).toLowerCase();

            if (
              status ===
                "pending" ||
              status ===
                "scheduled"
            ) {

              generated.push({

                id:
                  `scheduled-${item._id}`,

                type:
                  "info",

                title:
                  "Maintenance Scheduled",

                message:
                  `A maintenance task is ${status}.`,

                time:
                  "Maintenance",

                page:
                  "maintenance",

              });

            }

          }
        );


        // LATEST FUEL

        if (
          fuel.length > 0
        ) {

          const latest =
            [...fuel].sort(
              (a, b) =>
                new Date(
                  b.createdAt ||
                  b.date ||
                  0
                ) -
                new Date(
                  a.createdAt ||
                  a.date ||
                  0
                )
            )[0];

          const amount =
            Number(
              latest?.totalAmount ??
              latest?.amount ??
              0
            );

          generated.push({

            id:
              `fuel-${latest?._id}`,

            type:
              "success",

            title:
              "Fuel Entry Recorded",

            message:
              `New fuel entry ${
                amount
                  ? `₹${amount.toLocaleString("en-IN")}`
                  : "added"
              }.`,
            
            time:
              "Fuel Management",

            page:
              "fuel",

          });

        }


        // NO WORKERS

        if (
          workers.length === 0
        ) {

          generated.push({

            id:
              "no-workers",

            type:
              "warning",

            title:
              "No Workers Added",

            message:
              "Add workers to start workforce tracking.",

            time:
              "Workforce",

            page:
              "workers",

          });

        }


        setNotifications(
          generated.slice(
            0,
            12
          )
        );

      } catch (error) {

        console.log(error);

      }

    };


  useEffect(() => {

    if (!isLoggedIn) {
      return;
    }

    loadNotifications();

    const interval =
      setInterval(
        loadNotifications,
        30000
      );

    return () =>
      clearInterval(
        interval
      );

  }, [isLoggedIn]);


  // =====================================================
  // UNREAD
  // =====================================================

  const unread =
    notifications.filter(
      (item) =>
        !readNotifications.includes(
          item.id
        )
    );


  // =====================================================
  // MARK READ
  // =====================================================

  const markAllRead = () => {

    setReadNotifications(
      notifications.map(
        (item) =>
          item.id
      )
    );

  };


  // =====================================================
  // OPEN NOTIFICATION
  // =====================================================

  const openNotification = (
    item
  ) => {

    setReadNotifications(
      (old) => [
        ...old,
        item.id,
      ]
    );

    changePage(
      item.page
    );

  };


  // =====================================================
  // PAGE
  // =====================================================

  const renderPage = () => {

    switch (
      activePage
    ) {

      case "dashboard":
        return (
          <Dashboard
            setActivePage={
              changePage
            }
          />
        );

      case "workers":
        return <Workers />;

      case "attendance":
        return <Attendance />;

      case "vehicles":
        return <Vehicles />;

      case "fuel":
        return <FuelPage />;

      case "materials":
        return <Materials />;

      case "maintenance":
        return <Maintenance />;

      case "reports":
        return <Reports />;

      case "settings":
        return <SettingsPage />;

      default:
        return (
          <Dashboard
            setActivePage={
              changePage
            }
          />
        );

    }

  };


  // =====================================================
  // PAGE TITLE
  // =====================================================

  const getPageTitle = () => {

    if (
      activePage ===
      "settings"
    ) {
      return "Settings";
    }

    const current =
      navigationItems.find(
        (item) =>
          item.id ===
          activePage
      );

    return current
      ? current.label
      : "Dashboard";

  };


  // =====================================================
  // IF NOT LOGGED IN
  // =====================================================

  if (!isLoggedIn) {

    return (
      <Login
        onLogin={
          handleLogin
        }
      />
    );

  }


  // =====================================================
  // MAIN APP
  // =====================================================

  return (

    <div className="app-layout">


      {/* MOBILE OVERLAY */}

      {sidebarOpen && (

        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(
              false
            )
          }
        />

      )}


      {/* SIDEBAR */}

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >

        {/* BRAND */}

        <div className="brand">

          <div className="brand-icon">

            <HardHat
              size={24}
            />

          </div>

          <div className="brand-text">

            <h2>
              BuildTrack
            </h2>

            <span>
              Site Management
            </span>

          </div>

          <button
            className="mobile-sidebar-close"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
          >

            <X size={20} />

          </button>

        </div>


        {/* MENU */}

        <div className="sidebar-menu">

          <p className="section-title">
            MAIN MENU
          </p>

          <nav className="main-navigation">

            {navigationItems.map(
              (item) => {

                const Icon =
                  item.icon;

                return (

                  <button
                    key={
                      item.id
                    }
                    className={`nav-item ${
                      activePage ===
                      item.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      changePage(
                        item.id
                      )
                    }
                  >

                    <Icon
                      size={18}
                    />

                    <span>
                      {
                        item.label
                      }
                    </span>

                  </button>

                );

              }
            )}

          </nav>

        </div>


        {/* BOTTOM */}

        <div className="sidebar-bottom">

          <button
            className={`nav-item ${
              activePage ===
              "settings"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changePage(
                "settings"
              )
            }
          >

            <Settings
              size={18}
            />

            <span>
              Settings
            </span>

          </button>


          {/* LOGOUT */}

          <button
            className="nav-item logout-item"
            onClick={
              handleLogout
            }
          >

            <LogOut
              size={18}
            />

            <span>
              Logout
            </span>

          </button>


          {/* USER */}

          <div className="sidebar-user">

            <div className="sidebar-user-avatar">
              SK
            </div>

            <div>

              <strong>
                Shraddha Kourav
              </strong>

              <span>
                Administrator
              </span>

            </div>

          </div>

        </div>

      </aside>


      {/* MAIN */}

      <main className="main-area">


        {/* TOPBAR */}

        <header className="topbar">


          {/* MOBILE */}

          <button
            className="mobile-menu-button"
            onClick={() =>
              setSidebarOpen(
                true
              )
            }
          >

            <Menu
              size={22}
            />

          </button>


          {/* SEARCH */}

          <div className="topbar-left">

            <div className="search-box">

              <Search
                size={18}
              />

              <input
                type="text"
                placeholder="Search anything..."
              />

            </div>

          </div>


          {/* RIGHT */}

          <div className="topbar-right">


            {/* NOTIFICATIONS */}

            <div
              style={{
                position:
                  "relative",
              }}
            >

              <button
                className="notification-button"
                title="Notifications"
                onClick={() =>
                  setNotificationOpen(
                    !notificationOpen
                  )
                }
              >

                <Bell
                  size={19}
                />

                {unread.length >
                  0 && (

                  <span
                    style={{
                      position:
                        "absolute",
                      right:
                        "-3px",
                      top:
                        "-3px",
                      minWidth:
                        "17px",
                      height:
                        "17px",
                      padding:
                        "0 4px",
                      borderRadius:
                        "20px",
                      background:
                        "#d64535",
                      color:
                        "white",
                      fontSize:
                        "9px",
                      fontWeight:
                        "800",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      border:
                        "2px solid white",
                    }}
                  >
                    {unread.length >
                    9
                      ? "9+"
                      : unread.length}
                  </span>

                )}

              </button>


              {/* DROPDOWN */}

              {notificationOpen && (

                <div
                  style={{
                    position:
                      "absolute",
                    top:
                      "48px",
                    right:
                      "0",
                    width:
                      "360px",
                    maxWidth:
                      "calc(100vw - 25px)",
                    background:
                      "white",
                    border:
                      "1px solid #e3e7ec",
                    borderRadius:
                      "14px",
                    boxShadow:
                      "0 18px 45px rgba(20,30,45,.16)",
                    zIndex:
                      2000,
                    overflow:
                      "hidden",
                  }}
                >

                  {/* HEADER */}

                  <div
                    style={{
                      padding:
                        "15px",
                      borderBottom:
                        "1px solid #edf0f3",
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                    }}
                  >

                    <div>

                      <strong>
                        Notifications
                      </strong>

                      <div
                        style={{
                          fontSize:
                            "10px",
                          color:
                            "#8992a1",
                          marginTop:
                            "3px",
                        }}
                      >
                        Project alerts
                        & updates
                      </div>

                    </div>


                    {unread.length >
                      0 && (

                      <button
                        onClick={
                          markAllRead
                        }
                        style={{
                          border:
                            "none",
                          background:
                            "transparent",
                          color:
                            "#315b9c",
                          fontSize:
                            "10px",
                          fontWeight:
                            "700",
                          cursor:
                            "pointer",
                        }}
                      >
                        Mark all read
                      </button>

                    )}

                  </div>


                  {/* LIST */}

                  <div
                    style={{
                      maxHeight:
                        "390px",
                      overflowY:
                        "auto",
                    }}
                  >

                    {notifications.length ===
                    0 ? (

                      <div
                        style={{
                          padding:
                            "35px 20px",
                          textAlign:
                            "center",
                          color:
                            "#8992a1",
                        }}
                      >

                        <CheckCircle
                          size={30}
                        />

                        <div
                          style={{
                            marginTop:
                              "8px",
                            fontSize:
                              "13px",
                            fontWeight:
                              "700",
                            color:
                              "#566071",
                          }}
                        >
                          All caught up
                        </div>

                        <div
                          style={{
                            fontSize:
                              "10px",
                            marginTop:
                              "4px",
                          }}
                        >
                          No important
                          notifications.
                        </div>

                      </div>

                    ) : (

                      notifications.map(
                        (item) => {

                          const isRead =
                            readNotifications.includes(
                              item.id
                            );

                          const bg =
                            item.type ===
                            "danger"
                              ? "#fff0ed"
                              : item.type ===
                                "warning"
                              ? "#fff8e7"
                              : item.type ===
                                "success"
                              ? "#eaf8f0"
                              : "#eef4ff";

                          const color =
                            item.type ===
                            "danger"
                              ? "#c0392b"
                              : item.type ===
                                "warning"
                              ? "#a66b00"
                              : item.type ===
                                "success"
                              ? "#16834b"
                              : "#315b9c";

                          return (

                            <button
                              key={
                                item.id
                              }
                              onClick={() =>
                                openNotification(
                                  item
                                )
                              }
                              style={{
                                width:
                                  "100%",
                                border:
                                  "none",
                                borderBottom:
                                  "1px solid #f0f2f4",
                                background:
                                  isRead
                                    ? "white"
                                    : "#fafcff",
                                padding:
                                  "12px 14px",
                                display:
                                  "flex",
                                gap:
                                  "11px",
                                textAlign:
                                  "left",
                                cursor:
                                  "pointer",
                                opacity:
                                  isRead
                                    ? .65
                                    : 1,
                              }}
                            >

                              <div
                                style={{
                                  width:
                                    "34px",
                                  height:
                                    "34px",
                                  borderRadius:
                                    "10px",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  flexShrink:
                                    0,
                                  background:
                                    bg,
                                  color:
                                    color,
                                }}
                              >

                                {item.type ===
                                "danger" ? (
                                  <AlertTriangle
                                    size={17}
                                  />
                                ) : item.type ===
                                  "warning" ? (
                                  <AlertTriangle
                                    size={17}
                                  />
                                ) : item.type ===
                                  "success" ? (
                                  <CheckCircle
                                    size={17}
                                  />
                                ) : (
                                  <Clock
                                    size={17}
                                  />
                                )}

                              </div>


                              <div
                                style={{
                                  flex:
                                    1,
                                }}
                              >

                                <div
                                  style={{
                                    display:
                                      "flex",
                                    justifyContent:
                                      "space-between",
                                  }}
                                >

                                  <strong
                                    style={{
                                      fontSize:
                                        "11px",
                                      color:
                                        "#273043",
                                    }}
                                  >
                                    {
                                      item.title
                                    }
                                  </strong>

                                  {!isRead && (

                                    <span
                                      style={{
                                        width:
                                          "6px",
                                        height:
                                          "6px",
                                        borderRadius:
                                          "50%",
                                        background:
                                          "#315b9c",
                                        marginTop:
                                          "4px",
                                      }}
                                    />

                                  )}

                                </div>


                                <div
                                  style={{
                                    fontSize:
                                      "10px",
                                    color:
                                      "#7e8795",
                                    lineHeight:
                                      "1.4",
                                    marginTop:
                                      "3px",
                                  }}
                                >
                                  {
                                    item.message
                                  }
                                </div>


                                <div
                                  style={{
                                    fontSize:
                                      "9px",
                                    color:
                                      "#a0a7b2",
                                    marginTop:
                                      "5px",
                                  }}
                                >
                                  {
                                    item.time
                                  }
                                </div>

                              </div>

                            </button>

                          );

                        }
                      )

                    )}

                  </div>

                </div>

              )}

            </div>


            {/* PROFILE */}

            <div className="profile-area">

              <div className="profile-circle">
                SK
              </div>

              <div className="profile-info">

                <strong>
                  Shraddha Kourav
                </strong>

                <span>
                  Administrator
                </span>

              </div>

            </div>

          </div>

        </header>


        {/* PAGE CONTENT */}

        <div className="page-content">

          {renderPage()}

        </div>

      </main>

    </div>

  );

}

export default App;