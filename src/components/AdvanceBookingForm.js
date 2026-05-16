import React, { useState, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { GOOGLE_SCRIPT_URL } from "../config";

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

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM",
];

const AdvanceBookingForm = ({ allBookings, fetchBookings }) => {
  const initialForm = {
    customerName: "",
    contactNumber: "",
    vehicleNumber: "",
    companyName: "",
    serviceType: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const isSubmitting = useRef(false);

  // ── Stats ──
  const stats = useMemo(() => {
    const d = new Date();
    // Local date as YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const todayISO = `${yyyy}-${mm}-${dd}`;
    const todayDDMMYYYY = `${dd}-${mm}-${yyyy}`;

    const upcoming = allBookings.filter((b) => {
      const prefDate = b.preferredDate || b["Preferred Date"] || "";
      return prefDate >= todayISO;
    }).length;

    const todayBookings = allBookings.filter((b) => {
      const ts = String(b.timestamp || b.Timestamp || "");
      // matches DD-MM-YYYY or YYYY-MM-DD
      return ts.startsWith(todayDDMMYYYY) || ts.includes(todayISO);
    }).length;

    return { total: allBookings.length, upcoming, todayBookings };
  }, [allBookings]);

  // ── Min date = today ──
  const todayISO = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "contactNumber" && !/^\d{0,10}$/.test(value)) return;
    if (name === "vehicleNumber" && !/^[A-Z0-9]*$/i.test(value)) return;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "vehicleNumber" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    
    if (formData.customerName.trim() === "") {
      toast.error("ग्राहक का नाम आवश्यक है।");
      return;
    }
    if (formData.contactNumber.length !== 10) {
      toast.error("संपर्क नंबर 10 अंकों का होना चाहिए।");
      return;
    }
    if (!formData.serviceType) {
      toast.error("सेवा का प्रकार चुनें।");
      return;
    }
    if (!formData.preferredDate) {
      toast.error("तारीख चुनें।");
      return;
    }
    if (!formData.preferredTime) {
      toast.error("समय चुनें।");
      return;
    }

    isSubmitting.current = true;
    setIsLoading(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({ type: "booking", ...formData }),
      });
      toast.success("✅ Booking सफलतापूर्वक दर्ज हो गई!");
      setFormData(initialForm);
      setTimeout(() => fetchBookings(), 1000);
    } catch (err) {
      toast.error("❌ Booking failed. Please try again.");
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="form-container">
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">कुल Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-number" style={{ color: "var(--warning)" }}>
            {stats.upcoming}
          </div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌟</div>
          <div className="stat-number">{stats.todayBookings}</div>
          <div className="stat-label">आज की Bookings</div>
        </div>
      </div>

      <div className="card">
        <h2 className="form-title">📅 Advance Booking</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          {/* Customer Name */}
          <div className="field-group">
            <label className="field-label">ग्राहक का नाम</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              className="field-input"
              placeholder="ग्राहक का नाम दर्ज करें"
              disabled={isLoading}
            />
          </div>

          {/* Contact */}
          <div className="field-group">
            <label className="field-label">संपर्क नंबर</label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              className="field-input"
              placeholder="10 अंकों का नंबर"
              disabled={isLoading}
            />
          </div>

          {/* Vehicle Number */}
          <div className="field-group">
            <label className="field-label">वाहन नंबर</label>
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              required
              className="field-input"
              placeholder="जैसे: MH12AB1234"
              disabled={isLoading}
            />
          </div>

          {/* Company Name */}
          <div className="field-group">
            <label className="field-label">कंपनी का नाम</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="field-input"
              placeholder="कंपनी का नाम दर्ज करें (Optional)"
              disabled={isLoading}
            />
          </div>

          {/* Service Type */}
          <div className="field-group">
            <label className="field-label">सेवा का प्रकार</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              className="field-input"
              disabled={isLoading}
              style={{ cursor: "pointer" }}
            >
              <option value="">-- सेवा चुनें --</option>
              {SERVICE_TYPES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Date + Time - side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field-group">
              <label className="field-label">पसंदीदा तारीख</label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                required
                min={todayISO}
                className="field-input"
                disabled={isLoading}
              />
            </div>
            <div className="field-group">
              <label className="field-label">पसंदीदा समय</label>
              <select
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                required
                className="field-input"
                disabled={isLoading}
                style={{ cursor: "pointer" }}
              >
                <option value="">-- समय चुनें --</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="field-group">
            <label className="field-label">विशेष नोट्स (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="field-input"
              placeholder="कोई विशेष जानकारी हो तो यहाँ लिखें..."
              rows={3}
              disabled={isLoading}
              style={{ resize: "vertical", lineHeight: 1.5 }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ marginTop: 8 }}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Booking हो रही है...
              </>
            ) : (
              "📅 Booking Confirm करें"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdvanceBookingForm;
