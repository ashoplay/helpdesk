import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  
  const { login, isAuthenticated, user, error, clearErrors } = useContext(AuthContext);
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

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    const result = await login({ email, password });
    
    if (!result.success) {
      setMessage(result.error || 'Innlogging mislyktes');
    }
  };

  return (
    <div className="form-container">
      <h1>Logg Inn</h1>
      <p>Logg inn for å få tilgang til kontoen din</p>
      
      {message && <div className="alert alert-danger">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={onSubmit}>
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
        <button type="submit" className="btn btn-primary">Logg Inn</button>
      </form>
    </div>
  );
};

export default Login;
