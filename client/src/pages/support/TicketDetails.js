import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './TicketDetails.css';
import AuthContext from '../../context/AuthContext';

const TicketDetails = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await axios.get(`/api/tickets/${id}`);
        setTicket(res.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching ticket details');
      }
    };

    fetchTicket();
  }, [id]);

  // Update priority options with Norwegian labels
  const priorityOptions = [
    { value: 'lav', label: 'Lav' },
    { value: 'normal', label: 'Normal' },
    { value: 'høy', label: 'Høy' },
    { value: 'kritisk', label: 'Kritisk' }
  ];

  // Category options in Norwegian
  const categoryOptions = [
    { value: 'Hardware', label: 'Maskinvare' },
    { value: 'Software', label: 'Programvare' },
    { value: 'Network', label: 'Nettverk' },
    { value: 'Account', label: 'Konto' },
    { value: 'Other', label: 'Annet' }
  ];

  // Function to update ticket priority
  const updateTicketPriority = async (priority) => {
    try {
      const res = await axios.put(`/api/tickets/${id}/priority`, { priority });
      setTicket(res.data.data);
      setSuccess('Prioritet oppdatert');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Feil ved oppdatering av prioritet');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (!ticket) {
    return <div>Laster...</div>;
  }

  return (
    <div className="support-ticket-details">
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <h2>Billett detaljer</h2>
      <p><strong>Tittel:</strong> {ticket.title}</p>
      <p><strong>Beskrivelse:</strong> {ticket.description}</p>
      <p><strong>Status:</strong> {ticket.status}</p>
      <p><strong>Prioritet:</strong> {ticket.priority}</p>
      <p><strong>Kategori:</strong> {
        categoryOptions.find(cat => cat.value === ticket.category)?.label || ticket.category
      }</p>
      
      {user && (user.role === 'admin' || user.role === '1. linje' || user.role === '2. linje') && (
        <div className="ticket-priority-section">
          <h3>Prioritetshåndtering</h3>
          <div className="priority-buttons">
            {priorityOptions.map(option => (
              <button
                key={option.value}
                className={`btn ${ticket.priority === option.value ? 'btn-secondary' : 'btn-outline'}`}
                onClick={() => updateTicketPriority(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;