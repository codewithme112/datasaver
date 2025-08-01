import React, { useState, useEffect } from 'react';

const CustomerLeadForm = ({ onShowEntries }) => {
  const [formData, setFormData] = useState({
    tokenNumber: '',
    name: '',
    vehicleNumber: '',
    contactNumber: '',
    companyName: '',
    totalVehicle: '',
    ownerManager: '',
    officeLocation: '',
    upcomingWork: ''
  });

  const [stats, setStats] = useState({
    totalEntries: 0,
    todayEntries: 0,
    loading: true,
    error: null
  });

  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby1oJ_G1yWeeo4cAEV5vsyBvP1pwoNQQbIXcxbYci4wlXBbYIhxQP_h3-UQnAyLgD8/exec';






  // Fetch data function
const fetchData = async () => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    const data = await response.json();

    const now = new Date();



 const todayISO = now.toISOString().split('T')[0]; // "2025-08-01"


    console.log("Today is:", todayISO);

    console.log("Checking timestamps from sheet:");
    data.slice(0, 10).forEach(entry => {
      console.log("⏱", entry.timestamp);
    });

    const todayEntries = data.filter(entry => {
  const entryDate = entry.timestamp?.split('T')[0]; // "2025-08-01"
  const isToday = entryDate === todayISO;
  return isToday;
}).length;






    setStats({
      totalEntries: data.length,
      todayEntries,
      loading: false,
      error: null
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    setStats(prev => ({ ...prev, loading: false, error: 'Failed to load data' }));
  }
};





  // Fetch data on component mount and after form submission
  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation logic
    if (name === 'contactNumber' && !/^\d{0,10}$/.test(value)) return;
    if (name === 'name' && !/^[a-zA-Z\s]*$/.test(value)) return;
    if (name === 'vehicleNumber' && !/^[A-Z0-9]*$/i.test(value)) return;
    if (name === 'tokenNumber' && !/^\d{0,5}$/.test(value)) return;
    if (name === 'totalVehicle' && !/^\d{0,7}$/.test(value)) return;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'vehicleNumber' ? value.toUpperCase() : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic checks
    if (formData.contactNumber.length !== 10) {
      alert("संपर्क नंबर 10 अंकों का होना चाहिए।");
      return;
    }

    if (formData.name.trim() === '') {
      alert("नाम आवश्यक है।");
      return;
    }

    // Submit to Google Sheets
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'no-cors',
      body: JSON.stringify(formData),
    });

    alert('डेटा सफलतापूर्वक सबमिट किया गया!');

    // Reset form and refresh data
    setFormData({
      tokenNumber: '',
      name: '',
      vehicleNumber: '',
      contactNumber: '',
      companyName: '',
      totalVehicle: '',
      ownerManager: '',
      officeLocation: '',
      upcomingWork: ''
    });
    
    // Refresh data after submission
    setTimeout(() => fetchData(), 1000);
  };

  // Hindi translations
  const hindiLabels = {
    tokenNumber: 'टोकन नंबर',
    name: 'नाम',
    vehicleNumber: 'वाहन नंबर',
    contactNumber: 'संपर्क नंबर',
    companyName: 'कंपनी का नाम',
    totalVehicle: 'कुल वाहन',
    ownerManager: 'मालिक/प्रबंधक',
    officeLocation: 'कार्यालय स्थान',
    upcomingWork: 'आगामी कार्य'
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>ग्राहक लीड फॉर्स</h2>
      
      {/* Statistics Display */}
      <div style={styles.statsContainer}>
        {stats.loading ? (
          <div style={styles.loading}>डेटा लोड हो रहा है...</div>
        ) : stats.error ? (
          <div style={styles.error}>{stats.error}</div>
        ) : (
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
        )}
      </div>

      {/* Navigation Button */}
      <button 
        onClick={onShowEntries} 
        style={styles.navButton}
      >
        आज की एंट्रीज देखें
      </button>

      <form onSubmit={handleSubmit} style={styles.form}>
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} style={styles.fieldGroup}>
            <label style={styles.label}>
              {hindiLabels[key]}:
            </label>
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
        <button type="submit" style={styles.button}>जमा करें</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '500px',
    margin: '20px auto',
    fontFamily: 'system-ui, sans-serif',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#333',
    fontSize: '24px',
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: '20px',
  },
  statsGrid: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '20px',
    marginBottom: '20px',
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    flex: 1,
    border: '1px solid #dee2e6',
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6c757d',
    marginTop: '5px',
  },
  loading: {
    textAlign: 'center',
    color: '#6c757d',
    padding: '20px',
  },
  error: {
    textAlign: 'center',
    color: '#dc3545',
    padding: '20px',
  },
  navButton: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '6px',
    fontSize: '14px',
    color: '#555',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  }
};

export default CustomerLeadForm;
