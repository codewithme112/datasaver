import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomerLeadForm from "./components/CustomerLeadForm";
import WorkDetailsForm from "./components/WorkDetailsForm";
import TodayEntries from "./components/TodayEntries";
import Dashboard from "./components/Dashboard";
import AdvanceBookingForm from "./components/AdvanceBookingForm";
import UpcomingBookings from "./components/UpcomingBookings";
import { GOOGLE_SCRIPT_URL } from "./config";

const App = () => {
  const [allLeads, setAllLeads] = useState([]);
  const [allWorks, setAllWorks] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=lead`);
      const data = await res.json();
      setAllLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    }
  };

  const fetchWorks = async () => {
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=work`);
      const data = await res.json();
      setAllWorks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch works:", err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=booking`);
      const data = await res.json();
      setAllBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchWorks();
    fetchBookings();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <Router>
      {/* ===== Navbar ===== */}
      <nav className="navbar">
        <NavLink to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="navbar-brand-icon">🔧</div>
          <span>AutoTech</span>
        </NavLink>

        <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <li>
            <NavLink to="/" end onClick={closeMenu}>Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/lead" onClick={closeMenu}>Lead Form</NavLink>
          </li>
          <li>
            <NavLink to="/work" onClick={closeMenu}>Work Form</NavLink>
          </li>
          <li>
            <NavLink to="/booking" onClick={closeMenu}>📅 Booking</NavLink>
          </li>
          <li>
            <NavLink to="/entries" onClick={closeMenu}>Entries</NavLink>
          </li>
        </ul>

        <button
          className="hamburger"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* ===== Routes ===== */}
      <div className="page-content">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                allLeads={allLeads}
                allWorks={allWorks}
                allBookings={allBookings}
              />
            }
          />
          <Route
            path="/lead"
            element={
              <CustomerLeadForm allLeads={allLeads} fetchLeads={fetchLeads} />
            }
          />
          <Route
            path="/work"
            element={
              <WorkDetailsForm allWorks={allWorks} fetchWorks={fetchWorks} />
            }
          />
          <Route
            path="/booking"
            element={
              <AdvanceBookingForm
                allBookings={allBookings}
                fetchBookings={fetchBookings}
              />
            }
          />
          <Route
            path="/bookings"
            element={<UpcomingBookings allBookings={allBookings} />}
          />
          <Route
            path="/entries"
            element={
              <TodayEntries allLeads={allLeads} allWorks={allWorks} allBookings={allBookings} />
            }
          />
        </Routes>
      </div>

      {/* ===== Toast Container ===== */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        theme="dark"
        style={{ zIndex: 9999 }}
      />
    </Router>
  );
};

export default App;
