import React, { useState } from 'react';
import axios from 'axios';

const TicketFeedback = ({ ticketId, onFeedbackSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      await axios.post(`/api/tickets/${ticketId}/feedback`, {
        rating,
        comment
      });
      
      setSubmitted(true);
      if (onFeedbackSubmit) {
        onFeedbackSubmit();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="feedback-success">
        <h3>Takk for din tilbakemelding!</h3>
        <p>Din tilbakemelding hjelper oss å forbedre våre støttetjenester.</p>
      </div>
    );
  }

  return (
    <div className="ticket-feedback">
      <h3>Vurder din erfaring</h3>
      <p>Vennligst vurder hvor fornøyd du var med løsningen av denne billetten:</p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="rating-container">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={`rating-star ${rating >= value ? 'active' : ''}`}
              onClick={() => handleRatingClick(value)}
            >
              ★
            </button>
          ))}
          <span className="rating-text">
            {rating === 1 ? 'Dårlig' : 
             rating === 2 ? 'Passe' :
             rating === 3 ? 'Bra' :
             rating === 4 ? 'Veldig Bra' :
             rating === 5 ? 'Utmerket' : 'Velg vurdering'}
          </span>
        </div>
        
        <div className="form-group">
          <label htmlFor="feedback-comment">Kommentarer (Valgfritt)</label>
          <textarea
            id="feedback-comment"
            className="form-control"
            rows="3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Del gjerne ytterligere tilbakemeldinger..."
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={submitting || rating === 0}
        >
          {submitting ? 'Sender inn...' : 'Send tilbakemelding'}
        </button>
      </form>
    </div>
  );
};

export default TicketFeedback;
