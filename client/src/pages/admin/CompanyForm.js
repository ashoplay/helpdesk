import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CompanyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: {
      street: '',
      city: '',
      zipCode: '',
      country: ''
    }
  });

  // Load company data if editing
  useEffect(() => {
    if (id) {
      const fetchCompany = async () => {
        try {
          const res = await axios.get(`/api/companies/${id}`);
          const company = res.data.data;
          
          setFormData({
            name: company.name || '',
            description: company.description || '',
            contactEmail: company.contactEmail || '',
            contactPhone: company.contactPhone || '',
            address: {
              street: company.address?.street || '',
              city: company.address?.city || '',
              zipCode: company.address?.zipCode || '',
              country: company.address?.country || ''
            }
          });
          
          setLoading(false);
        } catch (err) {
          setError('Error fetching company details');
          setLoading(false);
        }
      };

      fetchCompany();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddressChange = (e) => {
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (id) {
        // Update existing company
        await axios.put(`/api/companies/${id}`, formData);
      } else {
        // Create new company
        await axios.post('/api/companies', formData);
      }
      
      navigate('/admin/companies');
    } catch (err) {
      setError(err.response?.data?.error || 'Error saving company');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="form-container">
      <h1>{id ? 'Edit Company' : 'Create Company'}</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Company Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            rows="3"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="contactEmail">Contact Email</label>
          <input
            type="email"
            name="contactEmail"
            id="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="contactPhone">Contact Phone</label>
          <input
            type="text"
            name="contactPhone"
            id="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        
        <h3>Address</h3>
        
        <div className="form-group">
          <label htmlFor="street">Street</label>
          <input
            type="text"
            name="street"
            id="street"
            value={formData.address.street}
            onChange={handleAddressChange}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            name="city"
            id="city"
            value={formData.address.city}
            onChange={handleAddressChange}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="zipCode">Zip Code</label>
          <input
            type="text"
            name="zipCode"
            id="zipCode"
            value={formData.address.zipCode}
            onChange={handleAddressChange}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="country">Country</label>
          <input
            type="text"
            name="country"
            id="country"
            value={formData.address.country}
            onChange={handleAddressChange}
            className="form-control"
          />
        </div>
        
        <button type="submit" className="btn btn-success">
          {id ? 'Update Company' : 'Create Company'}
        </button>
        <button 
          type="button" 
          onClick={() => navigate('/admin/companies')} 
          className="btn btn-secondary"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CompanyForm;
