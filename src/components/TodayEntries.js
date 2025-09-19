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
      const todayISO = now.toISOString().split('T')[0]; 

      const todayEntries = data.filter(entry => {
        const entryDate = entry.timestamp?.split('T')[0];
        return entryDate === todayISO;
      });

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
    const date = new Date(timestamp);

    return date.toLocaleString('hi-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour12: true
    });
  };




 const sendWhatsApp = (number, vehicleNumber) => {
  if (!number) return;

  const phone = String(number).trim();

  let finalNumber = phone;
  if (phone.startsWith("0")) {
    finalNumber = "+91" + phone.substring(1);
  } else if (!phone.startsWith("+91")) {
    finalNumber = "+91" + phone;
  }

  // ✅ Dynamic message with vehicle number
  const message = `आपके वाहन ${vehicleNumber} के लिए Sai Autotech - TATA Authorised Service Station | Commercial Vehicles में फ्री जनरल चेकअप उपलब्ध है।\n\nUREA भरवाने पर पॉइंट्स मिलेंगे और निप्पल ग्रीसिंग ₹150 में कराई जा सकती है।\n\nआसान लोकेशन के लिए देखें: https://maps.app.goo.gl/Ru4zf19JUpknN2yr5\n\nसमय निकालकर लाभ अवश्य उठाएं।`;


  const url = `https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
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

              {/* ✅ नया WhatsApp बटन */}
              <button 
                style={styles.whatsappButton}
                onClick={() => sendWhatsApp(entry.contactNumber, entry.vehicleNumber)}
              >
                WhatsApp भेजें
              </button>
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
  whatsappButton: {
    marginTop: '12px',
    padding: '10px 15px',
    backgroundColor: '#25D366',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
};

export default TodayEntries;
