import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ── Safe date parser (handles ISO + "DD-MM-YYYY HH:mm:ss") ──
const parseDate = (ts) => {
  if (!ts) return null;
  try {
    if (ts.includes("T") && ts.includes("Z")) {
      const d = new Date(ts);
      return isNaN(d.getTime()) ? null : d;
    }
    const [datePart, timePart] = ts.split(" ");
    const [dd, mm, yyyy] = datePart.split("-");
    const [hh = 0, min = 0, ss = 0] = (timePart || "0:0:0").split(":");
    const d = new Date(yyyy, mm - 1, dd, hh, min, ss);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const formatDisplayDate = (ts) => {
  const d = parseDate(ts);
  if (!d) return String(ts || "—").split("T")[0];
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const formatDisplayTime = (ts) => {
  if (!ts) return "—";
  if (!String(ts).includes("T")) return ts; // Already formatted or plain string
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  let h = d.getHours();
  let m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
};

// ── Custom Tooltip for chart ──
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "8px",
          padding: "10px 14px",
          fontSize: "13px",
          color: "#f1f5f9",
        }}
      >
        <p style={{ marginBottom: 4, color: "#94a3b8" }}>{label}</p>
        <p style={{ fontWeight: 700, color: "#22c55e" }}>
          ₹{payload[0].value.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = ({ allLeads, allWorks, allBookings = [] }) => {
  const [timeFilter, setTimeFilter] = useState("today"); // today, yesterday, last7, month, all
  const [activeTab, setActiveTab] = useState("works"); // works, leads, bookings
  const [searchTerm, setSearchTerm] = useState("");

  const now = new Date();

  // ── Helper to check if a date falls in the selected filter ──
  const isInFilter = (d) => {
    if (!d) return false;
    const dTime = d.getTime();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (timeFilter === "today") {
      return dTime >= today;
    } else if (timeFilter === "yesterday") {
      const yesterday = today - 86400000;
      return dTime >= yesterday && dTime < today;
    } else if (timeFilter === "last7") {
      const last7 = today - 7 * 86400000;
      return dTime >= last7;
    } else if (timeFilter === "month") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true; // "all"
  };

  // ── Stats based on filter ──
  const stats = useMemo(() => {
    const periodLeads = allLeads.filter((e) => isInFilter(parseDate(e.timestamp)));
    const periodWorks = allWorks.filter((e) => isInFilter(parseDate(e.timestamp || e.Timestamp)));
    const periodRevenue = periodWorks.reduce((sum, e) => sum + (parseFloat(e.totalBill || e["Total Bill"]) || 0), 0);
    
    // For bookings, check the creation timestamp so it shows bookings *made* in this period
    const periodBookings = allBookings.filter((e) => 
      isInFilter(parseDate(e.timestamp || e.Timestamp))
    );

    return {
      leads: periodLeads,
      works: periodWorks,
      bookings: periodBookings,
      revenue: periodRevenue,
    };
  }, [allLeads, allWorks, allBookings, timeFilter]);

  // ── Table Data (Filtered + Searched) ──
  const tableData = useMemo(() => {
    let data = [];
    if (activeTab === "works") data = [...stats.works].reverse();
    if (activeTab === "leads") data = [...stats.leads].reverse();
    if (activeTab === "bookings") data = [...stats.bookings].reverse();

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      data = data.filter((item) => {
        return Object.values(item).some(
          (val) => String(val).toLowerCase().includes(s)
        );
      });
    }
    return data;
  }, [stats, activeTab, searchTerm]);

  // ── Last 6 months revenue chart data ──
  const chartData = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const revenue = allWorks
        .filter((e) => {
          const date = parseDate(e.timestamp || e.Timestamp);
          return date && date.getMonth() === month && date.getFullYear() === year;
        })
        .reduce((sum, e) => sum + (parseFloat(e.totalBill || e["Total Bill"]) || 0), 0);
      result.push({ month: MONTHS[month], revenue });
    }
    return result;
  }, [allWorks]);

  return (
    <div>
      {/* ── Page Title & Global Filters ── */}
      <div className="section-header" style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="section-title" style={{ fontSize: 24 }}>Manager Dashboard</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            Business Overview & Analytics
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontSize: 13, color: "var(--text-secondary)" }}>फ़िल्टर:</label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="field-input"
            style={{ width: "auto", padding: "6px 12px", fontSize: 13, minWidth: 150 }}
          >
            <option value="today">आज (Today)</option>
            <option value="yesterday">कल (Yesterday)</option>
            <option value="last7">पिछले 7 दिन (Last 7 Days)</option>
            <option value="month">इस महीने (This Month)</option>
            <option value="all">अब तक के सभी (All Time)</option>
          </select>
        </div>
      </div>

      {/* ── Dynamic Stats Cards ── */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-number green">
            ₹{stats.revenue.toLocaleString("en-IN")}
          </div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔧</div>
          <div className="stat-number">{stats.works.length}</div>
          <div className="stat-label">Completed Works</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-number">{stats.leads.length}</div>
          <div className="stat-label">New Leads</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-number" style={{ color: "var(--warning)" }}>
            {stats.bookings.length}
          </div>
          <div className="stat-label">Scheduled Bookings</div>
        </div>
      </div>

      {/* ── Revenue Chart ── */}
      <div className="chart-card">
        <p className="chart-title">📊 Revenue Trend (Last 6 Months)</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#94a3b8", fontSize: 13 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + "k" : v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59,130,246,0.08)" }} />
            <Bar
              dataKey="revenue"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Interactive Data Viewer ── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div className="toggle-tabs" style={{ margin: 0 }}>
            <button
              className={`toggle-tab ${activeTab === "works" ? "active" : ""}`}
              onClick={() => setActiveTab("works")}
            >
              🔧 Works ({stats.works.length})
            </button>
            <button
              className={`toggle-tab ${activeTab === "bookings" ? "active" : ""}`}
              onClick={() => setActiveTab("bookings")}
            >
              Advance Bookings ({stats.bookings.length})
            </button>
            <button
              className={`toggle-tab ${activeTab === "leads" ? "active" : ""}`}
              onClick={() => setActiveTab("leads")}
            >
              📋 Leads ({stats.leads.length})
            </button>
          </div>
          <input
            type="text"
            placeholder="Search in table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field-input"
            style={{ width: "200px", padding: "8px 12px" }}
          />
        </div>

        {tableData.length === 0 ? (
          <div className="empty-state" style={{ margin: "40px 0" }}>
            <div className="empty-state-icon">📭</div>
            <p>इस फ़िल्टर में कोई डेटा नहीं मिला</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                  {activeTab === "works" && ["तारीख", "वाहन", "काम", "बिल"].map(h => <th key={h} className="dash-th">{h}</th>)}
                  {activeTab === "bookings" && ["तारीख/समय", "ग्राहक", "कंपनी", "वाहन", "सेवा", "संपर्क", "नोट्स"].map(h => <th key={h} className="dash-th">{h}</th>)}
                  {activeTab === "leads" && ["तारीख", "ग्राहक", "वाहन", "संपर्क"].map(h => <th key={h} className="dash-th">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={i} className="dash-tr">
                    {/* Works Columns */}
                    {activeTab === "works" && (
                      <>
                        <td className="dash-td" style={{ color: "var(--text-secondary)" }}>
                          {formatDisplayDate(row.timestamp || row.Timestamp)}
                        </td>
                        <td className="dash-td" style={{ fontWeight: 600 }}>{row.vehicleNumber || row["Vehicle Number"]}</td>
                        <td className="dash-td" style={{ color: "var(--text-secondary)" }}>{row.workDone || row["Work Done"]}</td>
                        <td className="dash-td" style={{ color: "var(--success)", fontWeight: 700 }}>
                          ₹{(row.totalBill || row["Total Bill"] || 0).toLocaleString("en-IN")}
                        </td>
                      </>
                    )}

                    {/* Bookings Columns */}
                    {activeTab === "bookings" && (
                      <>
                        <td className="dash-td">
                          <span style={{ color: "var(--accent)", fontWeight: 600 }}>{formatDisplayDate(row.preferredDate || row["Preferred Date"])}</span>
                          <br />
                          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{formatDisplayTime(row.preferredTime || row["Preferred Time"])}</span>
                        </td>
                        <td className="dash-td">{row.customerName || row["Customer Name"]}</td>
                        <td className="dash-td" style={{ color: "var(--text-secondary)" }}>{row.companyName || row["Company Name"] || "—"}</td>
                        <td className="dash-td" style={{ fontWeight: 600 }}>{row.vehicleNumber || row["Vehicle Number"]}</td>
                        <td className="dash-td" style={{ color: "var(--text-secondary)" }}>{row.serviceType || row["Service Type"]}</td>
                        <td className="dash-td">{row.contactNumber || row["Contact Number"] || "—"}</td>
                        <td className="dash-td" style={{ color: "var(--text-secondary)", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={row.notes || row.Notes || "—"}>{row.notes || row.Notes || "—"}</td>
                      </>
                    )}

                    {/* Leads Columns */}
                    {activeTab === "leads" && (
                      <>
                        <td className="dash-td" style={{ color: "var(--text-secondary)" }}>
                          {formatDisplayDate(row.timestamp || row.Timestamp)}
                        </td>
                        <td className="dash-td">{row.name || row.Name}</td>
                        <td className="dash-td" style={{ fontWeight: 600 }}>{row.vehicleNumber || row["Vehicle Number"]}</td>
                        <td className="dash-td">{row.contactNumber || row["Contact Number"]}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Quick Links ── */}
      <div className="quick-links" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginTop: 24 }}>
        <Link to="/lead" className="quick-link-card">
          <div className="quick-link-icon">📝</div>
          <div className="quick-link-label">Lead Form</div>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>नया lead जोड़ें</p>
        </Link>
        <Link to="/work" className="quick-link-card">
          <div className="quick-link-icon">🔧</div>
          <div className="quick-link-label">Work Form</div>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>काम और billing</p>
        </Link>
        <Link to="/booking" className="quick-link-card">
          <div className="quick-link-icon">📅</div>
          <div className="quick-link-label">Advance Booking</div>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>नया Appointment</p>
        </Link>
        <Link to="/entries" className="quick-link-card">
          <div className="quick-link-icon">🗃️</div>
          <div className="quick-link-label">All Entries</div>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>सारे रिकॉर्ड्स देखें</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
