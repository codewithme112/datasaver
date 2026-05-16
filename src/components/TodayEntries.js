import React, { useState, useEffect } from "react";

const TodayEntries = ({ allLeads, allWorks, allBookings }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState("lead");

  useEffect(() => {
    const todayISO = new Date().toISOString().split("T")[0];
    setSelectedDate(todayISO);
  }, []);

  // ── Safe date parser (ISO + "DD-MM-YYYY HH:mm:ss") ──
  const parseSheetDate = (ts) => {
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

  const formatTimestamp = (ts) => {
    const date = parseSheetDate(ts);
    if (!date) return "";
    return date.toLocaleString("hi-IN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour12: true,
    });
  };

  const formatDisplayDate = (ts) => {
    const d = parseSheetDate(ts);
    if (!d) return String(ts || "—").split("T")[0];
    return d.toLocaleString("hi-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDisplayTime = (ts) => {
    if (!ts) return "—";
    if (!String(ts).includes("T")) return ts;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString("hi-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ── WhatsApp ──
  const sendWhatsApp = (number, vehicleNumber) => {
    if (!number) return;
    const phone = String(number).trim();
    let finalNumber = phone.startsWith("0")
      ? "+91" + phone.substring(1)
      : phone.startsWith("+91")
      ? phone
      : "+91" + phone;

    const message =
      `आपके वाहन ${vehicleNumber} के लिए Sai Autotech - TATA Authorised Service Station | Commercial Vehicles में फ्री जनरल चेकअप उपलब्ध है।\n\n` +
      `UREA भरवाने पर पॉइंट्स मिलेंगे और निप्पल ग्रीसिंग ₹150 में कराई जा सकती है।\n\n` +
      `आसान लोकेशन के लिए देखें: https://maps.app.goo.gl/Ru4zf19JUpknN2yr5\n\n` +
      `समय निकालकर लाभ अवश्य उठाएं।`;

    window.open(
      `https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // ── Filter ──
  const entries = viewType === "lead" ? allLeads : viewType === "work" ? allWorks : allBookings;

  const filteredEntries = entries.filter((entry) => {
    const dateObj = parseSheetDate(entry.timestamp || entry.Timestamp);
    if (!dateObj) return false;
    const entryISO = dateObj.toISOString().split("T")[0];

    const matchesDate = searchTerm ? true : selectedDate ? entryISO === selectedDate : true;

    const search = searchTerm.toLowerCase();
    let matchesSearch = false;
    if (viewType === "lead") {
      matchesSearch = String(entry.name || "").toLowerCase().includes(search);
    } else if (viewType === "work") {
      matchesSearch = String(entry.vehicleNumber || entry["Vehicle Number"] || "").toLowerCase().includes(search);
    } else if (viewType === "booking") {
      matchesSearch = String(entry.customerName || entry["Customer Name"] || "").toLowerCase().includes(search) || 
                      String(entry.vehicleNumber || entry["Vehicle Number"] || "").toLowerCase().includes(search);
    }

    return matchesDate && matchesSearch;
  });

  // ── Revenue ──
  const todayRevenue =
    viewType === "work"
      ? filteredEntries.reduce(
          (sum, e) => sum + (parseFloat(e.totalBill || e["Total Bill"]) || 0),
          0
        )
      : 0;

  const now = new Date();
  const monthRevenue =
    viewType === "work"
      ? entries.reduce((sum, e) => {
          const d = parseSheetDate(e.timestamp || e.Timestamp);
          if (!d) return sum;
          if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
            return sum + (parseFloat(e.totalBill || e["Total Bill"]) || 0);
          }
          return sum;
        }, 0)
      : 0;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Page Title */}
      <div className="section-header">
        <h1 className="section-title">📋 Entries</h1>
        <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          {filteredEntries.length} records
        </span>
      </div>

      {/* Toggle Tabs */}
      <div className="toggle-tabs">
        <button
          className={`toggle-tab ${viewType === "lead" ? "active" : ""}`}
          onClick={() => setViewType("lead")}
        >
          📝 Leads
        </button>
        <button
          className={`toggle-tab ${viewType === "work" ? "active" : ""}`}
          onClick={() => setViewType("work")}
        >
          🔧 Work
        </button>
        <button
          className={`toggle-tab ${viewType === "booking" ? "active" : ""}`}
          onClick={() => setViewType("booking")}
        >
          📅 Bookings
        </button>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="field-input"
        />
        <input
          type="text"
          placeholder={viewType === "lead" ? "नाम से खोजें..." : viewType === "work" ? "वाहन नंबर से खोजें..." : "नाम या वाहन नंबर..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="field-input"
        />
      </div>

      {/* Entries */}
      {filteredEntries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>कोई डेटा नहीं मिला</p>
        </div>
      ) : (
        <div className="entries-list">
          {filteredEntries.map((entry, index) => (
            <div key={index} className="entry-card">
              <div className="entry-header">
                <span className="entry-badge">#{index + 1}</span>
                <span className="entry-time">
                  {formatTimestamp(entry.timestamp || entry.Timestamp)}
                </span>
              </div>

              {viewType === "lead" && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">नाम</span>
                    <span className="detail-value">{entry.name || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">वाहन नंबर</span>
                    <span className="detail-value">{entry.vehicleNumber || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">टोकन नंबर</span>
                    <span className="detail-value">{entry.tokenNumber || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">संपर्क नंबर</span>
                    <span className="detail-value">{entry.contactNumber || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">कंपनी</span>
                    <span className="detail-value">{entry.companyName || "—"}</span>
                  </div>
                  <button
                    className="btn btn-success btn-sm"
                    style={{ marginTop: 14, width: "100%" }}
                    onClick={() =>
                      sendWhatsApp(entry.contactNumber, entry.vehicleNumber)
                    }
                  >
                    💬 WhatsApp भेजें
                  </button>
                </>
              )}
              
              {viewType === "work" && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">वाहन नंबर</span>
                    <span className="detail-value">
                      {entry.vehicleNumber || entry["Vehicle Number"] || "—"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">किया गया काम</span>
                    <span className="detail-value">
                      {entry.workDone || entry["Work Done"] || "—"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Parts Cost</span>
                    <span className="detail-value">
                      ₹{entry.partsCost || entry["Parts Cost"] || "0"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Labour Cost</span>
                    <span className="detail-value">
                      ₹{entry.labourCost || entry["Labour Cost"] || "0"}
                    </span>
                  </div>
                  <div
                    className="detail-row"
                    style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <span
                      className="detail-label"
                      style={{ color: "var(--success)", fontWeight: 700 }}
                    >
                      कुल बिल
                    </span>
                    <span
                      className="detail-value"
                      style={{ color: "var(--success)", fontSize: 16 }}
                    >
                      ₹{entry.totalBill || entry["Total Bill"] || "0"}
                    </span>
                  </div>
                  {(entry.remarks || entry["Remarks"]) && (
                    <div className="detail-row">
                      <span className="detail-label">Remarks</span>
                      <span className="detail-value">
                        {entry.remarks || entry["Remarks"]}
                      </span>
                    </div>
                  )}
                </>
              )}
              
              {viewType === "booking" && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">ग्राहक</span>
                    <span className="detail-value">{entry.customerName || entry["Customer Name"] || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">कंपनी</span>
                    <span className="detail-value">{entry.companyName || entry["Company Name"] || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">वाहन नंबर</span>
                    <span className="detail-value">{entry.vehicleNumber || entry["Vehicle Number"] || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">संपर्क नंबर</span>
                    <span className="detail-value">{entry.contactNumber || entry["Contact Number"] || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">सेवा</span>
                    <span className="detail-value">{entry.serviceType || entry["Service Type"] || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">पसंदीदा तारीख</span>
                    <span className="detail-value" style={{ color: "var(--accent)" }}>{formatDisplayDate(entry.preferredDate || entry["Preferred Date"])}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">पसंदीदा समय</span>
                    <span className="detail-value">{formatDisplayTime(entry.preferredTime || entry["Preferred Time"])}</span>
                  </div>
                  {(entry.notes || entry["Notes"]) && (
                    <div className="detail-row">
                      <span className="detail-label">नोट्स</span>
                      <span className="detail-value">{entry.notes || entry["Notes"]}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Revenue Summary */}
      {viewType === "work" && filteredEntries.length > 0 && (
        <div className="revenue-box">
          <div className="revenue-item">
            <div className="revenue-amount">
              ₹{todayRevenue.toLocaleString("en-IN")}
            </div>
            <div className="revenue-label">आज का Revenue</div>
          </div>
          <div className="revenue-item">
            <div className="revenue-amount">
              ₹{monthRevenue.toLocaleString("en-IN")}
            </div>
            <div className="revenue-label">इस महीने का Revenue</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayEntries;
