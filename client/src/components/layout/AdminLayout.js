import React, { useContext } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const AdminLayout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <div className="admin-navbar">
        <nav className="top-nav">
          <ul>
            <li><NavLink to="/admin">Admin Hjem</NavLink></li>
            <li><NavLink to="/admin/users">Brukere</NavLink></li>
            <li><NavLink to="/admin/tickets">Saker</NavLink></li>
            <li><NavLink to="/admin/stats">Statistikk</NavLink></li>
            <li><NavLink to="/admin/role-management">Rolleadministrasjon</NavLink></li>
            <li><NavLink to="/faq">FAQ</NavLink></li>
            <li><a href="#!" onClick={handleLogout}>Logg Ut</a></li>
          </ul>
        </nav>
      </div>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
