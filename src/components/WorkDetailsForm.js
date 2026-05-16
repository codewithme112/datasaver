import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { GOOGLE_SCRIPT_URL } from "../config";

const WorkDetailsForm = ({ allWorks, fetchWorks }) => {
  const initialForm = {
    vehicleNumber: "",
    workDone: "",
    partsCost: "",
    labourCost: "",
    totalBill: "",
    remarks: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [todayEntries, setTodayEntries] = useState(0);

  // ── Recalculate stats when allWorks updates ──
  useEffect(() => {
    if (!Array.isArray(allWorks)) return;
    setTotalEntries(allWorks.length);
    const today = new Date().toISOString().split("T")[0];
    const count = allWorks.filter((e) => {
      const ts = e.timestamp || e.Timestamp;
      if (!ts) return false;
      return new Date(ts).toISOString().split("T")[0] === today;
    }).length;
    setTodayEntries(count);
  }, [allWorks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only digits for cost fields
    if (
      ["partsCost", "labourCost", "totalBill"].includes(name) &&
      !/^\d*$/.test(value)
    )
      return;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-calculate totalBill when parts/labour changes
      if (name === "partsCost" || name === "labourCost") {
        const parts = parseFloat(name === "partsCost" ? value : prev.partsCost) || 0;
        const labour = parseFloat(name === "labourCost" ? value : prev.labourCost) || 0;
        updated.totalBill = (parts + labour).toString();
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;

    if (!formData.vehicleNumber.trim()) {
      toast.error("वाहन नंबर आवश्यक है।");
      return;
    }
    if (!formData.workDone.trim()) {
      toast.error("किया गया कार्य आवश्यक है।");
      return;
    }

    isSubmitting.current = true;
    setIsLoading(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({ type: "work", ...formData }),
      });

      toast.success("✅ वर्क डिटेल्स सफलतापूर्वक सेव हो गईं!");
      setFormData(initialForm);
      fetchWorks();
    } catch (err) {
      toast.error("❌ Submit failed. Please try again.");
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  const hindiLabels = {
    vehicleNumber: "वाहन नंबर",
    workDone: "किया गया कार्य",
    partsCost: "पार्ट्स लागत (₹)",
    labourCost: "लेबर लागत (₹)",
    totalBill: "कुल बिल (₹)",
    remarks: "टिप्पणी",
  };

  return (
    <div className="form-container">
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon">🔧</div>
          <div className="stat-number">{totalEntries}</div>
          <div className="stat-label">कुल एंट्रीज़</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-number">{todayEntries}</div>
          <div className="stat-label">आज की एंट्रीज़</div>
        </div>
      </div>

      <div className="card">
        <h2 className="form-title">🔧 वर्क डिटेल्स फॉर्म</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="field-group">
              <label className="field-label">{hindiLabels[key]}</label>
              <input
                type="text"
                name={key}
                value={value}
                onChange={handleChange}
                required={key !== "remarks"}
                className="field-input"
                placeholder={`${hindiLabels[key]} दर्ज करें`}
                disabled={isLoading || key === "totalBill"}
                style={
                  key === "totalBill"
                    ? { opacity: 0.75, cursor: "not-allowed" }
                    : {}
                }
              />
              {key === "totalBill" && (
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
                  Auto-calculated from Parts + Labour
                </span>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ marginTop: 8 }}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                सबमिट हो रहा है...
              </>
            ) : (
              "जमा करें"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkDetailsForm;
