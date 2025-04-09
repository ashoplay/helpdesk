import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ManageTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get('/api/tickets');
        setTickets(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching tickets');
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const filteredTickets = () => {
    return tickets.filter(ticket => {
      // Status filter
      if (filter !== 'all' && ticket.status !== filter) {
        return false;
      }
      
      // Category filter
      if (categoryFilter !== 'all' && ticket.category !== categoryFilter) {
        return false;
      }
      
      // Search term (in title)
      if (searchTerm && !ticket.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="manage-tickets">
      <h1>Manage Tickets</h1>
      
      <div className="search-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search tickets by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
        
        <div className="filter-section">
          <h3>Status</h3>
          <div className="filters">
            <button 
              onClick={() => setFilter('all')}
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('Åpen')}
              className={`btn ${filter === 'Åpen' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Open
            </button>
            <button 
              onClick={() => setFilter('Under arbeid')}
              className={`btn ${filter === 'Under arbeid' ? 'btn-primary' : 'btn-secondary'}`}
            >
              In Progress
            </button>
            <button 
              onClick={() => setFilter('Løst')}
              className={`btn ${filter === 'Løst' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Resolved
            </button>
          </div>
          
          <h3>Category</h3>
          <div className="filters">
            <button 
              onClick={() => setCategoryFilter('all')}
              className={`btn ${categoryFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All
            </button>
            <button 
              onClick={() => setCategoryFilter('Hardware')}
              className={`btn ${categoryFilter === 'Hardware' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Hardware
            </button>
            <button 
              onClick={() => setCategoryFilter('Software')}
              className={`btn ${categoryFilter === 'Software' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Software
            </button>
            <button 
              onClick={() => setCategoryFilter('Network')}
              className={`btn ${categoryFilter === 'Network' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Network
            </button>
            <button 
              onClick={() => setCategoryFilter('Account')}
              className={`btn ${categoryFilter === 'Account' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Account
            </button>
            <button 
              onClick={() => setCategoryFilter('Other')}
              className={`btn ${categoryFilter === 'Other' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Other
            </button>
          </div>
        </div>
      </div>
      
      {filteredTickets().length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>User</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets().map(ticket => (
                <tr key={ticket._id}>
                  <td>{ticket.title}</td>
                  <td>{ticket.createdBy.name}</td>
                  <td>{ticket.category}</td>
                  <td>{ticket.status}</td>
                  <td>{ticket.priority}</td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/admin/tickets/${ticket._id}`} className="btn btn-secondary btn-sm">
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

export default ManageTickets;
