import React, { useEffect, useState } from "react";

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "Shraddha Kourav",
    role: "Administrator",
    phone: "",
    designation: "Site Administrator",
  });

  const [site, setSite] = useState({
    projectName: "BuildTrack Construction Project",
    siteName: "Site A",
    location: "",
    manager: "Shraddha Kourav",
    startDate: "",
  });

  const [notifications, setNotifications] = useState({
    lowStock: true,
    maintenanceDue: true,
    vehicleAlerts: true,
    dailySummary: true,
    systemAlerts: true,
  });

  const [preferences, setPreferences] = useState({
    dateFormat: "DD/MM/YYYY",
    currency: "INR",
    unitSystem: "Metric",
    defaultSite: "Site A",
  });

  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  useEffect(() => {
    const savedProfile =
      localStorage.getItem(
        "buildtrack_profile"
      );

    const savedSite =
      localStorage.getItem(
        "buildtrack_site"
      );

    const savedNotifications =
      localStorage.getItem(
        "buildtrack_notifications"
      );

    const savedPreferences =
      localStorage.getItem(
        "buildtrack_preferences"
      );

    if (savedProfile) {
      setProfile(
        JSON.parse(savedProfile)
      );
    }

    if (savedSite) {
      setSite(
        JSON.parse(savedSite)
      );
    }

    if (savedNotifications) {
      setNotifications(
        JSON.parse(
          savedNotifications
        )
      );
    }

    if (savedPreferences) {
      setPreferences(
        JSON.parse(
          savedPreferences
        )
      );
    }
  }, []);

  // =====================================================
  // SAVE ALL
  // =====================================================

  const saveSettings = () => {
    localStorage.setItem(
      "buildtrack_profile",
      JSON.stringify(profile)
    );

    localStorage.setItem(
      "buildtrack_site",
      JSON.stringify(site)
    );

    localStorage.setItem(
      "buildtrack_notifications",
      JSON.stringify(
        notifications
      )
    );

    localStorage.setItem(
      "buildtrack_preferences",
      JSON.stringify(
        preferences
      )
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  // =====================================================
  // RESET
  // =====================================================

  const resetSettings = () => {
    const confirmReset =
      window.confirm(
        "Reset BuildTrack settings to default?"
      );

    if (!confirmReset) return;

    localStorage.removeItem(
      "buildtrack_profile"
    );

    localStorage.removeItem(
      "buildtrack_site"
    );

    localStorage.removeItem(
      "buildtrack_notifications"
    );

    localStorage.removeItem(
      "buildtrack_preferences"
    );

    setProfile({
      name: "Shraddha Kourav",
      role: "Administrator",
      phone: "",
      designation:
        "Site Administrator",
    });

    setSite({
      projectName:
        "BuildTrack Construction Project",
      siteName: "Site A",
      location: "",
      manager: "Shraddha Kourav",
      startDate: "",
    });

    setNotifications({
      lowStock: true,
      maintenanceDue: true,
      vehicleAlerts: true,
      dailySummary: true,
      systemAlerts: true,
    });

    setPreferences({
      dateFormat: "DD/MM/YYYY",
      currency: "INR",
      unitSystem: "Metric",
      defaultSite: "Site A",
    });

    alert(
      "Settings reset successfully"
    );
  };

  // =====================================================
  // EXPORT SETTINGS
  // =====================================================

  const exportSettings = () => {
    const data = {
      profile,
      site,
      notifications,
      preferences,
      exportedAt:
        new Date().toISOString(),
    };

    const blob = new Blob(
      [
        JSON.stringify(
          data,
          null,
          2
        ),
      ],
      {
        type: "application/json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "BuildTrack-Settings-Backup.json";

    link.click();

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // CLEAR LOCAL DATA
  // =====================================================

  const clearLocalData = () => {
    const confirmClear =
      window.confirm(
        "This will clear BuildTrack local settings from this browser. Continue?"
      );

    if (!confirmClear) return;

    localStorage.removeItem(
      "buildtrack_profile"
    );

    localStorage.removeItem(
      "buildtrack_site"
    );

    localStorage.removeItem(
      "buildtrack_notifications"
    );

    localStorage.removeItem(
      "buildtrack_preferences"
    );

    alert(
      "Local settings cleared. Reload the page."
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="settings-page">

      <style>{`

        .settings-page {
          padding: 24px;
          color: #172033;
        }

        .settings-header {
          margin-bottom: 24px;
        }

        .settings-header h1 {
          margin: 0;
          font-size: 28px;
        }

        .settings-header p {
          margin: 7px 0 0;
          color: #727c8d;
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 230px 1fr;
          gap: 20px;
          align-items: start;
        }

        .settings-sidebar {
          background: white;
          border: 1px solid #e5e8ee;
          border-radius: 14px;
          padding: 9px;
        }

        .settings-tab {
          width: 100%;
          border: none;
          background: transparent;
          text-align: left;
          padding: 12px 13px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 14px;
          color: #5e6878;
          margin-bottom: 3px;
        }

        .settings-tab:hover {
          background: #f5f6f8;
        }

        .settings-tab.active {
          background: #172033;
          color: white;
          font-weight: 600;
        }

        .settings-content {
          background: white;
          border: 1px solid #e5e8ee;
          border-radius: 14px;
          padding: 24px;
          min-height: 500px;
        }

        .section-title {
          margin-bottom: 20px;
        }

        .section-title h2 {
          margin: 0;
          font-size: 20px;
        }

        .section-title p {
          margin: 6px 0 0;
          color: #778193;
          font-size: 13px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
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
        .form-group select {
          padding: 11px 12px;
          border: 1px solid #dfe3e9;
          border-radius: 9px;
          outline: none;
          font-size: 14px;
          background: white;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #8b94a3;
        }

        .profile-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 18px;
          background: #f7f8fa;
          border-radius: 12px;
          margin-bottom: 22px;
        }

        .profile-avatar {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          background: #172033;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
        }

        .profile-card strong {
          display: block;
          font-size: 16px;
        }

        .profile-card span {
          color: #778193;
          font-size: 13px;
        }

        .toggle-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .toggle-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 15px;
          border: 1px solid #e5e8ee;
          border-radius: 11px;
        }

        .toggle-info strong {
          display: block;
          font-size: 14px;
        }

        .toggle-info span {
          display: block;
          color: #788293;
          font-size: 12px;
          margin-top: 3px;
        }

        .switch {
          position: relative;
          width: 43px;
          height: 23px;
          flex-shrink: 0;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          inset: 0;
          cursor: pointer;
          background: #cdd2da;
          border-radius: 20px;
          transition: .2s;
        }

        .slider:before {
          content: "";
          position: absolute;
          width: 17px;
          height: 17px;
          left: 3px;
          top: 3px;
          background: white;
          border-radius: 50%;
          transition: .2s;
        }

        .switch input:checked + .slider {
          background: #172033;
        }

        .switch input:checked + .slider:before {
          transform: translateX(20px);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .info-card {
          padding: 17px;
          border: 1px solid #e5e8ee;
          border-radius: 11px;
        }

        .info-card span {
          display: block;
          color: #788293;
          font-size: 12px;
        }

        .info-card strong {
          display: block;
          margin-top: 7px;
          font-size: 15px;
        }

        .action-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .action-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 16px;
          border: 1px solid #e5e8ee;
          border-radius: 11px;
        }

        .action-card strong {
          display: block;
          font-size: 14px;
        }

        .action-card span {
          display: block;
          color: #778193;
          font-size: 12px;
          margin-top: 4px;
        }

        .action-card button {
          border: 1px solid #dfe3e9;
          background: white;
          padding: 9px 13px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          white-space: nowrap;
        }

        .danger-button {
          color: #c0392b !important;
          border-color: #f0d2ce !important;
        }

        .save-bar {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
          margin-top: 25px;
          padding-top: 18px;
          border-top: 1px solid #edf0f3;
        }

        .saved-message {
          color: #16834b;
          font-size: 13px;
          font-weight: 600;
        }

        .save-button {
          border: none;
          background: #172033;
          color: white;
          padding: 11px 18px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 600;
        }

        .note-box {
          background: #f7f8fa;
          border-radius: 10px;
          padding: 14px;
          margin-top: 20px;
          color: #667082;
          font-size: 13px;
          line-height: 1.6;
        }

        @media (max-width: 800px) {

          .settings-layout {
            grid-template-columns: 1fr;
          }

          .settings-sidebar {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full {
            grid-column: auto;
          }

          .info-grid {
            grid-template-columns: 1fr 1fr;
          }

        }

        @media (max-width: 500px) {

          .settings-page {
            padding: 14px;
          }

          .settings-content {
            padding: 17px;
          }

          .settings-sidebar {
            grid-template-columns: 1fr;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

        }

      `}</style>

      {/* HEADER */}

      <div className="settings-header">

        <h1>
          Settings
        </h1>

        <p>
          Manage your BuildTrack project,
          profile and system preferences
        </p>

      </div>

      <div className="settings-layout">

        {/* SIDEBAR */}

        <div className="settings-sidebar">

          <button
            className={`settings-tab ${
              activeTab === "profile"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("profile")
            }
          >
            👤 Profile
          </button>

          <button
            className={`settings-tab ${
              activeTab === "project"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("project")
            }
          >
            🏗️ Project
          </button>

          <button
            className={`settings-tab ${
              activeTab === "notifications"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab(
                "notifications"
              )
            }
          >
            🔔 Notifications
          </button>

          <button
            className={`settings-tab ${
              activeTab === "preferences"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab(
                "preferences"
              )
            }
          >
            ⚙️ Preferences
          </button>

          <button
            className={`settings-tab ${
              activeTab === "security"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("security")
            }
          >
            🔐 Security
          </button>

          <button
            className={`settings-tab ${
              activeTab === "system"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("system")
            }
          >
            💾 System
          </button>

        </div>

        {/* CONTENT */}

        <div className="settings-content">

          {/* =========================================
              PROFILE
              ========================================= */}

          {activeTab === "profile" && (
            <>
              <div className="section-title">

                <h2>
                  Administrator Profile
                </h2>

                <p>
                  Manage the administrator
                  information shown in BuildTrack.
                </p>

              </div>

              <div className="profile-card">

                <div className="profile-avatar">
                  {profile.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {profile.name}
                  </strong>

                  <span>
                    {profile.designation}
                  </span>
                </div>

              </div>

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Full Name
                  </label>

                  <input
                    value={
                      profile.name
                    }
                    onChange={(e) =>
                      setProfile(
                        (prev) => ({
                          ...prev,
                          name:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Role
                  </label>

                  <input
                    value={
                      profile.role
                    }
                    onChange={(e) =>
                      setProfile(
                        (prev) => ({
                          ...prev,
                          role:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Designation
                  </label>

                  <input
                    value={
                      profile.designation
                    }
                    onChange={(e) =>
                      setProfile(
                        (prev) => ({
                          ...prev,
                          designation:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Phone Number
                  </label>

                  <input
                    value={
                      profile.phone
                    }
                    onChange={(e) =>
                      setProfile(
                        (prev) => ({
                          ...prev,
                          phone:
                            e.target.value,
                        })
                      )
                    }
                    placeholder="10 digit phone"
                  />
                </div>

              </div>
            </>
          )}

          {/* =========================================
              PROJECT
              ========================================= */}

          {activeTab === "project" && (
            <>
              <div className="section-title">

                <h2>
                  Project Information
                </h2>

                <p>
                  Configure your construction
                  project and active site.
                </p>

              </div>

              <div className="form-grid">

                <div className="form-group full">
                  <label>
                    Project Name
                  </label>

                  <input
                    value={
                      site.projectName
                    }
                    onChange={(e) =>
                      setSite(
                        (prev) => ({
                          ...prev,
                          projectName:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Site Name
                  </label>

                  <input
                    value={
                      site.siteName
                    }
                    onChange={(e) =>
                      setSite(
                        (prev) => ({
                          ...prev,
                          siteName:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Project Manager
                  </label>

                  <input
                    value={
                      site.manager
                    }
                    onChange={(e) =>
                      setSite(
                        (prev) => ({
                          ...prev,
                          manager:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Location
                  </label>

                  <input
                    value={
                      site.location
                    }
                    onChange={(e) =>
                      setSite(
                        (prev) => ({
                          ...prev,
                          location:
                            e.target.value,
                        })
                      )
                    }
                    placeholder="Project location"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Project Start Date
                  </label>

                  <input
                    type="date"
                    value={
                      site.startDate
                    }
                    onChange={(e) =>
                      setSite(
                        (prev) => ({
                          ...prev,
                          startDate:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

              </div>
            </>
          )}

          {/* =========================================
              NOTIFICATIONS
              ========================================= */}

          {activeTab ===
            "notifications" && (
            <>
              <div className="section-title">

                <h2>
                  In-App Notifications
                </h2>

                <p>
                  Control important alerts
                  shown inside BuildTrack.
                </p>

              </div>

              <div className="toggle-list">

                <div className="toggle-item">

                  <div className="toggle-info">
                    <strong>
                      Low Stock Alerts
                    </strong>

                    <span>
                      Alert when construction
                      material falls below
                      minimum stock.
                    </span>
                  </div>

                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={
                        notifications.lowStock
                      }
                      onChange={(e) =>
                        setNotifications(
                          (prev) => ({
                            ...prev,
                            lowStock:
                              e.target
                                .checked,
                          })
                        )
                      }
                    />

                    <span className="slider" />

                  </label>

                </div>

                <div className="toggle-item">

                  <div className="toggle-info">
                    <strong>
                      Maintenance Due
                    </strong>

                    <span>
                      Show vehicle service
                      and maintenance alerts.
                    </span>
                  </div>

                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={
                        notifications.maintenanceDue
                      }
                      onChange={(e) =>
                        setNotifications(
                          (prev) => ({
                            ...prev,
                            maintenanceDue:
                              e.target
                                .checked,
                          })
                        )
                      }
                    />

                    <span className="slider" />

                  </label>

                </div>

                <div className="toggle-item">

                  <div className="toggle-info">
                    <strong>
                      Vehicle Alerts
                    </strong>

                    <span>
                      Show important vehicle
                      status notifications.
                    </span>
                  </div>

                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={
                        notifications.vehicleAlerts
                      }
                      onChange={(e) =>
                        setNotifications(
                          (prev) => ({
                            ...prev,
                            vehicleAlerts:
                              e.target
                                .checked,
                          })
                        )
                      }
                    />

                    <span className="slider" />

                  </label>

                </div>

                <div className="toggle-item">

                  <div className="toggle-info">
                    <strong>
                      Daily Summary
                    </strong>

                    <span>
                      Show a daily project
                      activity summary.
                    </span>
                  </div>

                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={
                        notifications.dailySummary
                      }
                      onChange={(e) =>
                        setNotifications(
                          (prev) => ({
                            ...prev,
                            dailySummary:
                              e.target
                                .checked,
                          })
                        )
                      }
                    />

                    <span className="slider" />

                  </label>

                </div>

                <div className="toggle-item">

                  <div className="toggle-info">
                    <strong>
                      System Alerts
                    </strong>

                    <span>
                      Show important BuildTrack
                      system messages.
                    </span>
                  </div>

                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={
                        notifications.systemAlerts
                      }
                      onChange={(e) =>
                        setNotifications(
                          (prev) => ({
                            ...prev,
                            systemAlerts:
                              e.target
                                .checked,
                          })
                        )
                      }
                    />

                    <span className="slider" />

                  </label>

                </div>

              </div>
            </>
          )}

          {/* =========================================
              PREFERENCES
              ========================================= */}

          {activeTab ===
            "preferences" && (
            <>
              <div className="section-title">

                <h2>
                  System Preferences
                </h2>

                <p>
                  Configure how BuildTrack
                  displays project information.
                </p>

              </div>

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Date Format
                  </label>

                  <select
                    value={
                      preferences.dateFormat
                    }
                    onChange={(e) =>
                      setPreferences(
                        (prev) => ({
                          ...prev,
                          dateFormat:
                            e.target.value,
                        })
                      )
                    }
                  >

                    <option>
                      DD/MM/YYYY
                    </option>

                    <option>
                      MM/DD/YYYY
                    </option>

                    <option>
                      YYYY-MM-DD
                    </option>

                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Currency
                  </label>

                  <select
                    value={
                      preferences.currency
                    }
                    onChange={(e) =>
                      setPreferences(
                        (prev) => ({
                          ...prev,
                          currency:
                            e.target.value,
                        })
                      )
                    }
                  >

                    <option value="INR">
                      INR — ₹
                    </option>

                    <option value="USD">
                      USD — $
                    </option>

                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Measurement System
                  </label>

                  <select
                    value={
                      preferences.unitSystem
                    }
                    onChange={(e) =>
                      setPreferences(
                        (prev) => ({
                          ...prev,
                          unitSystem:
                            e.target.value,
                        })
                      )
                    }
                  >

                    <option>
                      Metric
                    </option>

                    <option>
                      Imperial
                    </option>

                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Default Site
                  </label>

                  <input
                    value={
                      preferences.defaultSite
                    }
                    onChange={(e) =>
                      setPreferences(
                        (prev) => ({
                          ...prev,
                          defaultSite:
                            e.target.value,
                        })
                      )
                    }
                  />

                </div>

              </div>

              <div className="note-box">
                BuildTrack uses these preferences
                for displaying project information
                and reports. Changes are stored
                locally in this browser.
              </div>

            </>
          )}

          {/* =========================================
              SECURITY
              ========================================= */}

          {activeTab ===
            "security" && (
            <>
              <div className="section-title">

                <h2>
                  Security
                </h2>

                <p>
                  Basic security and session
                  management options.
                </p>

              </div>

              <div className="info-grid">

                <div className="info-card">
                  <span>
                    Account
                  </span>

                  <strong>
                    Administrator
                  </strong>
                </div>

                <div className="info-card">
                  <span>
                    Session
                  </span>

                  <strong>
                    Active
                  </strong>
                </div>

                <div className="info-card">
                  <span>
                    Access Level
                  </span>

                  <strong>
                    Full Access
                  </strong>
                </div>

              </div>

              <div className="note-box">
                Authentication can be connected
                to the BuildTrack backend when
                login functionality is implemented.
              </div>

            </>
          )}

          {/* =========================================
              SYSTEM
              ========================================= */}

          {activeTab === "system" && (
            <>
              <div className="section-title">

                <h2>
                  System & Data
                </h2>

                <p>
                  Manage BuildTrack settings
                  and local configuration data.
                </p>

              </div>

              <div className="action-list">

                <div className="action-card">

                  <div>
                    <strong>
                      Export Settings
                    </strong>

                    <span>
                      Download a backup of your
                      BuildTrack configuration.
                    </span>
                  </div>

                  <button
                    onClick={
                      exportSettings
                    }
                  >
                    Export
                  </button>

                </div>

                <div className="action-card">

                  <div>
                    <strong>
                      Reset Settings
                    </strong>

                    <span>
                      Restore BuildTrack settings
                      to their default values.
                    </span>
                  </div>

                  <button
                    onClick={
                      resetSettings
                    }
                  >
                    Reset
                  </button>

                </div>

                <div className="action-card">

                  <div>
                    <strong>
                      Clear Local Settings
                    </strong>

                    <span>
                      Remove BuildTrack settings
                      stored in this browser.
                    </span>
                  </div>

                  <button
                    className="danger-button"
                    onClick={
                      clearLocalData
                    }
                  >
                    Clear
                  </button>

                </div>

              </div>

              <div
                className="info-grid"
                style={{
                  marginTop: "20px",
                }}
              >

                <div className="info-card">
                  <span>
                    Application
                  </span>

                  <strong>
                    BuildTrack
                  </strong>
                </div>

                <div className="info-card">
                  <span>
                    Version
                  </span>

                  <strong>
                    1.0.0
                  </strong>
                </div>

                <div className="info-card">
                  <span>
                    Environment
                  </span>

                  <strong>
                    Local / Development
                  </strong>
                </div>

              </div>

            </>
          )}

          {/* SAVE */}

          <div className="save-bar">

            {saved && (
              <span className="saved-message">
                ✓ Settings saved
              </span>
            )}

            <button
              className="save-button"
              onClick={
                saveSettings
              }
            >
              Save Changes
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default SettingsPage;