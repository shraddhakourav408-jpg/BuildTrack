import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

function Attendance() {
  // =====================================================
  // PRODUCTION BACKEND API
  // =====================================================

  const API =
    "https://buildtrack-3ccw.onrender.com/api";

  // =====================================================
  // TODAY
  // =====================================================

  const getToday = () => {
    const today = new Date();

    const offset =
      today.getTimezoneOffset();

    return new Date(
      today.getTime() -
        offset * 60000
    )
      .toISOString()
      .split("T")[0];
  };

  // =====================================================
  // STATES
  // =====================================================

  const [date, setDate] =
    useState(getToday());

  const [search, setSearch] =
    useState("");

  const [siteFilter, setSiteFilter] =
    useState("All Sites");

  const [workers, setWorkers] =
    useState([]);

  const [attendance, setAttendance] =
    useState({});

  const [monthlyAttendance, setMonthlyAttendance] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(null);

  // =====================================================
  // DATE HELPERS
  // =====================================================

  const currentMonth =
    date.substring(0, 7);

  const formatDate = (value) => {
    const d = new Date(value);

    return d.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const changeDate = (days) => {
    const current =
      new Date(`${date}T00:00:00`);

    current.setDate(
      current.getDate() + days
    );

    const offset =
      current.getTimezoneOffset();

    const formatted =
      new Date(
        current.getTime() -
          offset * 60000
      )
        .toISOString()
        .split("T")[0];

    setDate(formatted);
  };

  // =====================================================
  // LOAD WORKERS
  // =====================================================

  const loadWorkers = async () => {
    try {
      const response =
        await fetch(
          `${API}/workers`
        );

      if (!response.ok) {
        throw new Error(
          "Workers loading failed"
        );
      }

      const data =
        await response.json();

      setWorkers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Workers API error:",
        error
      );

      alert(
        "Workers load nahi ho paaye."
      );
    }
  };

  // =====================================================
  // LOAD MONTHLY ATTENDANCE
  // =====================================================

  const loadMonthlyAttendance =
    async (month) => {
      try {
        const response =
          await fetch(
            `${API}/attendance?month=${month}`
          );

        if (!response.ok) {
          throw new Error(
            "Attendance loading failed"
          );
        }

        const data =
          await response.json();

        setMonthlyAttendance(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Monthly attendance error:",
          error
        );

        alert(
          "Monthly attendance load nahi ho rahi."
        );
      }
    };

  // =====================================================
  // LOAD SELECTED DATE ATTENDANCE
  // =====================================================

  const loadAttendance =
    async (selectedDate) => {
      try {
        setLoading(true);

        const response =
          await fetch(
            `${API}/attendance?date=${selectedDate}`
          );

        if (!response.ok) {
          throw new Error(
            "Attendance loading failed"
          );
        }

        const data =
          await response.json();

        const map = {};

        if (Array.isArray(data)) {
          data.forEach((item) => {
            map[item.workerId] =
              item;
          });
        }

        setAttendance(map);
      } catch (error) {
        console.error(
          "Attendance API error:",
          error
        );

        alert(
          "Attendance load nahi ho rahi."
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadWorkers();
  }, []);

  // =====================================================
  // DATE CHANGE
  // =====================================================

  useEffect(() => {
    loadAttendance(date);

    loadMonthlyAttendance(
      date.substring(0, 7)
    );
  }, [date]);

  // =====================================================
  // SAVE ATTENDANCE
  // =====================================================

  const saveAttendance = async (
    worker,
    changes
  ) => {
    try {
      setSaving(worker._id);

      const old =
        attendance[worker._id] || {};

      const body = {
        workerId:
          worker._id,

        date,

        status:
          changes.status ||
          old.status ||
          "Present",

        checkIn:
          changes.checkIn !==
          undefined
            ? changes.checkIn
            : old.checkIn || "",

        checkOut:
          changes.checkOut !==
          undefined
            ? changes.checkOut
            : old.checkOut || "",
      };

      const response =
        await fetch(
          `${API}/attendance`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(body),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Attendance save nahi hui."
        );

        return;
      }

      setAttendance(
        (prev) => ({
          ...prev,
          [worker._id]:
            data,
        })
      );

      // Update monthly records
      setMonthlyAttendance(
        (prev) => {
          const filtered =
            prev.filter(
              (item) =>
                !(
                  item.workerId ===
                    worker._id &&
                  item.date ===
                    date
                )
            );

          return [
            ...filtered,
            data,
          ];
        }
      );
    } catch (error) {
      console.error(
        "Save attendance error:",
        error
      );

      alert(
        "Server connection failed."
      );
    } finally {
      setSaving(null);
    }
  };

  // =====================================================
  // STATUS
  // =====================================================

  const updateStatus = (
    worker,
    status
  ) => {
    saveAttendance(
      worker,
      {
        status,
      }
    );
  };

  // =====================================================
  // CHECK IN
  // =====================================================

  const checkIn = (worker) => {
    const now =
      new Date();

    const hours =
      String(
        now.getHours()
      ).padStart(2, "0");

    const minutes =
      String(
        now.getMinutes()
      ).padStart(2, "0");

    saveAttendance(
      worker,
      {
        status:
          attendance[
            worker._id
          ]?.status ||
          "Present",

        checkIn:
          `${hours}:${minutes}`,
      }
    );
  };

  // =====================================================
  // CHECK OUT
  // =====================================================

  const checkOut = (worker) => {
    const now =
      new Date();

    const hours =
      String(
        now.getHours()
      ).padStart(2, "0");

    const minutes =
      String(
        now.getMinutes()
      ).padStart(2, "0");

    saveAttendance(
      worker,
      {
        status:
          attendance[
            worker._id
          ]?.status ||
          "Present",

        checkOut:
          `${hours}:${minutes}`,
      }
    );
  };

  // =====================================================
  // FILTER WORKERS
  // =====================================================

  const filteredWorkers =
    workers.filter(
      (worker) => {
        const searchText =
          search.toLowerCase();

        const matchesSearch =
          worker.name
            ?.toLowerCase()
            .includes(
              searchText
            ) ||
          worker.role
            ?.toLowerCase()
            .includes(
              searchText
            ) ||
          worker.phone
            ?.includes(search);

        const matchesSite =
          siteFilter ===
            "All Sites" ||
          worker.site ===
            siteFilter;

        return (
          matchesSearch &&
          matchesSite
        );
      }
    );

  // =====================================================
  // TODAY STATS
  // =====================================================

  const present =
    workers.filter(
      (worker) =>
        attendance[
          worker._id
        ]?.status ===
        "Present"
    ).length;

  const absent =
    workers.filter(
      (worker) =>
        attendance[
          worker._id
        ]?.status ===
        "Absent"
    ).length;

  const leave =
    workers.filter(
      (worker) =>
        attendance[
          worker._id
        ]?.status ===
        "Leave"
    ).length;

  const marked =
    present +
    absent +
    leave;

  const notMarked =
    workers.length -
    marked;

  // =====================================================
  // MONTHLY WORKER SUMMARY
  // =====================================================

  const monthlySummary =
    useMemo(() => {
      return workers.map(
        (worker) => {
          const records =
            monthlyAttendance.filter(
              (item) =>
                item.workerId ===
                worker._id
            );

          const presentCount =
            records.filter(
              (item) =>
                item.status ===
                "Present"
            ).length;

          const absentCount =
            records.filter(
              (item) =>
                item.status ===
                "Absent"
            ).length;

          const leaveCount =
            records.filter(
              (item) =>
                item.status ===
                "Leave"
            ).length;

          const total =
            presentCount +
            absentCount +
            leaveCount;

          const percentage =
            total > 0
              ? Math.round(
                  (presentCount /
                    total) *
                    100
                )
              : 0;

          return {
            worker,
            present:
              presentCount,
            absent:
              absentCount,
            leave:
              leaveCount,
            total,
            percentage,
          };
        }
      );
    }, [
      workers,
      monthlyAttendance,
    ]);

  // =====================================================
  // MONTHLY TOTALS
  // =====================================================

  const monthlyTotals =
    useMemo(() => {
      let p = 0;
      let a = 0;
      let l = 0;

      monthlyAttendance.forEach(
        (item) => {
          if (
            item.status ===
            "Present"
          ) {
            p++;
          }

          if (
            item.status ===
            "Absent"
          ) {
            a++;
          }

          if (
            item.status ===
            "Leave"
          ) {
            l++;
          }
        }
      );

      const total =
        p + a + l;

      return {
        present: p,
        absent: a,
        leave: l,
        total,

        percentage:
          total > 0
            ? Math.round(
                (p / total) *
                  100
              )
            : 0,
      };
    }, [
      monthlyAttendance,
    ]);

  // =====================================================
  // EXPORT CSV
  // =====================================================

  const exportCSV = () => {
    const rows = [
      [
        "Worker",
        "Role",
        "Site",
        "Present",
        "Absent",
        "Leave",
        "Attendance %",
      ],
    ];

    monthlySummary.forEach(
      (item) => {
        rows.push([
          item.worker.name,
          item.worker.role,
          item.worker.site,
          item.present,
          item.absent,
          item.leave,
          `${item.percentage}%`,
        ]);
      }
    );

    const csv =
      rows
        .map(
          (row) =>
            row
              .map(
                (cell) =>
                  `"${String(
                    cell
                  ).replace(
                    /"/g,
                    '""'
                  )}"`
              )
              .join(",")
        )
        .join("\n");

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
      `BuildTrack-Attendance-${currentMonth}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="attendance-page">

      {/* HEADER */}

      <div className="attendance-header">

        <div>
          <p className="attendance-label">
            WORKFORCE MANAGEMENT
          </p>

          <h1>
            Attendance
          </h1>

          <p className="attendance-description">
            Track daily worker attendance
            across your construction sites.
          </p>
        </div>

        <div className="attendance-date">
          <label>
            Attendance Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(
                e.target.value
              )
            }
          />
        </div>

      </div>

      {/* DATE NAVIGATION */}

      <div className="attendance-toolbar">

        <button
          onClick={() =>
            changeDate(-1)
          }
        >
          ← Previous Day
        </button>

        <strong>
          {formatDate(date)}
        </strong>

        <button
          onClick={() =>
            setDate(getToday())
          }
        >
          Today
        </button>

        <button
          onClick={() =>
            changeDate(1)
          }
        >
          Next Day →
        </button>

      </div>

      {/* TODAY STATISTICS */}

      <div className="attendance-stats">

        <div className="attendance-card">
          <div className="attendance-icon orange">
            👥
          </div>

          <p>
            Total Workers
          </p>

          <h2>
            {workers.length}
          </h2>
        </div>

        <div className="attendance-card">
          <div className="attendance-icon green">
            ✓
          </div>

          <p>
            Present
          </p>

          <h2>
            {present}
          </h2>
        </div>

        <div className="attendance-card">
          <div className="attendance-icon red">
            ✕
          </div>

          <p>
            Absent
          </p>

          <h2>
            {absent}
          </h2>
        </div>

        <div className="attendance-card">
          <div className="attendance-icon yellow">
            !
          </div>

          <p>
            On Leave
          </p>

          <h2>
            {leave}
          </h2>
        </div>

        <div className="attendance-card">
          <div className="attendance-icon orange">
            %
          </div>

          <p>
            Marked
          </p>

          <h2>
            {marked}
          </h2>

          <small>
            {notMarked} not marked
          </small>
        </div>

      </div>

      {/* SEARCH / FILTER */}

      <div className="attendance-toolbar">

        <input
          type="text"
          placeholder="Search worker..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <select
          value={siteFilter}
          onChange={(e) =>
            setSiteFilter(
              e.target.value
            )
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

        <button
          onClick={exportCSV}
        >
          ↓ Export Monthly Report
        </button>

      </div>

      {/* DAILY ATTENDANCE */}

      <div className="attendance-table-card">

        <h2>
          Daily Attendance
        </h2>

        {loading ? (
          <div className="no-workers">
            Loading attendance...
          </div>
        ) : filteredWorkers.length ===
          0 ? (
          <div className="no-workers">
            No workers found
          </div>
        ) : (
          <table className="attendance-table">

            <thead>
              <tr>
                <th>
                  WORKER
                </th>

                <th>
                  ROLE
                </th>

                <th>
                  SITE
                </th>

                <th>
                  STATUS
                </th>

                <th>
                  CHECK IN
                </th>

                <th>
                  CHECK OUT
                </th>

                <th>
                  HOURS
                </th>

                <th>
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody>

              {filteredWorkers.map(
                (worker) => {

                  const record =
                    attendance[
                      worker._id
                    ] || {};

                  const status =
                    record.status ||
                    "Not Marked";

                  return (
                    <tr
                      key={
                        worker._id
                      }
                    >

                      <td>
                        <div className="worker-name">

                          <div className="worker-avatar">

                            {worker.name
                              ?.split(" ")
                              .map(
                                (word) =>
                                  word[0]
                              )
                              .join("")
                              .substring(
                                0,
                                2
                              )}

                          </div>

                          <strong>
                            {worker.name}
                          </strong>

                        </div>
                      </td>

                      <td>
                        {worker.role}
                      </td>

                      <td>
                        {worker.site}
                      </td>

                      <td>

                        <span
                          className={`attendance-status ${
                            status ===
                            "Present"
                              ? "present"
                              : status ===
                                "Absent"
                              ? "absent"
                              : status ===
                                "Leave"
                              ? "leave"
                              : "not-marked"
                          }`}
                        >
                          {status}
                        </span>

                        {record.late && (
                          <small
                            style={{
                              display:
                                "block",
                              marginTop:
                                "4px",
                            }}
                          >
                            ⚠ Late
                          </small>
                        )}

                      </td>

                      <td>
                        {record.checkIn ||
                          "—"}
                      </td>

                      <td>
                        {record.checkOut ||
                          "—"}
                      </td>

                      <td>
                        {record.workingHours ||
                          "0h 0m"}
                      </td>

                      <td>

                        <div className="attendance-actions">

                          <button
                            type="button"
                            disabled={
                              saving ===
                              worker._id
                            }
                            onClick={() =>
                              updateStatus(
                                worker,
                                "Present"
                              )
                            }
                            className={
                              status ===
                              "Present"
                                ? "selected present-btn"
                                : "present-btn"
                            }
                          >
                            Present
                          </button>

                          <button
                            type="button"
                            disabled={
                              saving ===
                              worker._id
                            }
                            onClick={() =>
                              updateStatus(
                                worker,
                                "Absent"
                              )
                            }
                            className={
                              status ===
                              "Absent"
                                ? "selected absent-btn"
                                : "absent-btn"
                            }
                          >
                            Absent
                          </button>

                          <button
                            type="button"
                            disabled={
                              saving ===
                              worker._id
                            }
                            onClick={() =>
                              updateStatus(
                                worker,
                                "Leave"
                              )
                            }
                            className={
                              status ===
                              "Leave"
                                ? "selected leave-btn"
                                : "leave-btn"
                            }
                          >
                            Leave
                          </button>

                          <button
                            type="button"
                            disabled={
                              saving ===
                              worker._id
                            }
                            onClick={() =>
                              checkIn(worker)
                            }
                            style={{
                              background:
                                "#2563eb",
                              color:
                                "white",
                              border:
                                "none",
                              padding:
                                "8px 12px",
                              borderRadius:
                                "6px",
                              cursor:
                                "pointer",
                              fontWeight:
                                "600",
                              marginLeft:
                                "5px",
                            }}
                          >
                            {saving ===
                            worker._id
                              ? "Saving..."
                              : "Check In"}
                          </button>

                          <button
                            type="button"
                            disabled={
                              saving ===
                              worker._id
                            }
                            onClick={() =>
                              checkOut(worker)
                            }
                            style={{
                              background:
                                "#7c3aed",
                              color:
                                "white",
                              border:
                                "none",
                              padding:
                                "8px 12px",
                              borderRadius:
                                "6px",
                              cursor:
                                "pointer",
                              fontWeight:
                                "600",
                              marginLeft:
                                "5px",
                            }}
                          >
                            {saving ===
                            worker._id
                              ? "Saving..."
                              : "Check Out"}
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

      {/* MONTHLY SUMMARY */}

      <div className="attendance-table-card">

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            marginBottom:
              "20px",
          }}
        >

          <div>

            <h2>
              Monthly Attendance Summary
            </h2>

            <p>
              {currentMonth}
            </p>

          </div>

          <div>
            <strong>
              Monthly Attendance:{" "}
              {
                monthlyTotals.percentage
              }%
            </strong>
          </div>

        </div>

        <table className="attendance-table">

          <thead>

            <tr>

              <th>
                WORKER
              </th>

              <th>
                SITE
              </th>

              <th>
                PRESENT
              </th>

              <th>
                ABSENT
              </th>

              <th>
                LEAVE
              </th>

              <th>
                ATTENDANCE %
              </th>

            </tr>

          </thead>

          <tbody>

            {monthlySummary.map(
              (item) => (

                <tr
                  key={
                    item.worker._id
                  }
                >

                  <td>

                    <div className="worker-name">

                      <div className="worker-avatar">

                        {item.worker.name
                          ?.split(" ")
                          .map(
                            (word) =>
                              word[0]
                          )
                          .join("")
                          .substring(
                            0,
                            2
                          )}

                      </div>

                      <strong>
                        {
                          item.worker
                            .name
                        }
                      </strong>

                    </div>

                  </td>

                  <td>
                    {
                      item.worker
                        .site
                    }
                  </td>

                  <td>
                    {item.present}
                  </td>

                  <td>
                    {item.absent}
                  </td>

                  <td>
                    {item.leave}
                  </td>

                  <td>
                    <strong>
                      {
                        item.percentage
                      }%
                    </strong>
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Attendance;