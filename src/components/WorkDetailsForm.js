import React, { useState, useEffect } from "react";

const WorkDetailsForm = ({ allWorks, fetchWorks, onBack }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    workDone: "",
    partsCost: "",
    labourCost: "",
    totalBill: "",
    remarks: "",
  });

  const [totalEntries, setTotalEntries] = useState(0);
  const [todayEntries, setTodayEntries] = useState(0);

  // 🔹 Whenever allWorks update → recalc counts
  useEffect(() => {
    if (!Array.isArray(allWorks)) return;

    setTotalEntries(allWorks.length);

    const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
    const todayData = allWorks.filter((entry) => {
      const ts = entry.timestamp || entry.Timestamp;
      if (!ts) return false;
      const entryDate = new Date(ts).toISOString().split("T")[0];
      return entryDate === today;
    });

    setTodayEntries(todayData.length);
  }, [allWorks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      (name === "partsCost" || name === "labourCost" || name === "totalBill") &&
      !/^\d*$/.test(value)
    ) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(
      "https://script.google.com/macros/s/AKfycbwjcrTiR1VW3beteqx-b7VcURACWHpfsqyerPdvZ2yzIXq1_w7R1n0DRAa3qYupXx9S/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          type: "work",
          ...formData,
        }),
      }
    );

    alert("वर्क डिटेल्स सफलतापूर्वक सेव हो गईं ✅");

    setFormData({
      vehicleNumber: "",
      workDone: "",
      partsCost: "",
      labourCost: "",
      totalBill: "",
      remarks: "",
    });

    // नया entry update करने के लिए सिर्फ props से मिली function call करेंगे
    fetchWorks();
  };

  const hindiLabels = {
    vehicleNumber: "वाहन नंबर",
    workDone: "किया गया कार्य",
    partsCost: "पार्ट्स लागत",
    labourCost: "लेबर लागत",
    totalBill: "कुल बिल",
    remarks: "टिप्पणी",
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>वर्क डिटेल्स फॉर्म</h2>

      {/* कुल और आज की एंट्रीज */}
      <div style={styles.statsBox}>
        <p>
          कुल एंट्रीज़: <strong>{totalEntries}</strong>
        </p>
        <p>
          आज की एंट्रीज़: <strong>{todayEntries}</strong>
        </p>
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
              required={key !== "remarks"}
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
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "24px",
    color: "#333",
    fontSize: "24px",
    fontWeight: "600",
  },
  statsBox: {
    background: "#f8f9fa",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "500",
  },
  backButton: {
    width: "100%",
    padding: "10px",
    fontSize: "15px",
    fontWeight: "600",
    backgroundColor: "#6c757d",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "6px",
    fontSize: "15px",
    color: "#555",
    fontWeight: "bold",
  },
  input: {
    padding: "10px 12px",
    fontSize: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s",
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
    transition: "background-color 0.3s",
  },
};

export default WorkDetailsForm;
