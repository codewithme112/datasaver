import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CustomerLeadForm from "./components/CustomerLeadForm";
import WorkDetailsForm from "./components/WorkDetailsForm";
import TodayEntries from "./components/TodayEntries";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwjcrTiR1VW3beteqx-b7VcURACWHpfsqyerPdvZ2yzIXq1_w7R1n0DRAa3qYupXx9S/exec";

const App = () => {
  // ✅ Centralized States
  const [allLeads, setAllLeads] = useState([]);
  const [allWorks, setAllWorks] = useState([]);

  // ✅ Fetch Leads
  const fetchLeads = async () => {
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=lead`);
      const data = await res.json();
      setAllLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    }
  };

  // ✅ Fetch Works
  const fetchWorks = async () => {
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=work`);
      const data = await res.json();
      setAllWorks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch works:", err);
    }
  };

  // ✅ Fetch once on app load
  useEffect(() => {
    fetchLeads();
    fetchWorks();
  }, []);

  return (
    <Router>
      {/* Navbar */}
      <nav style={{ padding: "10px", background: "#f5f5f5", marginBottom: "20px" }}>
        <Link to="/" style={{ marginRight: "15px" }}>Customer Lead Form</Link>
        <Link to="/work" style={{ marginLeft: "25px" }}>Work Form</Link>
        <Link to="/today"style={{ marginLeft: "75px" }}>Entries</Link>
      </nav>

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <CustomerLeadForm
              allLeads={allLeads}
              fetchLeads={fetchLeads}
            />
          }
        />
        <Route
          path="/work"
          element={
            <WorkDetailsForm
              allWorks={allWorks}
              fetchWorks={fetchWorks}
            />
          }
        />
        <Route
          path="/today"
          element={
            <TodayEntries
              allLeads={allLeads}
              allWorks={allWorks}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
