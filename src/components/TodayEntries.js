import React, { useState, useEffect } from "react";

const TodayEntries = ({ allLeads, allWorks, onBack }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState("lead"); // Default: Leads

  // ✅ Set default selected date (today)
  useEffect(() => {
    const todayISO = new Date().toISOString().split("T")[0];
    setSelectedDate(todayISO);
  }, []);

  // 🔹 Safe parse (ISO + DD-MM-YYYY support)
  const parseSheetDate = (ts) => {
    if (!ts) return null;
    try {
      if (ts.includes("T") && ts.includes("Z")) {
        const dateObj = new Date(ts);
        return isNaN(dateObj.getTime()) ? null : dateObj;
      }
      const [datePart, timePart] = ts.split(" ");
      const [dd, mm, yyyy] = datePart.split("-");
      const [hh = 0, min = 0, ss = 0] = (timePart || "0:0:0").split(":");
      const dateObj = new Date(yyyy, mm - 1, dd, hh, min, ss);
      return isNaN(dateObj.getTime()) ? null : dateObj;
    } catch {
      return null;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = parseSheetDate(timestamp);
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

  // ✅ WhatsApp Function (Leads Only)
  const sendWhatsApp = (number, vehicleNumber) => {
    if (!number) return;

    const phone = String(number).trim();
    let finalNumber = phone;
    if (phone.startsWith("0")) {
      finalNumber = "+91" + phone.substring(1);
    } else if (!phone.startsWith("+91")) {
      finalNumber = "+91" + phone;
    }

    const message = `आपके वाहन ${vehicleNumber} के लिए Sai Autotech - TATA Authorised Service Station | Commercial Vehicles में फ्री जनरल चेकअप उपलब्ध है।\n\nUREA भरवाने पर पॉइंट्स मिलेंगे और निप्पल ग्रीसिंग ₹150 में कराई जा सकती है।\n\nआसान लोकेशन के लिए देखें: https://maps.app.goo.gl/Ru4zf19JUpknN2yr5\n\nसमय निकालकर लाभ अवश्य उठाएं।`;

    const url = `https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // ✅ Filtered Entries (Date + Search)
  const entries = viewType === "lead" ? allLeads : allWorks;

  const filteredEntries = entries.filter((entry) => {
    const entryDateObj = parseSheetDate(entry.timestamp || entry.Timestamp);
    if (!entryDateObj) return false;

    const entryDateISO = entryDateObj.toISOString().split("T")[0];

    const matchesDate = searchTerm
      ? true
      : selectedDate
      ? entryDateISO === selectedDate
      : true;

    const search = searchTerm.toLowerCase();

    const matchesName =
      viewType === "lead"
        ? String(entry.name || "").toLowerCase().includes(search)
        : String(entry.vehicleNumber || entry["Vehicle Number"] || "")
            .toLowerCase()
            .includes(search);

    return matchesDate && matchesName;
  });

  // ✅ Revenue Calculation (Work Only)
  const todayRevenue =
    viewType === "work"
      ? filteredEntries.reduce(
          (sum, e) => sum + (parseFloat(e.totalBill || e["Total Bill"]) || 0),
          0
        )
      : 0;

  const monthRevenue =
    viewType === "work"
      ? entries.reduce((sum, e) => {
          const dateObj = parseSheetDate(e.timestamp || e.Timestamp);
          if (!dateObj) return sum;
          const now = new Date();
          if (
            dateObj.getMonth() === now.getMonth() &&
            dateObj.getFullYear() === now.getFullYear()
          ) {
            return sum + (parseFloat(e.totalBill || e["Total Bill"]) || 0);
          }
          return sum;
        }, 0)
      : 0;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>एंट्रीज</h2>

      {onBack && (
        <button onClick={onBack} style={styles.backButton}>
          ← वापस फॉर्म पर जाएं
        </button>
      )}

      {/* Toggle Lead/Work */}
      <div style={styles.toggleContainer}>
        <label>
          <input
            type="radio"
            name="viewType"
            value="lead"
            checked={viewType === "lead"}
            onChange={(e) => setViewType(e.target.value)}
          />
          Leads
        </label>
        <label>
          <input
            type="radio"
            name="viewType"
            value="work"
            checked={viewType === "work"}
            onChange={(e) => setViewType(e.target.value)}
          />
          Work
        </label>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: "8px", flex: 1 }}
        />
        <input
          type="text"
          placeholder={viewType === "lead" ? "नाम से खोजें" : "वाहन नंबर से खोजें"}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "8px", flex: 1 }}
        />
      </div>

      {filteredEntries.length === 0 ? (
        <div style={styles.empty}>कोई डेटा नहीं मिला</div>
      ) : (
        <div style={styles.entriesList}>
          {filteredEntries.map((entry, index) => (
            <div key={index} style={styles.entryCard}>
              <div style={styles.entryHeader}>
                <span style={styles.entryNumber}>#{index + 1}</span>
                <span style={styles.entryTime}>
                  {formatTimestamp(entry.timestamp || entry.Timestamp)}
                </span>
              </div>

              {viewType === "lead" ? (
                <>
                  <div style={styles.detailRow}>
                    <span style={styles.label}>नाम:</span>
                    <span style={styles.value}>{entry.name}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.label}>वाहन नंबर:</span>
                    <span style={styles.value}>{entry.vehicleNumber}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.label}>टोकन नंबर:</span>
                    <span style={styles.value}>{entry.tokenNumber}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.label}>संपर्क नंबर:</span>
                    <span style={styles.value}>{entry.contactNumber}</span>
                  </div>

                  {/* ✅ WhatsApp Button for Leads */}
                  <button
                    style={styles.whatsappButton}
                    onClick={() => sendWhatsApp(entry.contactNumber, entry.vehicleNumber)}
                  >
                    WhatsApp भेजें
                  </button>
                </>
              ) : (
                <>
                  <div style={styles.detailRow}>
                    <span style={styles.label}>वाहन नंबर:</span>
                    <span style={styles.value}>
                      {entry.vehicleNumber || entry["Vehicle Number"]}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.label}>काम:</span>
                    <span style={styles.value}>
                      {entry.workDone || entry["Work Done"]}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.label}>Parts Cost:</span>
                    <span style={styles.value}>
                      ₹{entry.partsCost || entry["Parts Cost"]}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.label}>Labour Cost:</span>
                    <span style={styles.value}>
                      ₹{entry.labourCost || entry["Labour Cost"]}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.label}>कुल बिल:</span>
                    <span style={styles.value}>
                      ₹{entry.totalBill || entry["Total Bill"]}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.label}>Remarks:</span>
                    <span style={styles.value}>
                      {entry.remarks || entry["Remarks"]}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Revenue Summary (Work Only) */}
      {viewType === "work" && (
        <div style={styles.revenueBox}>
          <div>आज का कुल Revenue: ₹{todayRevenue}</div>
          <div>इस महीने का कुल Revenue: ₹{monthRevenue}</div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "700px",
    margin: "20px auto",
    fontFamily: "system-ui, sans-serif",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  heading: { textAlign: "center", marginBottom: "24px" },
  backButton: {
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  toggleContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "20px",
    fontSize: "16px",
    fontWeight: "600",
  },
  entriesList: { display: "flex", flexDirection: "column", gap: "15px" },
  entryCard: {
    backgroundColor: "#f8f9fa",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #dee2e6",
  },
  entryHeader: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #dee2e6",
    marginBottom: "10px",
    paddingBottom: "5px",
  },
  entryNumber: { fontWeight: "bold", color: "#007bff" },
  entryTime: { fontSize: "14px", color: "#6c757d" },
  detailRow: { display: "flex", justifyContent: "space-between" },
  label: { fontWeight: "600" },
  value: { color: "#212529" },
  whatsappButton: {
    marginTop: "12px",
    padding: "10px 15px",
    backgroundColor: "#25D366",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  empty: { textAlign: "center", color: "#6c757d", padding: "20px" },
  revenueBox: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#e9f7ef",
    borderRadius: "8px",
    fontWeight: "600",
    color: "#155724",
  },
};

export default TodayEntries;
