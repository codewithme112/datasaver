import React, { useState, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { GOOGLE_SCRIPT_URL } from "../config";

const CustomerLeadForm = ({ allLeads, fetchLeads }) => {
  const initialForm = {
    tokenNumber: "",
    name: "",
    vehicleNumber: "",
    contactNumber: "",
    companyName: "",
    totalVehicle: "",
    ownerManager: "",
    officeLocation: "",
    upcomingWork: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const isSubmitting = useRef(false);

  // ── Stats from props ──
  const stats = useMemo(() => {
    const todayISO = new Date().toISOString().split("T")[0];
    const todayEntries = allLeads.filter((entry) => {
      if (!entry.timestamp) return false;
      return new Date(entry.timestamp).toISOString().split("T")[0] === todayISO;
    }).length;
    return { totalEntries: allLeads.length, todayEntries };
  }, [allLeads]);

  const hindiLabels = {
    tokenNumber: "टोकन नंबर",
    name: "नाम",
    vehicleNumber: "वाहन नंबर",
    contactNumber: "संपर्क नंबर",
    companyName: "कंपनी का नाम",
    totalVehicle: "कुल वाहन",
    ownerManager: "मालिक / प्रबंधक",
    officeLocation: "कार्यालय स्थान",
    upcomingWork: "आगामी कार्य",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "contactNumber" && !/^\d{0,10}$/.test(value)) return;
    if (name === "name" && !/^[a-zA-Z\u0900-\u097F\s]*$/.test(value)) return;
    if (name === "vehicleNumber" && !/^[A-Z0-9]*$/i.test(value)) return;
    if (name === "tokenNumber" && !/^\d{0,5}$/.test(value)) return;
    if (name === "totalVehicle" && !/^\d{0,7}$/.test(value)) return;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "vehicleNumber" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;

    // ── Validation ──
    if (formData.name.trim() === "") {
      toast.error("नाम आवश्यक है।");
      return;
    }
    if (formData.contactNumber.length !== 10) {
      toast.error("संपर्क नंबर 10 अंकों का होना चाहिए।");
      return;
    }

    isSubmitting.current = true;
    setIsLoading(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({ type: "lead", ...formData }),
      });

      toast.success("✅ डेटा सफलतापूर्वक सबमिट किया गया!");
      setFormData(initialForm);
      setTimeout(() => fetchLeads(), 1000);
    } catch (err) {
      toast.error("❌ Submit failed. Please try again.");
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="form-container">
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-number">{stats.totalEntries}</div>
          <div className="stat-label">कुल एंट्रीज</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌟</div>
          <div className="stat-number">{stats.todayEntries}</div>
          <div className="stat-label">आज की एंट्रीज</div>
        </div>
      </div>

      <div className="card">
        <h2 className="form-title">📝 ग्राहक लीड फॉर्म</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="field-group">
              <label className="field-label">{hindiLabels[key]}</label>
              <input
                type="text"
                name={key}
                value={value}
                onChange={handleChange}
                required
                className="field-input"
                placeholder={`${hindiLabels[key]} दर्ज करें`}
                disabled={isLoading}
              />
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

export default CustomerLeadForm;
