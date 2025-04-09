import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });
  const [message, setMessage] = useState('');
  
  const { register, isAuthenticated, user, error, clearErrors } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    // If already logged in, redirect based on role
    if (isAuthenticated) {
      if (user && user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
    
    // Clear any previous errors
    clearErrors();
  }, [isAuthenticated, user, navigate, clearErrors]);

  const { name, email, password, password2 } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (password !== password2) {
      setMessage('Passordene stemmer ikke overens');
    } else {
      const result = await register({
        name,
        email,
        password
      });
      
      if (!result.success) {
        setMessage(result.error || 'Registrering mislyktes');
      }
    }
  };

  return (
    <div className="form-container">
      <h1>Registrering</h1>
      <p>Opprett en konto for å sende inn støttesaker</p>
      
      {message && <div className="alert alert-danger">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="name">Navn</label>
          <input
            type="text"
            name="name"
            id="name"
            value={name}
            onChange={onChange}
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">E-post</label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={onChange}
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Passord</label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={onChange}
            required
            minLength="6"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password2">Bekreft Passord</label>
          <input
            type="password"
            name="password2"
            id="password2"
            value={password2}
            onChange={onChange}
            required
            minLength="6"
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-primary">Registrer</button>
      </form>
    </div>
  );
};

export default Register;
