import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateTicket = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Software',
    priority: 'Unassigned' // Set default priority to Unassigned
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { title, description, category, priority } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      await axios.post('/api/tickets', formData);
      navigate('/dashboard');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error creating ticket');
    }
  };

  return (
    <div className="form-container">
      <h1>Create New Ticket</h1>
      <p>Fill out the form below to submit a new support ticket</p>
      
      {message && <div className="alert alert-danger">{message}</div>}
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            name="title"
            id="title"
            value={title}
            onChange={onChange}
            required
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            name="category"
            id="category"
            value={category}
            onChange={onChange}
            className="form-control"
          >
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Network">Network</option>
            <option value="Account">Account</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            id="description"
            value={description}
            onChange={onChange}
            required
            className="form-control"
            rows="5"
          ></textarea>
        </div>
        
        <button type="submit" className="btn btn-primary">Submit Ticket</button>
      </form>
    </div>
  );
};

export default CreateTicket;
