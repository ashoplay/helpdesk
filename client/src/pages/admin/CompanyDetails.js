import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CompanyDetails = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await axios.get(`/api/companies/${id}`);
        setCompany(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching company details');
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  const deleteCompany = async () => {
    try {
      await axios.delete(`/api/companies/${id}`);
      navigate('/admin/companies');
    } catch (err) {
      setError(err.response?.data?.error || 'Error deleting company');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!company) {
    return <div className="alert alert-danger">Company not found</div>;
  }

  return (
    <div className="company-details-page">
      <div className="action-buttons">
        <button onClick={() => navigate('/admin/companies')} className="btn btn-secondary">
          Back to Companies
        </button>
        <div>
          <Link to={`/admin/companies/${id}/edit`} className="btn btn-info">
            Edit Company
          </Link>
          {!showDeleteConfirm && (
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className="btn btn-danger"
            >
              Delete Company
            </button>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirmation">
          <h3>Are you sure you want to delete this company?</h3>
          <p>This action cannot be undone. All associated users and tickets must be reassigned first.</p>
          <div className="buttons">
            <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={deleteCompany} className="btn btn-danger">
              Confirm Delete
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>{company.name}</h2>
        </div>
        <div className="card-body">
          <p>{company.description}</p>
          
          {company.address && (
            <div className="company-section">
              <h3>Address</h3>
              <p>{company.address.street}</p>
              <p>{company.address.city}, {company.address.zipCode}</p>
              <p>{company.address.country}</p>
            </div>
          )}
          
          <div className="company-section">
            <h3>Contact Information</h3>
            <p><strong>Email:</strong> {company.contactEmail}</p>
            <p><strong>Phone:</strong> {company.contactPhone}</p>
          </div>
          
          <div className="company-section">
            <h3>Created:</h3>
            <p>{new Date(company.createdAt).toLocaleString()}</p>
          </div>
          
          <div className="company-actions-grid">
            <Link to={`/admin/companies/${id}/users`} className="btn btn-primary">
              View Company Users
            </Link>
            <Link to={`/admin/companies/${id}/tickets`} className="btn btn-warning">
              View Company Tickets
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;
