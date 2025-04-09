import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
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

  const handleAssignRole = async (ticketId, role) => {
    try {
      await axios.put(`/api/tickets/${ticketId}/assign`, { role });
      
      // Update local state
      setTickets(tickets.map(ticket => 
        ticket._id === ticketId ? { ...ticket, assignedToRole: role } : ticket
      ));
      
      setSuccess('Ticket assigned successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to assign ticket');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      const ticket = tickets.find(t => t._id === ticketId);
      
      if (ticket.status !== 'Løst') {
        setError('Only resolved tickets can be deleted');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      await axios.delete(`/api/tickets/${ticketId}`);
      
      // Remove from local state
      setTickets(tickets.filter(ticket => ticket._id !== ticketId));
      
      setSuccess('Ticket deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete ticket');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    return (
      (statusFilter === 'all' || ticket.status === statusFilter) &&
      (roleFilter === 'all' || ticket.assignedToRole === roleFilter) &&
      (
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.createdByName && ticket.createdByName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  });

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;

  return (
    <div className="ticket-management-page">
      <h1>Billetthåndtering</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="filter-container">
        <div className="row mb-3">
          <div className="col-md-4">
            <select 
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Alle statuser</option>
              <option value="Åpen">Åpen</option>
              <option value="Under arbeid">Under arbeid</option>
              <option value="Løst">Løst</option>
            </select>
          </div>
          
          <div className="col-md-4">
            <select 
              className="form-control"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Alle roller</option>
              <option value="unassigned">Ikke tildelt</option>
              <option value="1. linje">1. linje support</option>
              <option value="2. linje">2. linje support</option>
            </select>
          </div>
          
          <div className="col-md-4">
            <input
              type="text"
              placeholder="Søk etter billetter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
      </div>
      
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Created By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <tr key={ticket._id}>
                <td>
                  <Link to={`/tickets/${ticket._id}`}>{ticket.title}</Link>
                </td>
                <td>{ticket.status}</td>
                <td>
                  <select
                    className="form-control"
                    value={ticket.assignedToRole || 'unassigned'}
                    onChange={(e) => handleAssignRole(ticket._id, e.target.value === 'unassigned' ? null : e.target.value)}
                  >
                    <option value="unassigned">Unassigned</option>
                    <option value="1. linje">1st Line</option>
                    <option value="2. linje">2nd Line</option>
                  </select>
                </td>
                <td>{ticket.createdByName}</td>
                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                <td>
                  <Link to={`/tickets/${ticket._id}`} className="btn btn-sm btn-info mr-2">
                    View
                  </Link>
                  {ticket.status === 'Løst' && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteTicket(ticket._id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketManagement;
