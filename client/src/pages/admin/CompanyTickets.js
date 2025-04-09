import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CompanyTickets = () => {
  const [company, setCompany] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get company details
        const companyRes = await axios.get(`/api/companies/${id}`);
        setCompany(companyRes.data.data);
        
        // Get tickets created by all company users
        const ticketsRes = await axios.get(`/api/companies/${id}/tickets`);
        setTickets(ticketsRes.data.data);
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching company data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Filter tickets by status and search term
  const filteredTickets = tickets.filter(ticket => {
    // Status filter
    if (statusFilter !== 'all' && ticket.status !== statusFilter) {
      return false;
    }
    
    // Search term (in title)
    if (searchTerm && !ticket.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Group tickets by status for stats
  const ticketStats = {
    total: tickets.length,
    'Åpen': tickets.filter(ticket => ticket.status === 'Åpen').length,
    'Under arbeid': tickets.filter(ticket => ticket.status === 'Under arbeid').length,
    'Løst': tickets.filter(ticket => ticket.status === 'Løst').length
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="company-tickets-page">
      <div className="action-buttons">
        <button onClick={() => navigate(`/admin/companies/${id}`)} className="btn btn-secondary">
          Tilbake til firma
        </button>
      </div>
      
      <h1>{company?.name} - Billetter</h1>
      
      <div className="ticket-stats">
        <div className="stats-cards">
          <div className="card">
            <div className="card-body text-center">
              <span className="stat-number">{ticketStats.total}</span>
              <span className="stat-label">Totalt antall billetter</span>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <span className="stat-number">{ticketStats['Åpen']}</span>
              <span className="stat-label">Åpne billetter</span>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <span className="stat-number">{ticketStats['Under arbeid']}</span>
              <span className="stat-label">Under arbeid</span>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <span className="stat-number">{ticketStats['Løst']}</span>
              <span className="stat-label">Løste billetter</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="search-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Søk billetter etter tittel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
        
        <div className="filter-section">
          <h3>Status</h3>
          <div className="filters">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Alle
            </button>
            <button 
              onClick={() => setStatusFilter('Åpen')}
              className={`btn ${statusFilter === 'Åpen' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Open
            </button>
            <button 
              onClick={() => setStatusFilter('Under arbeid')}
              className={`btn ${statusFilter === 'Under arbeid' ? 'btn-primary' : 'btn-secondary'}`}
            >
              In Progress
            </button>
            <button 
              onClick={() => setStatusFilter('Løst')}
              className={`btn ${statusFilter === 'Løst' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Resolved
            </button>
          </div>
        </div>
      </div>
      
      {tickets.length === 0 ? (
        <div className="alert alert-info">
          No tickets found for this company's users.
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="alert alert-info">
          No tickets match the current filters.
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Created By</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket._id}>
                  <td>{ticket.title}</td>
                  <td>{ticket.createdBy?.name}</td>
                  <td>{ticket.category}</td>
                  <td>{ticket.status}</td>
                  <td>{ticket.priority}</td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/admin/tickets/${ticket._id}`} className="btn btn-info btn-sm">
                      View
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

export default CompanyTickets;
