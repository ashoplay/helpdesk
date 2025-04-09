import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users');
        setUsers(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = () => {
    return users.filter(user => {
      // Role filter
      if (roleFilter !== 'all' && user.role !== roleFilter) {
        return false;
      }
      
      // Search term (in name or email)
      if (searchTerm && 
         !user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
         !user.email.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="manage-users">
      <h1>Manage Users</h1>
      
      <div className="search-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
        
        <div className="filter-section">
          <h3>Role</h3>
          <div className="filters">
            <button 
              onClick={() => setRoleFilter('all')}
              className={`btn ${roleFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All
            </button>
            <button 
              onClick={() => setRoleFilter('user')}
              className={`btn ${roleFilter === 'user' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Users
            </button>
            <button 
              onClick={() => setRoleFilter('admin')}
              className={`btn ${roleFilter === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Admins
            </button>
          </div>
        </div>
      </div>
      
      {filteredUsers().length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Company</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers().map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.company ? user.company.name : 'Not Assigned'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/admin/users/${user._id}`} className="btn btn-secondary btn-sm">
                      Manage
                    </Link>
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

export default ManageUsers;
