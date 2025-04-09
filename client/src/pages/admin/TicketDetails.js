import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const AdminTicketDetails = () => {
  const { user } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedTicket, setEditedTicket] = useState({
    title: '',
    description: '',
    category: '',
    status: '',
    priority: ''
  });
  const [success, setSuccess] = useState(null);
  
  const { id } = useParams();
  const navigate = useNavigate();

  // Update priorityOptions with Norwegian labels
  const priorityOptions = [
    { value: 'Lav', label: 'Lav' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Høy', label: 'Høy' }
  ];

  // Status options in Norwegian
  const statusOptions = [
    { value: 'Åpen', label: 'Åpen' },
    { value: 'Under arbeid', label: 'Under arbeid' },
    { value: 'Løst', label: 'Løst' }
  ];

  // Category options in Norwegian
  const categoryOptions = [
    { value: 'Hardware', label: 'Hardware' },
    { value: 'Software', label: 'Software' },
    { value: 'Network', label: 'Nettverk' },
    { value: 'Other', label: 'Annet' }
  ];

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const ticketRes = await axios.get(`/api/tickets/${id}`);
        setTicket(ticketRes.data.data);
        
        setEditedTicket({
          title: ticketRes.data.data.title,
          description: ticketRes.data.data.description,
          category: ticketRes.data.data.category,
          status: ticketRes.data.data.status,
          priority: ticketRes.data.data.priority
        });
        
        const commentsRes = await axios.get(`/api/tickets/${id}/comments`);
        setComments(commentsRes.data.data);
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching ticket details');
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [id]);

  const handleCommentChange = e => {
    setNewComment(e.target.value);
  };

  const submitComment = async e => {
    e.preventDefault();
    
    try {
      const res = await axios.post(`/api/tickets/${id}/comments`, {
        content: newComment
      });
      
      setComments([...comments, res.data.data]);
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting comment');
    }
  };

  const updateTicketStatus = async (status) => {
    try {
      const res = await axios.put(`/api/tickets/${id}`, { status });
      setTicket(res.data.data);
      setEditedTicket({ ...editedTicket, status });
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating ticket status');
    }
  };

  const updateTicketPriority = async (priority) => {
    try {
      const res = await axios.put(`/api/tickets/${id}/priority`, { priority });
      setTicket(res.data.data);
      setEditedTicket({ ...editedTicket, priority });
      setSuccess('Ticket priority updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating ticket priority');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEditChange = e => {
    setEditedTicket({
      ...editedTicket,
      [e.target.name]: e.target.value
    });
  };

  const submitEdit = async e => {
    e.preventDefault();
    
    try {
      const res = await axios.put(`/api/tickets/${id}`, editedTicket);
      setTicket(res.data.data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating ticket');
    }
  };

  const deleteTicket = async () => {
    try {
      await axios.delete(`/api/tickets/${id}`);
      navigate('/admin/tickets');
    } catch (err) {
      setError(err.response?.data?.error || 'Error deleting ticket');
    }
  };

  if (loading) {
    return <div className="loading">Laster...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!ticket) {
    return <div className="alert alert-danger">Billett ble ikke funnet</div>;
  }

  return (
    <div className="admin-ticket-details">
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="action-buttons">
        <button onClick={() => navigate('/admin/tickets')} className="btn btn-secondary">
          Tilbake til billetter
        </button>
        <div>
          <button onClick={() => setIsEditing(!isEditing)} className="btn btn-info">
            {isEditing ? 'Avbryt redigering' : 'Rediger billett'}
          </button>
          {!isEditing && !showDeleteConfirm && ticket.status === 'Løst' && (
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className="btn btn-danger"
            >
              Slett billett
            </button>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirmation">
          <h3>Er du sikker på at du vil slette denne billetten?</h3>
          <p>Denne handlingen kan ikke angres.</p>
          <div className="buttons">
            <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">
              Avbryt
            </button>
            <button onClick={deleteTicket} className="btn btn-danger">
              Bekreft sletting
            </button>
          </div>
        </div>
      )}

      {isEditing ? (
        <div className="edit-form-container">
          <h2>Rediger billett</h2>
          <form onSubmit={submitEdit}>
            <div className="form-group">
              <label htmlFor="title">Tittel</label>
              <input
                type="text"
                name="title"
                id="title"
                value={editedTicket.title}
                onChange={handleEditChange}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Kategori</label>
              <select
                name="category"
                id="category"
                value={editedTicket.category}
                onChange={handleEditChange}
                className="form-control"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                name="status"
                id="status"
                value={editedTicket.status}
                onChange={handleEditChange}
                className="form-control"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Prioritet</label>
              <select
                name="priority"
                id="priority"
                value={editedTicket.priority}
                onChange={handleEditChange}
                className="form-control"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Beskrivelse</label>
              <textarea
                name="description"
                id="description"
                value={editedTicket.description}
                onChange={handleEditChange}
                required
                className="form-control"
                rows="5"
              ></textarea>
            </div>
            
            <button type="submit" className="btn btn-success">Lagre endringer</button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
              Avbryt
            </button>
          </form>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2>{ticket.title}</h2>
          </div>
          <div className="card-body">
            <div className="ticket-info">
              <p><strong>Opprettet av:</strong> {ticket.createdBy.name}</p>
              <p><strong>E-post:</strong> {ticket.createdBy.email}</p>
              <p><strong>Kategori:</strong> {
                categoryOptions.find(cat => cat.value === ticket.category)?.label || ticket.category
              }</p>
              <p><strong>Opprettet:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
              <p><strong>Oppdatert:</strong> {new Date(ticket.updatedAt).toLocaleString()}</p>
            </div>
            
            <div className="ticket-status">
              <h3>Status</h3>
              <div className="status-controls">
                {statusOptions.map(option => (
                  <button 
                    key={option.value}
                    onClick={() => updateTicketStatus(option.value)}
                    className={`btn ${ticket.status === option.value ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="ticket-priority">
              <h3>Prioritet</h3>
              <div className="priority-controls">
                {priorityOptions.map(option => (
                  <button 
                    key={option.value}
                    onClick={() => updateTicketPriority(option.value)}
                    className={`btn ${ticket.priority === option.value ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="ticket-description">
              <h3>Beskrivelse</h3>
              <p>{ticket.description}</p>
            </div>
            
            {ticket.history && ticket.history.length > 0 && (
              <div className="ticket-history">
                <h3>Billett historikk</h3>
                <div className="history-timeline">
                  {ticket.history.map((item, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-date">
                        {new Date(item.updatedAt).toLocaleString()}
                      </div>
                      <div className="timeline-content">
                        <p>
                          <strong>{
                            item.field === 'status' ? 'Status' : 
                            item.field === 'priority' ? 'Prioritet' :
                            item.field === 'assignedToRole' ? 'Tildelt rolle' : item.field
                          }</strong> endret fra <span className="old-value">"{item.oldValue}"</span> til <span className="new-value">"{item.newValue}"</span>
                          {item.updatedBy && (
                            <span className="updated-by"> av {item.updatedBy.name}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="ticket-comments">
              <h3>Kommentarer</h3>
              
              {comments.length === 0 ? (
                <p>Ingen kommentarer ennå.</p>
              ) : (
                comments.map(comment => (
                  <div key={comment._id} className="comment">
                    <p className="comment-author">
                      <strong>{comment.user.name} ({comment.user.role})</strong> - {new Date(comment.createdAt).toLocaleString()}
                    </p>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))
              )}
              
              <form onSubmit={submitComment} className="comment-form">
                <div className="form-group">
                  <label htmlFor="newComment">Legg til kommentar</label>
                  <textarea
                    name="newComment"
                    id="newComment"
                    value={newComment}
                    onChange={handleCommentChange}
                    required
                    className="form-control"
                    rows="3"
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Send kommentar</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTicketDetails;
