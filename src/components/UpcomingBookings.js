import React, { useState, useMemo } from "react";

const UpcomingBookings = ({ allBookings }) => {
  const [filter, setFilter] = useState("upcoming"); // "upcoming" | "today" | "all"
  const [searchTerm, setSearchTerm] = useState("");

  const todayISO = new Date().toISOString().split("T")[0];

  // ── WhatsApp Reminder ──
  const sendReminder = (booking) => {
    const phone = String(booking.contactNumber || "").trim();
    if (!phone) return;
    const finalNumber = phone.startsWith("+91")
      ? phone
      : phone.startsWith("0")
      ? "+91" + phone.substring(1)
      : "+91" + phone;

    const message =
      `नमस्ते ${booking.customerName || "जी"}! 🙏\n\n` +
      `आपकी Sai Autotech - TATA Authorised Service Station में Advance Booking की याद दिलाना चाहते हैं।\n\n` +
      `📅 तारीख: ${booking.preferredDate || ""}\n` +
      `⏰ समय: ${booking.preferredTime || ""}\n` +
      `🚗 वाहन: ${booking.vehicleNumber || ""}\n` +
      `🔧 सेवा: ${booking.serviceType || ""}\n\n` +
      `कृपया समय पर पधारें। धन्यवाद! 🙏\n\n` +
      `📍 Location: https://maps.app.goo.gl/Ru4zf19JUpknN2yr5`;

    window.open(
      `https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // ── Status badge logic ──
  const getStatus = (booking) => {
    const date = booking.preferredDate || booking["Preferred Date"] || "";
    if (!date) return { label: "Unknown", color: "var(--text-muted)", bg: "var(--bg-elevated)" };
    if (date < todayISO) return { label: "Past", color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
    if (date === todayISO) return { label: "Today", color: "var(--warning)", bg: "rgba(245,158,11,0.12)" };
    return { label: "Upcoming", color: "var(--accent)", bg: "var(--accent-light)" };
  };

  // ── Filtered bookings ──
  const filtered = useMemo(() => {
    let list = [...allBookings];

    if (filter === "today") {
      list = list.filter(
        (b) => (b.preferredDate || b["Preferred Date"] || "") === todayISO
      );
    } else if (filter === "upcoming") {
      list = list.filter(
        (b) => (b.preferredDate || b["Preferred Date"] || "") >= todayISO
      );
    }

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(
        (b) =>
          String(b.customerName || "").toLowerCase().includes(s) ||
          String(b.vehicleNumber || "").toLowerCase().includes(s) ||
          String(b.contactNumber || "").includes(s)
      );
    }

    // Sort by date + time
    list.sort((a, b) => {
      const da = (a.preferredDate || "") + (a.preferredTime || "");
      const db = (b.preferredDate || "") + (b.preferredTime || "");
      return da.localeCompare(db);
    });

    return list;
  }, [allBookings, filter, searchTerm, todayISO]);

  const todayCount = allBookings.filter(
    (b) => (b.preferredDate || b["Preferred Date"] || "") === todayISO
  ).length;

  const upcomingCount = allBookings.filter(
    (b) => (b.preferredDate || b["Preferred Date"] || "") > todayISO
  ).length;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div className="section-header">
        <h1 className="section-title">📅 Upcoming Bookings</h1>
        <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          {filtered.length} records
        </span>
      </div>

      {/* Quick Count Pills */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <span className="booking-pill pill-today">
          🌟 आज: {todayCount}
        </span>
        <span className="booking-pill pill-upcoming">
          ⏳ Upcoming: {upcomingCount}
        </span>
        <span className="booking-pill pill-total">
          📋 Total: {allBookings.length}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="toggle-tabs">
        {[
          { key: "upcoming", label: "⏳ Upcoming" },
          { key: "today", label: "🌟 Today" },
          { key: "all", label: "📋 All" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`toggle-tab ${filter === tab.key ? "active" : ""}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="filter-row" style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="नाम, वाहन नंबर, या संपर्क से खोजें..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="field-input"
        />
      </div>

      {/* Booking Cards */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p>कोई Booking नहीं मिली</p>
        </div>
      ) : (
        <div className="entries-list">
          {filtered.map((booking, index) => {
            const status = getStatus(booking);
            return (
              <div key={index} className="booking-card">
                {/* Card Header */}
                <div className="booking-card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="entry-badge">#{index + 1}</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 20,
                        color: status.color,
                        background: status.bg,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--accent)",
                      }}
                    >
                      {booking.preferredDate || "—"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {booking.preferredTime || "—"}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", margin: "12px 0" }}>
                  <div className="detail-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                    <span className="detail-label">ग्राहक</span>
                    <span className="detail-value">{booking.customerName || "—"}</span>
                  </div>
                  <div className="detail-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                    <span className="detail-label">संपर्क</span>
                    <span className="detail-value">{booking.contactNumber || "—"}</span>
                  </div>
                  <div className="detail-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                    <span className="detail-label">वाहन नंबर</span>
                    <span className="detail-value">{booking.vehicleNumber || "—"}</span>
                  </div>
                  <div className="detail-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                    <span className="detail-label">सेवा</span>
                    <span className="detail-value" style={{ fontSize: 13 }}>
                      {booking.serviceType || booking["Service Type"] || "—"}
                    </span>
                  </div>
                </div>

                {(booking.notes || booking["Notes"]) && (
                  <div
                    style={{
                      background: "var(--bg-elevated)",
                      borderRadius: 6,
                      padding: "8px 12px",
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      marginBottom: 12,
                    }}
                  >
                    📝 {booking.notes || booking["Notes"]}
                  </div>
                )}

                {/* WhatsApp Reminder */}
                <button
                  className="btn btn-success btn-sm"
                  style={{ width: "100%" }}
                  onClick={() => sendReminder(booking)}
                >
                  💬 WhatsApp Reminder भेजें
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingBookings;
