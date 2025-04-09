import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const AdminRoute = ({ component: Component }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated && user && user.role === 'admin' ? (
    <Component />
  ) : (
    <Navigate to="/login" />
  );
};

export default AdminRoute;
