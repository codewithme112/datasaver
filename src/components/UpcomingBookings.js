import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

// ── Extracts YYYY-MM-DD from any date format (ISO timestamp, plain date, DD-MM-YYYY) ──
const normalizeDateStr = (val) => {
  if (!val) return "";
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (s.includes("T")) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(d.getUTCDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }
  return s;
};

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_FULL    = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// ── Formats YYYY-MM-DD → "26 May 2026" ──
const formatPrefDate = (val) => {
  const iso = normalizeDateStr(val);
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "—";
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd} ${MONTHS_SHORT[Number(mm) - 1]} ${yyyy}`;
};

// ── Formats time value (text "09:00 AM" OR Google Sheets 1899 ISO) → "09:00 AM" ──
const formatPrefTime = (val) => {
  if (!val) return "—";
  const s = String(val).trim();
  if (!s.includes("T")) return s; // already "09:00 AM" or similar
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  // Google Sheets serializes time as 1899-12-30T{time}Z — use UTC h/m
  const useUTC = s.startsWith("1899") || s.startsWith("1900");
  const h   = useUTC ? d.getUTCHours()   : d.getHours();
  const min = useUTC ? d.getUTCMinutes() : d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h % 12 || 12;
  return `${String(h12).padStart(2,"0")}:${String(min).padStart(2,"0")} ${ampm}`;
};

// ── Formats creation timestamp → "16 May 2026, 09:00 AM" ──
const formatCreatedAt = (ts) => {
  if (!ts) return "—";
  const s = String(ts);
  let d;
  if (s.includes("T")) {
    d = new Date(s);
  } else {
    const [datePart, timePart] = s.split(" ");
    const parts = datePart.split("-");
    if (parts[0].length === 4) {
      d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]),
        ...(timePart ? timePart.split(":").map(Number) : [0,0,0]));
    } else {
      d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]),
        ...(timePart ? timePart.split(":").map(Number) : [0,0,0]));
    }
  }
  if (!d || isNaN(d.getTime())) return s;
  const dd   = String(d.getDate()).padStart(2, "0");
  const mon  = MONTHS_SHORT[d.getMonth()];
  const yyyy = d.getFullYear();
  let h = d.getHours();
  const min  = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${dd} ${mon} ${yyyy}, ${String(h).padStart(2,"0")}:${min} ${ampm}`;
};

const UpcomingBookings = ({ allBookings, allWorks = [] }) => {
  const [viewMode, setViewMode]     = useState("upcoming");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const todayISO = new Date().toISOString().split("T")[0];

  // ── Arrived detection ──
  const arrivedSet = useMemo(() => {
    const set = new Set();
    allWorks.forEach(w => {
      const ts = w.timestamp || w.Timestamp;
      if (!ts) return;
      const workDate = normalizeDateStr(ts.split(" ")[0]); // date part only
      const vehicle = (w.vehicleNumber || w["Vehicle Number"] || "").toUpperCase().trim();
      if (vehicle && workDate) set.add(`${vehicle}__${workDate}`);
    });
    return set;
  }, [allWorks]);

  const hasArrived = (b) => {
    const v = (b.vehicleNumber || b["Vehicle Number"] || "").toUpperCase().trim();
    const d = normalizeDateStr(b.preferredDate || b["Preferred Date"] || "");
    return arrivedSet.has(`${v}__${d}`);
  };

  // ── Filter list (all comparisons use normalized dates) ──
  const filtered = useMemo(() => {
    let list = [...allBookings];

    if (viewMode === "today") {
      list = list.filter(b => normalizeDateStr(b.preferredDate || b["Preferred Date"]) === todayISO);
    } else if (viewMode === "upcoming") {
      list = list.filter(b => normalizeDateStr(b.preferredDate || b["Preferred Date"]) >= todayISO);
    } else if (viewMode === "date" && selectedDate) {
      list = list.filter(b => normalizeDateStr(b.preferredDate || b["Preferred Date"]) === selectedDate);
    }

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(b =>
        String(b.customerName || b["Customer Name"] || "").toLowerCase().includes(s) ||
        String(b.vehicleNumber || b["Vehicle Number"] || "").toLowerCase().includes(s) ||
        String(b.contactNumber || b["Contact Number"] || "").includes(s)
      );
    }

    list.sort((a, b) => {
      const da = normalizeDateStr(a.preferredDate || a["Preferred Date"]) + " " + formatPrefTime(a.preferredTime || a["Preferred Time"]);
      const db = normalizeDateStr(b.preferredDate || b["Preferred Date"]) + " " + formatPrefTime(b.preferredTime || b["Preferred Time"]);
      return da.localeCompare(db);
    });

    return list;
  }, [allBookings, viewMode, selectedDate, searchTerm, todayISO]);

  // ── Stats ──
  const stats = useMemo(() => {
    const arrived   = filtered.filter(b => hasArrived(b)).length;
    const noShow    = filtered.filter(b => normalizeDateStr(b.preferredDate || b["Preferred Date"]) < todayISO && !hasArrived(b)).length;
    const upcomingC = filtered.filter(b => normalizeDateStr(b.preferredDate || b["Preferred Date"]) > todayISO).length;
    const todayApt  = filtered.filter(b => normalizeDateStr(b.preferredDate || b["Preferred Date"]) === todayISO).length;
    return { total: filtered.length, arrived, noShow, upcoming: upcomingC, todayApt };
  }, [filtered, todayISO]);

  // ── Group by normalized date ──
  const groupedByDate = useMemo(() => {
    const groups = {};
    filtered.forEach(b => {
      const date = normalizeDateStr(b.preferredDate || b["Preferred Date"]) || "Unknown";
      if (!groups[date]) groups[date] = [];
      groups[date].push(b);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // ── Date header label ──
  const formatDateHeader = (dateStr) => {
    if (!dateStr || dateStr === "Unknown") return dateStr;
    try {
      const [yyyy, mm, dd] = dateStr.split("-");
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      if (isNaN(d.getTime())) return dateStr;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowISO = tomorrow.toISOString().split("T")[0];
      const label = `${String(d.getDate()).padStart(2,"0")} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
      if (dateStr === todayISO)    return `Today — ${label}`;
      if (dateStr === tomorrowISO) return `Tomorrow — ${label}`;
      return `${DAYS_FULL[d.getDay()]}, ${label}`;
    } catch { return dateStr; }
  };

  // ── WhatsApp: Reminder ──
  const sendReminder = (b) => {
    const phone = String(b.contactNumber || b["Contact Number"] || "").trim();
    if (!phone) return;
    const num = phone.startsWith("+91") ? phone : "+91" + phone.replace(/^0/, "");
    const aptDate = formatPrefDate(b.preferredDate || b["Preferred Date"]);
    const aptTime = formatPrefTime(b.preferredTime || b["Preferred Time"]);
    const msg =
      `नमस्ते ${b.customerName || b["Customer Name"] || "जी"}! 🙏\n\n` +
      `आपकी *Sai Autotech - TATA Authorised Service Station* में Appointment की याद दिलाना चाहते हैं।\n\n` +
      `📅 तारीख: *${aptDate}*\n` +
      `⏰ समय: *${aptTime}*\n` +
      `🚛 वाहन: *${b.vehicleNumber || b["Vehicle Number"] || ""}*\n` +
      `🔧 सेवा: ${b.serviceType || b["Service Type"] || ""}\n\n` +
      `कृपया समय पर पधारें। धन्यवाद! 🙏\n\n` +
      `📍 Location: https://maps.app.goo.gl/Ru4zf19JUpknN2yr5`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // ── WhatsApp: No-Show Follow Up ──
  const sendNoShow = (b) => {
    const phone = String(b.contactNumber || b["Contact Number"] || "").trim();
    if (!phone) return;
    const num = phone.startsWith("+91") ? phone : "+91" + phone.replace(/^0/, "");
    const aptDate = formatPrefDate(b.preferredDate || b["Preferred Date"]);
    const aptTime = formatPrefTime(b.preferredTime || b["Preferred Time"]);
    const msg =
      `नमस्ते ${b.customerName || b["Customer Name"] || "जी"}! 🙏\n\n` +
      `*${aptDate}* को *${aptTime}* पर आपकी Sai Autotech में ` +
      `*${b.serviceType || b["Service Type"] || "Service"}* की Booking थी।\n\n` +
      `🚛 वाहन: ${b.vehicleNumber || b["Vehicle Number"] || ""}\n\n` +
      `आप नहीं आ सके — कोई बात नहीं! 😊\n` +
      `कभी भी नया Appointment लें, हम आपकी सेवा के लिए हमेशा तैयार हैं।\n\n` +
      `📞 Call/WhatsApp करें\n` +
      `📍 Location: https://maps.app.goo.gl/Ru4zf19JUpknN2yr5`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="section-title">📅 Upcoming Bookings</h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3 }}>
            Appointment management
          </p>
        </div>
        <Link to="/booking" className="btn btn-primary btn-sm" style={{ width: "auto" }}>
          + New Booking
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-number" style={{ color: "var(--success)" }}>{stats.arrived}</div>
          <div className="stat-label">आ गए</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-number" style={{ color: "var(--danger)" }}>{stats.noShow}</div>
          <div className="stat-label">नहीं आए</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-number" style={{ color: "var(--warning)" }}>{stats.upcoming}</div>
          <div className="stat-label">Upcoming</div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="toggle-tabs">
        <button className={`toggle-tab ${viewMode === "today" ? "active" : ""}`} onClick={() => setViewMode("today")}>
          🌟 आज ({stats.todayApt})
        </button>
        <button className={`toggle-tab ${viewMode === "upcoming" ? "active" : ""}`} onClick={() => setViewMode("upcoming")}>
          ⏳ Upcoming
        </button>
        <button className={`toggle-tab ${viewMode === "date" ? "active" : ""}`} onClick={() => setViewMode("date")}>
          📅 तारीख
        </button>
        <button className={`toggle-tab ${viewMode === "all" ? "active" : ""}`} onClick={() => setViewMode("all")}>
          📋 सभी
        </button>
      </div>

      {viewMode === "date" && (
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="field-input"
          style={{ marginBottom: 16 }}
        />
      )}

      <input
        type="text"
        placeholder="नाम, वाहन नंबर, संपर्क से खोजें..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="field-input"
        style={{ marginBottom: 20 }}
      />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p>कोई Booking नहीं मिली</p>
        </div>
      ) : (
        <div>
          {groupedByDate.map(([date, bookings]) => {
            const isPastDate  = date < todayISO;
            const isTodayDate = date === todayISO;
            return (
              <div key={date} style={{ marginBottom: 32 }}>
                <div className={`date-group-header ${isTodayDate ? "date-today" : isPastDate ? "date-past" : "date-future"}`}>
                  <span style={{ fontWeight: 700 }}>{formatDateHeader(date)}</span>
                  <span className="date-group-count">{bookings.length} bookings</span>
                </div>

                <div className="entries-list">
                  {bookings.map((booking, i) => {
                    const arrived   = hasArrived(booking);
                    const bDate     = normalizeDateStr(booking.preferredDate || booking["Preferred Date"] || "");
                    const isPast    = bDate < todayISO;
                    const isNoShow  = isPast && !arrived;
                    const isUpcoming = bDate > todayISO;
                    const isToday   = bDate === todayISO;

                    const aptDate   = formatPrefDate(booking.preferredDate || booking["Preferred Date"]);
                    const aptTime   = formatPrefTime(booking.preferredTime || booking["Preferred Time"]);
                    const createdAt = formatCreatedAt(booking.timestamp || booking.Timestamp);

                    return (
                      <div key={i} className={`booking-card ${arrived ? "booking-arrived" : isNoShow ? "booking-noshow" : ""}`}>
                        {/* Card Header */}
                        <div className="booking-card-header">
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span className="entry-badge">#{i + 1}</span>
                            {arrived   && <span className="status-pill status-arrived">✅ आ गए</span>}
                            {isNoShow  && <span className="status-pill status-noshow">❌ नहीं आए</span>}
                            {isToday && !arrived && <span className="status-pill status-today">🌟 आज</span>}
                            {isUpcoming && <span className="status-pill status-upcoming">⏳ Upcoming</span>}
                          </div>
                          {/* Booking creation time */}
                          <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "right" }}>
                            Booked: {createdAt}
                          </div>
                        </div>

                        {/* Appointment Date + Time — prominent box */}
                        <div className="apt-datetime-box">
                          <div className="apt-datetime-item">
                            <span className="apt-datetime-label">📅 Appointment तारीख</span>
                            <span className="apt-datetime-value">{aptDate}</span>
                          </div>
                          <div className="apt-datetime-divider" />
                          <div className="apt-datetime-item">
                            <span className="apt-datetime-label">⏰ Appointment समय</span>
                            <span className="apt-datetime-value">{aptTime}</span>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="booking-detail-grid">
                          <div>
                            <div className="detail-label">👤 ग्राहक</div>
                            <div className="detail-value" style={{ textAlign: "left" }}>
                              {booking.customerName || booking["Customer Name"] || "—"}
                            </div>
                          </div>
                          <div>
                            <div className="detail-label">📞 संपर्क</div>
                            <div className="detail-value" style={{ textAlign: "left" }}>
                              {booking.contactNumber || booking["Contact Number"] || "—"}
                            </div>
                          </div>
                          <div>
                            <div className="detail-label">🚛 वाहन नंबर</div>
                            <div className="detail-value" style={{ textAlign: "left", fontFamily: "monospace", letterSpacing: 1 }}>
                              {booking.vehicleNumber || booking["Vehicle Number"] || "—"}
                            </div>
                          </div>
                          <div>
                            <div className="detail-label">🔧 सेवा</div>
                            <div className="detail-value" style={{ textAlign: "left", fontSize: 12 }}>
                              {booking.serviceType || booking["Service Type"] || "—"}
                            </div>
                          </div>
                          {(booking.companyName || booking["Company Name"]) && (
                            <div style={{ gridColumn: "span 2" }}>
                              <div className="detail-label">🏢 कंपनी</div>
                              <div className="detail-value" style={{ textAlign: "left" }}>
                                {booking.companyName || booking["Company Name"]}
                              </div>
                            </div>
                          )}
                          {(booking.notes || booking["Notes"]) && (
                            <div style={{ gridColumn: "span 2" }}>
                              <div style={{
                                background: "var(--bg-elevated)", borderRadius: 8,
                                padding: "8px 12px", fontSize: 13, color: "var(--text-secondary)", marginTop: 4,
                              }}>
                                📝 {booking.notes || booking["Notes"]}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* WhatsApp Buttons */}
                        {!arrived && (
                          <div className="booking-wa-btns">
                            {(isUpcoming || isToday) && (
                              <button className="btn btn-success btn-sm" onClick={() => sendReminder(booking)}>
                                💬 Reminder भेजें
                              </button>
                            )}
                            {(isNoShow || isToday) && (
                              <button className="btn btn-noshow btn-sm" onClick={() => sendNoShow(booking)}>
                                🔄 Follow Up भेजें
                              </button>
                            )}
                          </div>
                        )}
                        {arrived && (
                          <div style={{
                            marginTop: 12, padding: "8px 14px",
                            background: "var(--success-bg)", borderRadius: 8,
                            fontSize: 13, color: "var(--success)", fontWeight: 600, textAlign: "center",
                          }}>
                            ✅ वाहन Service हो गई
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingBookings;
