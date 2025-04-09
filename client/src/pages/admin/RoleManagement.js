import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users');
        setUsers(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Feil ved henting av brukere');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async () => {
    if (!selectedUserId || !selectedRole) return;
    
    try {
      await axios.put(`/api/users/${selectedUserId}/role`, { role: selectedRole });
      
      // Refresh users list
      const res = await axios.get('/api/users');
      setUsers(res.data.data);
      
      setSelectedUserId('');
      setSelectedRole('');
    } catch (err) {
      setError(err.response?.data?.error || 'Feil ved oppdatering av brukerrolle');
    }
  };

  if (loading) {
    return <div className="loading">Laster...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="role-management">
      <h1>Rolleadministrasjon</h1>
      
      <div className="role-assignment card">
        <div className="card-header">
          <h2>Tildel Rolle til Bruker</h2>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label htmlFor="user">Velg Bruker</label>
            <select
              id="user"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="form-control"
            >
              <option value="">-- Velg Bruker --</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email}) - Gjeldende rolle: {user.role}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Velg Rolle</label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="form-control"
            >
              <option value="">-- Velg Rolle --</option>
              <option value="bruker">Bruker</option>
              <option value="1. linje">1. linje</option>
              <option value="2. linje">2. linje</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <button 
            onClick={handleRoleChange}
            disabled={!selectedUserId || !selectedRole}
            className="btn btn-primary"
          >
            Oppdater Rolle
          </button>
        </div>
      </div>
      
      <div className="users-table">
        <h2>Brukere og Roller</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Navn</th>
              <th>E-post</th>
              <th>Rolle</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleManagement;
