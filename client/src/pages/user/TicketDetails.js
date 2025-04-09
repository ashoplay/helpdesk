import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SocketContext from '../../context/SocketContext';

const TicketDetails = () => {
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
    category: ''
  });
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, joinTicket, leaveTicket } = useContext(SocketContext);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        // Get ticket details
        const ticketRes = await axios.get(`/api/tickets/${id}`);
        setTicket(ticketRes.data.data);
        
        // Initialize edit form with current ticket data
        setEditedTicket({
          title: ticketRes.data.data.title,
          description: ticketRes.data.data.description,
          category: ticketRes.data.data.category
        });
        
        // Get ticket comments
        const commentsRes = await axios.get(`/api/tickets/${id}/comments`);
        setComments(commentsRes.data.data);
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching ticket details');
        setLoading(false);
      }
    };

    fetchTicketDetails();
    
    // Join socket room for this ticket
    joinTicket(id);
    
    // Handle new comments
    if (socket) {
      socket.on('newComment', (newComment) => {
        setComments((prevComments) => [...prevComments, newComment]);
      });
    }
    
    // Clean up
    return () => {
      leaveTicket(id);
      if (socket) {
        socket.off('newComment');
      }
    };
  }, [id, socket, joinTicket, leaveTicket]);

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
      navigate('/dashboard');
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
    <div className="ticket-details">
      <div className="action-buttons">
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          Tilbake til Dashbord
        </button>
        <div>
          <button onClick={() => setIsEditing(!isEditing)} className="btn btn-info">
            {isEditing ? 'Avbryt Redigering' : 'Rediger Billett'}
          </button>
          {!isEditing && !showDeleteConfirm && (
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className="btn btn-danger"
            >
              Slett Billett
            </button>
          )}
        </div>
      </div>
      
      {showDeleteConfirm && (
        <div className="delete-confirm">
          <p>Er du sikker på at du vil slette denne billetten?</p>
          <button onClick={deleteTicket} className="btn btn-danger">
            Ja, slett
          </button>
          <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">
            Avbryt
          </button>
        </div>
      )}
      
      {isEditing ? (
        <div className="edit-ticket">
          <form onSubmit={submitEdit}>
            <div className="form-group">
              <label htmlFor="title">Tittel</label>
              <input
                type="text"
                id="title"
                name="title"
                value={editedTicket.title}
                onChange={handleEditChange}
                required
                className="form-control"
              />
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
            
            <div className="form-group">
              <label htmlFor="category">Kategori</label>
              <select
                name="category"
                id="category"
                value={editedTicket.category}
                onChange={handleEditChange}
                required
                className="form-control"
              >
                <option value="">Velg kategori</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Network">Nettverk</option>
                <option value="Other">Annet</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary">Lagre endringer</button>
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
              <p><strong>Kategori:</strong> {ticket.category}</p>
              <p><strong>Status:</strong> {ticket.status}</p>
              <p><strong>Prioritet:</strong> {ticket.priority}</p>
              <p><strong>Opprettet:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
              <p><strong>Oppdatert:</strong> {new Date(ticket.updatedAt).toLocaleString()}</p>
            </div>
            
            <div className="ticket-description">
              <h3>Beskrivelse</h3>
              <p>{ticket.description}</p>
            </div>
            
            <div className="ticket-comments">
              <h3>Kommentarer</h3>
              
              {comments.length === 0 ? (
                <p>Ingen kommentarer enda.</p>
              ) : (
                comments.map(comment => (
                  <div key={comment._id} className="comment">
                    <p className="comment-author">
                      <strong>{comment.user.name}</strong> - {new Date(comment.createdAt).toLocaleString()}
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
                <button type="submit" className="btn btn-primary">Send Kommentar</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;
