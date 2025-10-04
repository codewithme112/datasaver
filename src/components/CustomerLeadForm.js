import React, { useState, useMemo } from "react";

const CustomerLeadForm = ({ allLeads, fetchLeads }) => {
  const [formData, setFormData] = useState({
    tokenNumber: "",
    name: "",
    vehicleNumber: "",
    contactNumber: "",
    companyName: "",
    totalVehicle: "",
    ownerManager: "",
    officeLocation: "",
    upcomingWork: ""
  });

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwjcrTiR1VW3beteqx-b7VcURACWHpfsqyerPdvZ2yzIXq1_w7R1n0DRAa3qYupXx9S/exec";

  // ✅ Stats calculate from props data
  const stats = useMemo(() => {
  const todayISO = new Date().toISOString().split("T")[0]; // yyyy-MM-dd

  const todayEntries = allLeads.filter((entry) => {
    if (!entry.timestamp) return false;
    const entryISO = new Date(entry.timestamp).toISOString().split("T")[0];
    return entryISO === todayISO;
  }).length;

  return {
    totalEntries: allLeads.length,
    todayEntries
  };
}, [allLeads]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contactNumber" && !/^\d{0,10}$/.test(value)) return;
    if (name === "name" && !/^[a-zA-Z\s]*$/.test(value)) return;
    if (name === "vehicleNumber" && !/^[A-Z0-9]*$/i.test(value)) return;
    if (name === "tokenNumber" && !/^\d{0,5}$/.test(value)) return;
    if (name === "totalVehicle" && !/^\d{0,7}$/.test(value)) return;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "vehicleNumber" ? value.toUpperCase() : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.contactNumber.length !== 10) {
      alert("संपर्क नंबर 10 अंकों का होना चाहिए।");
      return;
    }
    if (formData.name.trim() === "") {
      alert("नाम आवश्यक है।");
      return;
    }

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "no-cors",
      body: JSON.stringify({
        type: "lead",
        ...formData
      })
    });

    alert("डेटा सफलतापूर्वक सबमिट किया गया!");

    setFormData({
      tokenNumber: "",
      name: "",
      vehicleNumber: "",
      contactNumber: "",
      companyName: "",
      totalVehicle: "",
      ownerManager: "",
      officeLocation: "",
      upcomingWork: ""
    });

    // ✅ Refresh leads after submit
    setTimeout(() => fetchLeads(), 1000);
  };

  const hindiLabels = {
    tokenNumber: "टोकन नंबर",
    name: "नाम",
    vehicleNumber: "वाहन नंबर",
    contactNumber: "संपर्क नंबर",
    companyName: "कंपनी का नाम",
    totalVehicle: "कुल वाहन",
    ownerManager: "मालिक/प्रबंधक",
    officeLocation: "कार्यालय स्थान",
    upcomingWork: "आगामी कार्य"
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>ग्राहक लीड फॉर्म</h2>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.totalEntries}</div>
          <div style={styles.statLabel}>कुल एंट्रीज</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.todayEntries}</div>
          <div style={styles.statLabel}>आज की एंट्रीज</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} style={styles.fieldGroup}>
            <label style={styles.label}>{hindiLabels[key]}:</label>
            <input
              type="text"
              name={key}
              value={value}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder={`${hindiLabels[key]} दर्ज करें`}
            />
          </div>
        ))}
        <button type="submit" style={styles.button}>
          जमा करें
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "500px",
    margin: "20px auto",
    fontFamily: "system-ui, sans-serif",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
  },
  heading: {
    textAlign: "center",
    marginBottom: "24px",
    color: "#333",
    fontSize: "24px",
    fontWeight: "600"
  },
  statsGrid: {
    display: "flex",
    justifyContent: "space-around",
    gap: "20px",
    marginBottom: "20px"
  },
  statCard: {
    backgroundColor: "#f8f9fa",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center",
    flex: 1,
    border: "1px solid #dee2e6"
  },
  statNumber: { fontSize: "24px", fontWeight: "bold", color: "#007bff" },
  statLabel: { fontSize: "14px", color: "#6c757d", marginTop: "5px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  fieldGroup: { display: "flex", flexDirection: "column" },
  label: { marginBottom: "6px", fontSize: "15px", color: "#555", fontWeight: "bold" },
  input: {
    padding: "10px 12px",
    fontSize: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s"
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    fontWeight: "600",
    backgroundColor: "#007bff",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s"
  }
};

export default CustomerLeadForm;
