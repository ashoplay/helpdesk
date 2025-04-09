import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get('/api/companies');
        setCompanies(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching companies');
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="companies-page">
      <div className="page-header">
        <h1>Companies</h1>
        <Link to="/admin/companies/new" className="btn btn-primary">
          Add New Company
        </Link>
      </div>
      
      {companies.length === 0 ? (
        <p>No companies found.</p>
      ) : (
        <div className="companies-grid">
          {companies.map(company => (
            <div key={company._id} className="company-card">
              <div className="company-details">
                <h2 className="company-name">{company.name}</h2>
                <p>{company.description}</p>
              </div>
              
              {company.address && (
                <div className="company-address">
                  <h3>Address</h3>
                  <p>{company.address.street}</p>
                  <p>{company.address.city}, {company.address.zipCode}</p>
                  <p>{company.address.country}</p>
                </div>
              )}
              
              <div className="company-contact">
                <h3>Contact</h3>
                <p>Email: {company.contactEmail}</p>
                <p>Phone: {company.contactPhone}</p>
              </div>
              
              <div className="company-actions">
                <Link to={`/admin/companies/${company._id}`} className="btn btn-info">
                  View Details
                </Link>
                <Link to={`/admin/companies/${company._id}/edit`} className="btn btn-secondary">
                  Edit
                </Link>
                <Link to={`/admin/companies/${company._id}/users`} className="btn btn-primary">
                  View Users
                </Link>
                <Link to={`/admin/companies/${company._id}/tickets`} className="btn btn-warning">
                  View Tickets
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Companies;
