import React, { useState, useEffect } from 'react';

const TodayEntries = ({ onBack }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby1oJ_G1yWeeo4cAEV5vsyBvP1pwoNQQbIXcxbYci4wlXBbYIhxQP_h3-UQnAyLgD8/exec';

  useEffect(() => {
    fetchTodayEntries();
  }, []);




const fetchTodayEntries = async () => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    const data = await response.json();

    const now = new Date();



    const todayISO = now.toISOString().split('T')[0]; // "2025-08-01"

const todayEntries = data.filter(entry => {
  const entryDate = entry.timestamp?.split('T')[0]; // also "2025-08-01"
  const isToday = entryDate === todayISO;
  if (!isToday) console.log("Skipping entry:", entry.timestamp);
  return isToday;
});




    console.log("Today entries found:", todayEntries.length);

    setEntries(todayEntries);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching today's entries:", error);
    setError('Failed to load today\'s entries');
    setLoading(false);
  }
};



  const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const [datePart, timePart] = timestamp.split(' '); // e.g., "01-08-2025", "14:32:05"
  const [day, month, year] = datePart.split('-');    // "01", "08", "2025"
  const isoString = `${year}-${month}-${day}T${timePart}`;
  const date = new Date(isoString);

  return date.toLocaleString('hi-IN', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  });
};






  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>आज की एंट्रीज</h2>
      
      <button 
        onClick={onBack} 
        style={styles.backButton}
      >
        ← वापस फॉर्म पर जाएं
      </button>

      {loading ? (
        <div style={styles.loading}>डेटा लोड हो रहा है...</div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : entries.length === 0 ? (
        <div style={styles.empty}>
          आज कोई एंट्री नहीं है
        </div>
      ) : (
        <div style={styles.entriesList}>
          {entries.map((entry, index) => (
            <div key={index} style={styles.entryCard}>
              <div style={styles.entryHeader}>
                <span style={styles.entryNumber}>#{index + 1}</span>
                <span style={styles.entryTime}>
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
              
              <div style={styles.entryDetails}>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
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
  backButton: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#6c757d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  loading: {
    textAlign: 'center',
    color: '#6c757d',
    padding: '40px',
    fontSize: '16px',
  },
  error: {
    textAlign: 'center',
    color: '#dc3545',
    padding: '40px',
    fontSize: '16px',
  },
  empty: {
    textAlign: 'center',
    color: '#6c757d',
    padding: '40px',
    fontSize: '16px',
  },
  entriesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  entryCard: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
  },
  entryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #dee2e6',
  },
  entryNumber: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#007bff',
  },
  entryTime: {
    fontSize: '14px',
    color: '#6c757d',
  },
  entryDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  label: {
    fontWeight: '600',
    color: '#495057',
    fontSize: '14px',
  },
  value: {
    color: '#212529',
    fontSize: '14px',
  },
};

export default TodayEntries;