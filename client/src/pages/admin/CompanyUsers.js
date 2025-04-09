import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CompanyUsers = () => {
  const [company, setCompany] = useState(null);
  const [users, setUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get company details
        const companyRes = await axios.get(`/api/companies/${id}`);
        setCompany(companyRes.data.data);
        
        // Get company users
        const usersRes = await axios.get(`/api/companies/${id}/users`);
        setUsers(usersRes.data.data);
        
        // Get all users for adding to company
        const allUsersRes = await axios.get('/api/users');
        const usersNotInCompany = allUsersRes.data.data.filter(
          user => !user.company || user.company._id !== id
        );
        setAvailableUsers(usersNotInCompany);
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching company data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const addUserToCompany = async () => {
    if (!selectedUserId) return;
    
    try {
      await axios.put(`/api/users/${selectedUserId}/company`, {
        companyId: id
      });
      
      // Refresh data
      const usersRes = await axios.get(`/api/companies/${id}/users`);
      setUsers(usersRes.data.data);
      
      const allUsersRes = await axios.get('/api/users');
      const usersNotInCompany = allUsersRes.data.data.filter(
        user => !user.company || user.company._id !== id
      );
      setAvailableUsers(usersNotInCompany);
      
      setSelectedUserId('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding user to company');
    }
  };

  const removeUserFromCompany = async (userId) => {
    try {
      await axios.delete(`/api/users/${userId}/company`);
      
      // Refresh data
      const usersRes = await axios.get(`/api/companies/${id}/users`);
      setUsers(usersRes.data.data);
      
      const allUsersRes = await axios.get('/api/users');
      const usersNotInCompany = allUsersRes.data.data.filter(
        user => !user.company || user.company._id !== id
      );
      setAvailableUsers(usersNotInCompany);
    } catch (err) {
      setError(err.response?.data?.error || 'Error removing user from company');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="company-users-page">
      <div className="action-buttons">
        <button onClick={() => navigate(`/admin/companies/${id}`)} className="btn btn-secondary">
          Back to Company
        </button>
      </div>
      
      <h1>{company?.name} - Users</h1>
      
      <div className="add-user-form">
        <h3>Add User to Company</h3>
        <div className="form-group">
          <select
            className="form-control"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Select a user...</option>
            {availableUsers.map(user => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <button 
            onClick={addUserToCompany} 
            className="btn btn-primary"
            disabled={!selectedUserId}
            style={{ marginTop: '10px' }}
          >
            Add to Company
          </button>
        </div>
      </div>
      
      {users.length === 0 ? (
        <div className="alert alert-info">
          No users associated with this company.
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/admin/users/${user._id}`} className="btn btn-info btn-sm">
                      Manage
                    </Link>
                    <button 
                      onClick={() => removeUserFromCompany(user._id)} 
                      className="btn btn-danger btn-sm"
                      style={{ marginLeft: '5px' }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CompanyUsers;
