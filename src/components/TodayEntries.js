import React, { useState, useEffect, useMemo } from "react";

const SERVICE_TYPES = [
  "सामान्य जाँच (General Checkup)",
  "तेल बदलना (Oil Change)",
  "UREA Refill",
  "टायर सर्विस (Tyre Service)",
  "ब्रेक सर्विस (Brake Service)",
  "इंजन सर्विस (Engine Service)",
  "AC सर्विस (AC Service)",
  "ग्रीसिंग (Greasing)",
  "पूर्ण सर्विस (Full Service)",
  "अन्य (Other)",
];

const TodayEntries = ({ allLeads, allWorks, allBookings }) => {
  const [viewType, setViewType] = useState("lead");

  // ── Shared ──
  const [dateFrom, setDateFrom] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ── Lead filters ──
  const [leadCompany, setLeadCompany] = useState("");
  const [leadUpcomingWork, setLeadUpcomingWork] = useState("");
  const [leadSort, setLeadSort] = useState("newest");

  // ── Work filters ──
  const [workType, setWorkType] = useState("");
  const [workMinBill, setWorkMinBill] = useState("");
  const [workMaxBill, setWorkMaxBill] = useState("");
  const [workSort, setWorkSort] = useState("newest");

  // ── Booking filters ──
  const [bookingService, setBookingService] = useState("");
  const [bookingStatus, setBookingStatus] = useState("all");
  const [bookingSort, setBookingSort] = useState("asc");

  const todayISO = new Date().toISOString().split("T")[0];

  useEffect(() => {
    setDateFrom(todayISO);
  }, []);

  const resetFilters = () => {
    setSearchTerm("");
    setDateFrom(todayISO);
    setLeadCompany("");
    setLeadUpcomingWork("");
    setLeadSort("newest");
    setWorkType("");
    setWorkMinBill("");
    setWorkMaxBill("");
    setWorkSort("newest");
    setBookingService("");
    setBookingStatus("all");
    setBookingSort("asc");
  };

  const handleTabChange = (tab) => {
    setViewType(tab);
    resetFilters();
  };

  // ── Date parser ──
  const parseSheetDate = (ts) => {
    if (!ts) return null;
    try {
      if (String(ts).includes("T") && String(ts).includes("Z")) {
        const d = new Date(ts);
        return isNaN(d.getTime()) ? null : d;
      }
      const [datePart, timePart] = String(ts).split(" ");
      const [dd, mm, yyyy] = datePart.split("-");
      const [hh = 0, min = 0, ss = 0] = (timePart || "0:0:0").split(":");
      const d = new Date(yyyy, mm - 1, dd, hh, min, ss);
      return isNaN(d.getTime()) ? null : d;
    } catch { return null; }
  };

  const formatTimestamp = (ts) => {
    const date = parseSheetDate(ts);
    if (!date) return "";
    return date.toLocaleString("hi-IN", {
      hour: "2-digit", minute: "2-digit",
      day: "2-digit", month: "short", year: "numeric", hour12: true,
    });
  };

  const formatDisplayDate = (ts) => {
    const d = parseSheetDate(ts);
    if (!d) return String(ts || "—").split("T")[0];
    return d.toLocaleString("hi-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatDisplayTime = (ts) => {
    if (!ts) return "—";
    if (!String(ts).includes("T")) return ts;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString("hi-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const sendWhatsApp = (number, vehicleNumber) => {
    if (!number) return;
    const phone = String(number).trim();
    const finalNumber = phone.startsWith("0") ? "+91" + phone.substring(1)
      : phone.startsWith("+91") ? phone : "+91" + phone;
    const message =
      `आपके वाहन ${vehicleNumber} के लिए Sai Autotech - TATA Authorised Service Station | Commercial Vehicles में फ्री जनरल चेकअप उपलब्ध है।\n\n` +
      `UREA भरवाने पर पॉइंट्स मिलेंगे और निप्पल ग्रीसिंग ₹150 में कराई जा सकती है।\n\n` +
      `आसान लोकेशन के लिए देखें: https://maps.app.goo.gl/Ru4zf19JUpknN2yr5\n\nसमय निकालकर लाभ अवश्य उठाएं।`;
    window.open(`https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  // ── Filtered Leads ──
  const filteredLeads = useMemo(() => {
    let list = [...allLeads];

    if (dateFrom) {
      list = list.filter(e => {
        const d = parseSheetDate(e.timestamp);
        return d ? d.toISOString().split("T")[0] === dateFrom : false;
      });
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(e => String(e.name || "").toLowerCase().includes(s));
    }
    if (leadCompany) {
      const s = leadCompany.toLowerCase();
      list = list.filter(e => String(e.companyName || "").toLowerCase().includes(s));
    }
    if (leadUpcomingWork) {
      const s = leadUpcomingWork.toLowerCase();
      list = list.filter(e => String(e.upcomingWork || "").toLowerCase().includes(s));
    }

    list.sort((a, b) => {
      const ta = parseSheetDate(a.timestamp)?.getTime() || 0;
      const tb = parseSheetDate(b.timestamp)?.getTime() || 0;
      return leadSort === "newest" ? tb - ta : ta - tb;
    });
    return list;
  }, [allLeads, dateFrom, searchTerm, leadCompany, leadUpcomingWork, leadSort]);

  // ── Filtered Works ──
  const filteredWorks = useMemo(() => {
    let list = [...allWorks];

    if (dateFrom) {
      list = list.filter(e => {
        const d = parseSheetDate(e.timestamp || e.Timestamp);
        return d ? d.toISOString().split("T")[0] === dateFrom : false;
      });
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(e =>
        String(e.vehicleNumber || e["Vehicle Number"] || "").toLowerCase().includes(s)
      );
    }
    if (workType) {
      const s = workType.toLowerCase();
      list = list.filter(e =>
        String(e.workDone || e["Work Done"] || "").toLowerCase().includes(s)
      );
    }
    if (workMinBill !== "") {
      list = list.filter(e => parseFloat(e.totalBill || e["Total Bill"] || 0) >= parseFloat(workMinBill));
    }
    if (workMaxBill !== "") {
      list = list.filter(e => parseFloat(e.totalBill || e["Total Bill"] || 0) <= parseFloat(workMaxBill));
    }

    list.sort((a, b) => {
      if (workSort === "bill_high") return parseFloat(b.totalBill || b["Total Bill"] || 0) - parseFloat(a.totalBill || a["Total Bill"] || 0);
      if (workSort === "bill_low") return parseFloat(a.totalBill || a["Total Bill"] || 0) - parseFloat(b.totalBill || b["Total Bill"] || 0);
      const ta = parseSheetDate(a.timestamp || a.Timestamp)?.getTime() || 0;
      const tb = parseSheetDate(b.timestamp || b.Timestamp)?.getTime() || 0;
      return workSort === "newest" ? tb - ta : ta - tb;
    });
    return list;
  }, [allWorks, dateFrom, searchTerm, workType, workMinBill, workMaxBill, workSort]);

  // ── Filtered Bookings ──
  const filteredBookings = useMemo(() => {
    let list = [...allBookings];

    if (bookingStatus === "today") {
      list = list.filter(b => (b.preferredDate || b["Preferred Date"] || "") === todayISO);
    } else if (bookingStatus === "upcoming") {
      list = list.filter(b => (b.preferredDate || b["Preferred Date"] || "") > todayISO);
    } else if (bookingStatus === "past") {
      list = list.filter(b => (b.preferredDate || b["Preferred Date"] || "") < todayISO);
    } else if (dateFrom) {
      list = list.filter(b => (b.preferredDate || b["Preferred Date"] || "") === dateFrom);
    }

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(b =>
        String(b.customerName || b["Customer Name"] || "").toLowerCase().includes(s) ||
        String(b.vehicleNumber || b["Vehicle Number"] || "").toLowerCase().includes(s)
      );
    }
    if (bookingService) {
      list = list.filter(b =>
        (b.serviceType || b["Service Type"] || "") === bookingService
      );
    }

    list.sort((a, b) => {
      const da = (a.preferredDate || "") + (a.preferredTime || "");
      const db = (b.preferredDate || "") + (b.preferredTime || "");
      return bookingSort === "asc" ? da.localeCompare(db) : db.localeCompare(da);
    });
    return list;
  }, [allBookings, dateFrom, searchTerm, bookingService, bookingStatus, bookingSort, todayISO]);

  const filteredEntries = viewType === "lead" ? filteredLeads
    : viewType === "work" ? filteredWorks
    : filteredBookings;

  // ── Revenue ──
  const now = new Date();
  const filteredRevenue = viewType === "work"
    ? filteredWorks.reduce((sum, e) => sum + (parseFloat(e.totalBill || e["Total Bill"]) || 0), 0) : 0;

  const monthRevenue = viewType === "work"
    ? allWorks.reduce((sum, e) => {
        const d = parseSheetDate(e.timestamp || e.Timestamp);
        if (!d || d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return sum;
        return sum + (parseFloat(e.totalBill || e["Total Bill"]) || 0);
      }, 0) : 0;

  // ── Active filter count ──
  const activeCount = [
    searchTerm,
    viewType === "lead" && leadCompany,
    viewType === "lead" && leadUpcomingWork,
    viewType === "lead" && leadSort !== "newest",
    viewType === "work" && workType,
    viewType === "work" && workMinBill,
    viewType === "work" && workMaxBill,
    viewType === "work" && workSort !== "newest",
    viewType === "booking" && bookingService,
    viewType === "booking" && bookingStatus !== "all",
    viewType === "booking" && bookingSort !== "asc",
  ].filter(Boolean).length;

  // ── Booking status badge ──
  const getStatusBadge = (b) => {
    const date = b.preferredDate || b["Preferred Date"] || "";
    if (date < todayISO) return { label: "Past", color: "var(--text-muted)", bg: "var(--bg-elevated)" };
    if (date === todayISO) return { label: "आज", color: "var(--warning)", bg: "var(--warning-bg)" };
    return { label: "Upcoming", color: "var(--tata-blue-light)", bg: "var(--accent-light)" };
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Page Title */}
      <div className="section-header">
        <h1 className="section-title">📋 Entries</h1>
        <span style={{
          fontSize: 13, color: "var(--text-secondary)",
          background: "var(--bg-elevated)", padding: "4px 12px",
          borderRadius: 20, fontWeight: 600,
        }}>
          {filteredEntries.length} records
        </span>
      </div>

      {/* Toggle Tabs */}
      <div className="toggle-tabs">
        <button className={`toggle-tab ${viewType === "lead" ? "active" : ""}`} onClick={() => handleTabChange("lead")}>
          📝 Leads
        </button>
        <button className={`toggle-tab ${viewType === "work" ? "active" : ""}`} onClick={() => handleTabChange("work")}>
          🔧 Work
        </button>
        <button className={`toggle-tab ${viewType === "booking" ? "active" : ""}`} onClick={() => handleTabChange("booking")}>
          📅 Bookings
        </button>
      </div>

      {/* ══════════ FILTER PANEL ══════════ */}
      <div className="filter-panel">
        <div className="filter-panel-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>🔍 Filters</span>
            {activeCount > 0 && (
              <span className="filter-active-badge">{activeCount} active</span>
            )}
          </div>
          {activeCount > 0 && (
            <button className="filter-reset-btn" onClick={resetFilters}>
              ✕ Reset All
            </button>
          )}
        </div>

        {/* ── LEAD FILTERS (5 features) ── */}
        {viewType === "lead" && (
          <>
            <div className="fp-label-bar">
              <span>📝 Lead Filters — नाम, कंपनी, आगामी कार्य से खोजें</span>
            </div>
            <div className="filter-grid">
              {/* 1. Date */}
              <div className="filter-field">
                <label className="filter-label">📅 तारीख</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="field-input filter-input" />
                {dateFrom && <button className="filter-chip-clear" onClick={() => setDateFrom("")}>✕ Clear</button>}
              </div>

              {/* 2. Name Search */}
              <div className="filter-field">
                <label className="filter-label">👤 नाम से खोजें</label>
                <input type="text" placeholder="ग्राहक का नाम लिखें..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="field-input filter-input" />
                {searchTerm && <button className="filter-chip-clear" onClick={() => setSearchTerm("")}>✕ Clear</button>}
              </div>

              {/* 3. Company Filter */}
              <div className="filter-field">
                <label className="filter-label">🏢 कंपनी का नाम</label>
                <input type="text" placeholder="कंपनी से filter करें..." value={leadCompany} onChange={e => setLeadCompany(e.target.value)} className="field-input filter-input" />
                {leadCompany && <button className="filter-chip-clear" onClick={() => setLeadCompany("")}>✕ Clear</button>}
              </div>

              {/* 4. Upcoming Work */}
              <div className="filter-field">
                <label className="filter-label">🔧 आगामी कार्य</label>
                <input type="text" placeholder="जैसे: Oil Change, UREA..." value={leadUpcomingWork} onChange={e => setLeadUpcomingWork(e.target.value)} className="field-input filter-input" />
                {leadUpcomingWork && <button className="filter-chip-clear" onClick={() => setLeadUpcomingWork("")}>✕ Clear</button>}
              </div>

              {/* 5. Sort Order */}
              <div className="filter-field filter-field-full">
                <label className="filter-label">↕️ क्रम (Sort Order)</label>
                <div className="sort-btn-group">
                  <button className={`sort-btn ${leadSort === "newest" ? "active" : ""}`} onClick={() => setLeadSort("newest")}>🆕 नया पहले</button>
                  <button className={`sort-btn ${leadSort === "oldest" ? "active" : ""}`} onClick={() => setLeadSort("oldest")}>📅 पुराना पहले</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── WORK FILTERS (5 features) ── */}
        {viewType === "work" && (
          <>
            <div className="fp-label-bar">
              <span>🔧 Work Filters — वाहन, कार्य प्रकार, बिल रेंज से खोजें</span>
            </div>
            <div className="filter-grid">
              {/* 1. Date */}
              <div className="filter-field">
                <label className="filter-label">📅 तारीख</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="field-input filter-input" />
                {dateFrom && <button className="filter-chip-clear" onClick={() => setDateFrom("")}>✕ Clear</button>}
              </div>

              {/* 2. Vehicle Search */}
              <div className="filter-field">
                <label className="filter-label">🚛 वाहन नंबर</label>
                <input type="text" placeholder="Vehicle Number..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="field-input filter-input" />
                {searchTerm && <button className="filter-chip-clear" onClick={() => setSearchTerm("")}>✕ Clear</button>}
              </div>

              {/* 3. Work Type */}
              <div className="filter-field filter-field-full">
                <label className="filter-label">🔧 कार्य प्रकार (Work Type)</label>
                <input type="text" placeholder="जैसे: Oil Change, Tyre, Greasing..." value={workType} onChange={e => setWorkType(e.target.value)} className="field-input filter-input" />
                {workType && <button className="filter-chip-clear" onClick={() => setWorkType("")}>✕ Clear</button>}
              </div>

              {/* 4. Bill Range */}
              <div className="filter-field">
                <label className="filter-label">💰 Min बिल (₹)</label>
                <input type="number" placeholder="जैसे: 500" value={workMinBill} onChange={e => setWorkMinBill(e.target.value)} className="field-input filter-input" min="0" />
                {workMinBill && <button className="filter-chip-clear" onClick={() => setWorkMinBill("")}>✕ Clear</button>}
              </div>

              <div className="filter-field">
                <label className="filter-label">💰 Max बिल (₹)</label>
                <input type="number" placeholder="जैसे: 5000" value={workMaxBill} onChange={e => setWorkMaxBill(e.target.value)} className="field-input filter-input" min="0" />
                {workMaxBill && <button className="filter-chip-clear" onClick={() => setWorkMaxBill("")}>✕ Clear</button>}
              </div>

              {/* 5. Sort */}
              <div className="filter-field filter-field-full">
                <label className="filter-label">↕️ क्रम (Sort Order)</label>
                <div className="sort-btn-group">
                  <button className={`sort-btn ${workSort === "newest" ? "active" : ""}`} onClick={() => setWorkSort("newest")}>🆕 नया पहले</button>
                  <button className={`sort-btn ${workSort === "oldest" ? "active" : ""}`} onClick={() => setWorkSort("oldest")}>📅 पुराना पहले</button>
                  <button className={`sort-btn ${workSort === "bill_high" ? "active" : ""}`} onClick={() => setWorkSort("bill_high")}>💰 बिल ↓</button>
                  <button className={`sort-btn ${workSort === "bill_low" ? "active" : ""}`} onClick={() => setWorkSort("bill_low")}>💰 बिल ↑</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── BOOKING FILTERS (5 features) ── */}
        {viewType === "booking" && (
          <>
            <div className="fp-label-bar">
              <span>📅 Booking Filters — स्थिति, सेवा, तारीख से खोजें</span>
            </div>
            <div className="filter-grid">
              {/* 1. Status */}
              <div className="filter-field filter-field-full">
                <label className="filter-label">📊 Booking स्थिति (Status)</label>
                <div className="sort-btn-group">
                  <button className={`sort-btn ${bookingStatus === "all" ? "active" : ""}`} onClick={() => setBookingStatus("all")}>📋 सभी</button>
                  <button className={`sort-btn ${bookingStatus === "today" ? "active" : ""}`} onClick={() => setBookingStatus("today")}>🌟 आज</button>
                  <button className={`sort-btn ${bookingStatus === "upcoming" ? "active" : ""}`} onClick={() => setBookingStatus("upcoming")}>⏳ Upcoming</button>
                  <button className={`sort-btn ${bookingStatus === "past" ? "active" : ""}`} onClick={() => setBookingStatus("past")}>📁 पुरानी</button>
                </div>
              </div>

              {/* 2. Date (only when "all") */}
              {bookingStatus === "all" && (
                <div className="filter-field filter-field-full">
                  <label className="filter-label">📅 Appointment तारीख</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="field-input filter-input" />
                  {dateFrom && <button className="filter-chip-clear" onClick={() => setDateFrom("")}>✕ Clear</button>}
                </div>
              )}

              {/* 3. Name / Vehicle Search */}
              <div className="filter-field">
                <label className="filter-label">🔍 नाम / वाहन नंबर</label>
                <input type="text" placeholder="ग्राहक या वाहन..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="field-input filter-input" />
                {searchTerm && <button className="filter-chip-clear" onClick={() => setSearchTerm("")}>✕ Clear</button>}
              </div>

              {/* 4. Service Type */}
              <div className="filter-field">
                <label className="filter-label">🔧 सेवा प्रकार</label>
                <select value={bookingService} onChange={e => setBookingService(e.target.value)} className="field-input filter-input">
                  <option value="">सभी सेवाएं</option>
                  {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {bookingService && <button className="filter-chip-clear" onClick={() => setBookingService("")}>✕ Clear</button>}
              </div>

              {/* 5. Sort by appointment date */}
              <div className="filter-field filter-field-full">
                <label className="filter-label">↕️ Appointment क्रम</label>
                <div className="sort-btn-group">
                  <button className={`sort-btn ${bookingSort === "asc" ? "active" : ""}`} onClick={() => setBookingSort("asc")}>📅 पहले → बाद</button>
                  <button className={`sort-btn ${bookingSort === "desc" ? "active" : ""}`} onClick={() => setBookingSort("desc")}>📅 बाद → पहले</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══════════ ENTRIES LIST ══════════ */}
      {filteredEntries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>कोई डेटा नहीं मिला</p>
          {activeCount > 0 && (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 14, width: "auto" }} onClick={resetFilters}>
              ✕ Filters Reset करें
            </button>
          )}
        </div>
      ) : (
        <div className="entries-list">
          {filteredEntries.map((entry, index) => (
            <div key={index} className="entry-card">
              <div className="entry-header">
                <span className="entry-badge">#{index + 1}</span>
                <span className="entry-time">
                  {viewType !== "booking"
                    ? formatTimestamp(entry.timestamp || entry.Timestamp)
                    : formatTimestamp(entry.timestamp || entry.Timestamp)}
                </span>
              </div>

              {/* ── LEAD CARD ── */}
              {viewType === "lead" && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">👤 नाम</span>
                    <span className="detail-value">{entry.name || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🚛 वाहन नंबर</span>
                    <span className="detail-value" style={{ fontFamily: "monospace", letterSpacing: 1 }}>{entry.vehicleNumber || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🎫 टोकन नंबर</span>
                    <span className="detail-value">{entry.tokenNumber || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📞 संपर्क नंबर</span>
                    <span className="detail-value">{entry.contactNumber || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🏢 कंपनी</span>
                    <span className="detail-value">{entry.companyName || "—"}</span>
                  </div>
                  {entry.upcomingWork && (
                    <div className="detail-row">
                      <span className="detail-label">🔧 आगामी कार्य</span>
                      <span className="detail-value" style={{ color: "var(--warning)" }}>{entry.upcomingWork}</span>
                    </div>
                  )}
                  <button className="btn btn-success btn-sm" style={{ marginTop: 14, width: "100%" }}
                    onClick={() => sendWhatsApp(entry.contactNumber, entry.vehicleNumber)}>
                    💬 WhatsApp भेजें
                  </button>
                </>
              )}

              {/* ── WORK CARD ── */}
              {viewType === "work" && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">🚛 वाहन नंबर</span>
                    <span className="detail-value" style={{ fontFamily: "monospace", letterSpacing: 1 }}>
                      {entry.vehicleNumber || entry["Vehicle Number"] || "—"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🔧 किया गया काम</span>
                    <span className="detail-value">{entry.workDone || entry["Work Done"] || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🔩 Parts Cost</span>
                    <span className="detail-value">₹{entry.partsCost || entry["Parts Cost"] || "0"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">👷 Labour Cost</span>
                    <span className="detail-value">₹{entry.labourCost || entry["Labour Cost"] || "0"}</span>
                  </div>
                  <div className="detail-row" style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                    <span className="detail-label" style={{ color: "var(--success)", fontWeight: 700 }}>💰 कुल बिल</span>
                    <span className="detail-value" style={{ color: "var(--success)", fontSize: 17, fontWeight: 800 }}>
                      ₹{entry.totalBill || entry["Total Bill"] || "0"}
                    </span>
                  </div>
                  {(entry.remarks || entry["Remarks"]) && (
                    <div className="detail-row">
                      <span className="detail-label">📝 Remarks</span>
                      <span className="detail-value">{entry.remarks || entry["Remarks"]}</span>
                    </div>
                  )}
                </>
              )}

              {/* ── BOOKING CARD ── */}
              {viewType === "booking" && (() => {
                const status = getStatusBadge(entry);
                return (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: "4px 12px",
                        borderRadius: 20, color: status.color, background: status.bg,
                      }}>
                        {status.label}
                      </span>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--tata-blue-light)" }}>
                          📅 {entry.preferredDate || entry["Preferred Date"] || "—"}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          ⏰ {entry.preferredTime || entry["Preferred Time"] || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">👤 ग्राहक</span>
                      <span className="detail-value">{entry.customerName || entry["Customer Name"] || "—"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">🏢 कंपनी</span>
                      <span className="detail-value">{entry.companyName || entry["Company Name"] || "—"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">🚛 वाहन नंबर</span>
                      <span className="detail-value" style={{ fontFamily: "monospace", letterSpacing: 1 }}>
                        {entry.vehicleNumber || entry["Vehicle Number"] || "—"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">📞 संपर्क</span>
                      <span className="detail-value">{entry.contactNumber || entry["Contact Number"] || "—"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">🔧 सेवा</span>
                      <span className="detail-value">{entry.serviceType || entry["Service Type"] || "—"}</span>
                    </div>
                    {(entry.notes || entry["Notes"]) && (
                      <div style={{
                        background: "var(--bg-elevated)", borderRadius: 8, padding: "8px 12px",
                        fontSize: 13, color: "var(--text-secondary)", marginTop: 10,
                      }}>
                        📝 {entry.notes || entry["Notes"]}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      )}

      {/* Revenue Summary */}
      {viewType === "work" && filteredEntries.length > 0 && (
        <div className="revenue-box">
          <div className="revenue-item">
            <div className="revenue-amount">₹{filteredRevenue.toLocaleString("en-IN")}</div>
            <div className="revenue-label">Filter का Revenue</div>
          </div>
          <div className="revenue-item">
            <div className="revenue-amount">₹{monthRevenue.toLocaleString("en-IN")}</div>
            <div className="revenue-label">इस महीने का Revenue</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayEntries;
