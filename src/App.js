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
      {/* ===== Top Navbar ===== */}
      <nav className="navbar">
        <NavLink to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="navbar-brand-icon">🚛</div>
          <div className="navbar-brand-text">
            <span className="navbar-brand-name">SAI AUTOTECH</span>
            <span className="navbar-brand-sub">TATA Authorised Service Station</span>
          </div>
        </NavLink>

        <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <li><NavLink to="/" end onClick={closeMenu}>Dashboard</NavLink></li>
          <li><NavLink to="/lead" onClick={closeMenu}>Lead</NavLink></li>
          <li><NavLink to="/work" onClick={closeMenu}>Work</NavLink></li>
          <li><NavLink to="/booking" onClick={closeMenu}>New Booking</NavLink></li>
          <li><NavLink to="/bookings" onClick={closeMenu}>Upcoming</NavLink></li>
          <li><NavLink to="/entries" onClick={closeMenu}>Entries</NavLink></li>
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

      {/* ===== Page Content ===== */}
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
            element={<UpcomingBookings allBookings={allBookings} allWorks={allWorks} />}
          />
          <Route
            path="/entries"
            element={
              <TodayEntries
                allLeads={allLeads}
                allWorks={allWorks}
                allBookings={allBookings}
              />
            }
          />
        </Routes>
      </div>

      {/* ===== Mobile Bottom Navigation ===== */}
      <nav className="bottom-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `bottom-nav-item${isActive ? " active" : ""}`}
          onClick={closeMenu}
        >
          <span className="bottom-nav-icon">📊</span>
          <span className="bottom-nav-label">Dashboard</span>
        </NavLink>
        <NavLink
          to="/lead"
          className={({ isActive }) => `bottom-nav-item${isActive ? " active" : ""}`}
          onClick={closeMenu}
        >
          <span className="bottom-nav-icon">📝</span>
          <span className="bottom-nav-label">Lead</span>
        </NavLink>
        <NavLink
          to="/work"
          className={({ isActive }) => `bottom-nav-item${isActive ? " active" : ""}`}
          onClick={closeMenu}
        >
          <span className="bottom-nav-icon">🔧</span>
          <span className="bottom-nav-label">Work</span>
        </NavLink>
        <NavLink
          to="/bookings"
          className={({ isActive }) => `bottom-nav-item${isActive ? " active" : ""}`}
          onClick={closeMenu}
        >
          <span className="bottom-nav-icon">📅</span>
          <span className="bottom-nav-label">Upcoming</span>
        </NavLink>
        <NavLink
          to="/entries"
          className={({ isActive }) => `bottom-nav-item${isActive ? " active" : ""}`}
          onClick={closeMenu}
        >
          <span className="bottom-nav-icon">🗂️</span>
          <span className="bottom-nav-label">Entries</span>
        </NavLink>
      </nav>

      {/* ===== Toast ===== */}
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
