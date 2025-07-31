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
    padding: '16px',
    maxWidth: '480px',
    margin: 'auto',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  fieldGroup: {
    marginBottom: '12px',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: '4px',
    display: 'block',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default CustomerLeadForm;
