import React, { useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import AuthContext from '../../context/AuthContext';

const SupportLayout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="support-layout">
      <header className="support-navbar">
        <nav className="navbar">
          <h1>
            <Link to="/support">Helpdesk System</Link>
          </h1>
          <div className="nav-links">
            <ul>
              <li><Link to="/support">Support Dashboard</Link></li>
              <li><Link to="/profile">Min Profil</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><a href="#!" onClick={handleLogout}>Logg Ut</a></li>
            </ul>
          </div>
        </nav>
      </header>
      <main className="container">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default SupportLayout;
