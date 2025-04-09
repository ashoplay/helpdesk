import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  // Show different navigation links based on user role
  const renderNavLinks = () => {
    if (!isAuthenticated || !user) {
      return (
        <ul>
          <li>
            <Link to="/login">Logg Inn</Link>
          </li>
          <li>
            <Link to="/register">Registrer</Link>
          </li>
          <li>
            <Link to="/faq">FAQ</Link>
          </li>
        </ul>
      );
    }

    // Admin navigation
    if (user.role === 'admin') {
      return (
        <ul>
          <li>
            <Link to="/admin">Admin Dashboard</Link>
          </li>
          <li>
            <Link to="/profile">Min Profil</Link>
          </li>
          <li>
            <Link to="/faq">FAQ</Link>
          </li>
          <li>
            <a href="#!" onClick={handleLogout}>Logg Ut</a>
          </li>
        </ul>
      );
    }

    // Support staff navigation
    if (user.role === '1. linje' || user.role === '2. linje') {
      return (
        <ul>
          <li>
            <Link to="/support">Support Dashboard</Link>
          </li>
          <li>
            <Link to="/profile">Min Profil</Link>
          </li>
          <li>
            <Link to="/faq">FAQ</Link>
          </li>
          <li>
            <a href="#!" onClick={handleLogout}>Logg Ut</a>
          </li>
        </ul>
      );
    }

    // Regular user navigation
    return (
      <ul>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/tickets/new">Opprett Sak</Link>
        </li>
        <li>
          <Link to="/profile">Min Profil</Link>
        </li>
        <li>
          <Link to="/faq">FAQ</Link>
        </li>
        <li>
          <a href="#!" onClick={handleLogout}>Logg Ut</a>
        </li>
      </ul>
    );
  };

  return (
    <nav className="navbar">
      <h1>
        <Link to="/">Helpdesk System</Link>
      </h1>
      <div className="nav-links">
        {renderNavLinks()}
      </div>
    </nav>
  );
};

export default Navbar;
