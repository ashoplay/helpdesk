import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const SupportDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user } = useContext(AuthContext);
  const supportRole = user.role; // Either '1. linje' or '2. linje'

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get(`/api/tickets/role/${supportRole}`);
        setTickets(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Feil ved henting av saker');
        setLoading(false);
      }
    };

    fetchTickets();
  }, [supportRole]);

  // Filter tickets based on status and search term
  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) {
      return false;
    }
    
    if (searchTerm && !ticket.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Count tickets by status
  const openTickets = tickets.filter(ticket => ticket.status === 'Åpen').length;
  const inProgressTickets = tickets.filter(ticket => ticket.status === 'Under arbeid').length;
  const resolvedTickets = tickets.filter(ticket => ticket.status === 'Løst').length;

  if (loading) {
    return <div className="loading">Laster...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="support-dashboard">
      <h1>{supportRole} Dashbord</h1>
      
      <div className="stats-summary">
        <div className="stats-cards">
          <div className="card">
            <div className="card-body text-center">
              <span className="stat-number">{openTickets}</span>
              <span className="stat-label">Åpne billetter</span>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <span className="stat-number">{inProgressTickets}</span>
              <span className="stat-label">Billetter under arbeid</span>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <span className="stat-number">{resolvedTickets}</span>
              <span className="stat-label">Løste billetter</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="search-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Søk i saker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
        
        <div className="filter-section">
          <h3>Filtrer etter status</h3>
          <div className="filters">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Alle Saker
            </button>
            <button 
              onClick={() => setStatusFilter('Åpen')}
              className={`btn ${statusFilter === 'Åpen' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Åpen
            </button>
            <button 
              onClick={() => setStatusFilter('Under arbeid')}
              className={`btn ${statusFilter === 'Under arbeid' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Under arbeid
            </button>
            <button 
              onClick={() => setStatusFilter('Løst')}
              className={`btn ${statusFilter === 'Løst' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Løst
            </button>
          </div>
        </div>
      </div>
      
      <div className="ticket-list">
        <h2>Dine tildelte saker</h2>
        
        {filteredTickets.length === 0 ? (
          <p>Ingen saker å vise.</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Tittel</th>
                  <th>Opprettet av</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Prioritet</th>
                  <th>Opprettet</th>
                  <th>Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(ticket => (
                  <tr key={ticket._id}>
                    <td>{ticket.title}</td>
                    <td>{ticket.createdBy.name}</td>
                    <td>{ticket.category}</td>
                    <td>{ticket.status}</td>
                    <td>{ticket.priority}</td>
                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/support/tickets/${ticket._id}`} className="btn btn-info btn-sm">
                        Vis
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportDashboard;
