import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const UserDetails = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    role: ''
  });
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user: authUser } = useContext(AuthContext);

  useEffect(() => {
    // Check if the user is authenticated and has admin access before making API calls
    if (!isAuthenticated || !authUser || authUser.role !== 'admin') {
      setError('Du har ikke tillatelse til å se denne siden');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        console.log(`Henter brukerdetaljer for ID: ${id}`);
        
        // Validate ID format first
        if (!id || id.length !== 24) {
          setError('Ugyldig bruker-ID format');
          setLoading(false);
          return;
        }
        
        // Get user details
        const userRes = await axios.get(`/api/users/${id}`);
        console.log('Brukerdata mottatt:', userRes.data);
        
        setUser(userRes.data.data);
        setEditData({
          name: userRes.data.data.name,
          email: userRes.data.data.email,
          role: userRes.data.data.role
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Feil ved henting av brukerdetaljer:', err);
        
        if (err.response?.status === 404) {
          setError(`Bruker ikke funnet. ID-en ${id} eksisterer ikke.`);
        } else if (err.response?.status === 403) {
          setError('Du har ikke tillatelse til å se denne brukeren');
        } else {
          setError(`Feil ved henting av brukerdetaljer: ${err.response?.data?.error || err.message}`);
        }
        
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, authUser]);

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update user details
      await axios.put(`/api/users/${id}`, {
        name: editData.name,
        email: editData.email,
        role: editData.role
      });
      
      // Refresh user data
      const updatedUserRes = await axios.get(`/api/users/${id}`);
      setUser(updatedUserRes.data.data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating user');
    }
  };

  if (loading) {
    return <div className="loading">Laster...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!user) {
    return <div className="alert alert-danger">Bruker ikke funnet</div>;
  }

  return (
    <div className="user-details">
      <div className="action-buttons">
        <button onClick={() => navigate('/admin/users')} className="btn btn-secondary">
          Tilbake til Brukere
        </button>
        <div>
          <button onClick={() => setIsEditing(!isEditing)} className="btn btn-info">
            {isEditing ? 'Avbryt Redigering' : 'Rediger Bruker'}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="edit-form-container">
          <h2>Rediger Bruker</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Navn</label>
              <input
                type="text"
                name="name"
                id="name"
                value={editData.name}
                onChange={handleEditChange}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">E-post</label>
              <input
                type="email"
                name="email"
                id="email"
                value={editData.email}
                onChange={handleEditChange}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role">Rolle</label>
              <select
                name="role"
                id="role"
                value={editData.role}
                onChange={handleEditChange}
                className="form-control"
              >
                <option value="bruker">Bruker</option>
                <option value="1. linje">1. linje</option>
                <option value="2. linje">2. linje</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-success">Lagre Endringer</button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
              Avbryt
            </button>
          </form>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2>{user.name}</h2>
          </div>
          <div className="card-body">
            <p><strong>E-post:</strong> {user.email}</p>
            <p><strong>Rolle:</strong> {user.role}</p>
            <p><strong>Opprettet:</strong> {new Date(user.createdAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
