import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserTickets = async () => {
      try {
        const res = await axios.get('/api/tickets');
        setTickets(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching ticket data');
        setLoading(false);
      }
    };

    if (user) {
      fetchUserTickets();
    }
  }, [user]);

  if (!user || loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  // Count tickets by status
  const openTickets = tickets.filter(ticket => ticket.status === 'Åpen').length;
  const inProgressTickets = tickets.filter(ticket => ticket.status === 'Under arbeid').length;
  const resolvedTickets = tickets.filter(ticket => ticket.status === 'Løst').length;

  return (
    <div className="profile-container">
      <h1>Brukerprofil</h1>
      
      <div className="profile-grid">
        <div className="profile-card">
          <div className="card-header">
            <h2>Personlig informasjon</h2>
          </div>
          <div className="card-body">
            <div className="profile-info">
              <h3>{user.name}</h3>
              <p><strong>E-post:</strong> {user.email}</p>
              <p><strong>Rolle:</strong> {user.role}</p>
              <p><strong>Konto opprettet:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        <div className="profile-card">
          <div className="card-header">
            <h2>Billett-statistikk</h2>
          </div>
          <div className="card-body">
            <div className="stats-box">
              <div className="stat-item total">
                <span className="stat-number">{tickets.length}</span>
                <span className="stat-label">Total Tickets</span>
              </div>
              <div className="stat-item open">
                <span className="stat-number">{openTickets}</span>
                <span className="stat-label">Open</span>
              </div>
              <div className="stat-item in-progress">
                <span className="stat-number">{inProgressTickets}</span>
                <span className="stat-label">In Progress</span>
              </div>
              <div className="stat-item resolved">
                <span className="stat-number">{resolvedTickets}</span>
                <span className="stat-label">Resolved</span>
              </div>
            </div>
            
            <div className="ticket-actions">
              <Link to="/dashboard" className="btn btn-primary">View My Tickets</Link>
              <Link to="/tickets/new" className="btn btn-secondary">Create New Ticket</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
