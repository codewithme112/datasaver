import React, { useState } from 'react';

const CustomerLeadForm = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation logic
    if (name === 'contactNumber' && !/^\d{0,10}$/.test(value)) return;
    if (name === 'name' && !/^[a-zA-Z\s]*$/.test(value)) return;
    if (name === 'vehicleNumber' && !/^[A-Z0-9]*$/.test(value)) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic checks
    if (formData.contactNumber.length !== 10) {
      alert("Contact number must be exactly 10 digits.");
      return;
    }

    if (formData.name.trim() === '') {
      alert("Name is required and should contain only letters.");
      return;
    }

    // Submit to Google Sheets
    await fetch('https://script.google.com/macros/s/AKfycbywUbOa9WM3QoEIT0FIdPgwzOufX3i56zdI2XxQ8HygnoPno2OVmEpr9iFFxVLSjy3k/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'no-cors',
      body: JSON.stringify(formData),
    });

    alert('Data submitted successfully!');

    // Reset form
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
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Customer Lead Form</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} style={styles.fieldGroup}>
            <label style={styles.label}>
              {key.replace(/([A-Z])/g, ' $1')}:
            </label>
            <input
              type="text"
              name={key}
              value={value}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1')}`}
            />
          </div>
        ))}
        <button type="submit" style={styles.button}>Submit</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '400px',
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
    fontSize: '22px',
    fontWeight: '600',
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
