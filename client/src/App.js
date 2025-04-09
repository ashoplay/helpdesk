import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layout components
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import SupportLayout from './components/layout/SupportLayout';

// Public pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import FAQ from './pages/FAQ';

// Private pages - User
import UserDashboard from './pages/user/Dashboard';
import CreateTicket from './pages/user/CreateTicket';
import TicketDetails from './pages/user/TicketDetails';
import UserProfile from './pages/user/Profile';

// Private pages - Admin
import AdminDashboard from './pages/admin/Dashboard';
import TicketManagement from './pages/admin/TicketManagement';
import AdminTicketDetails from './pages/admin/TicketDetails';
import ManageUsers from './pages/admin/ManageUsers';
import UserDetails from './pages/admin/UserDetails';
import RoleManagement from './pages/admin/RoleManagement';
import Statistics from './pages/admin/Statistics';

// Support pages
import SupportDashboard from './pages/support/SupportDashboard';

// Import global styles
import './App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            
            {/* User routes */}
            <Route path="/" element={<PrivateRoute />}>
              <Route path="/" element={<Layout />}>
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="tickets/new" element={<CreateTicket />} />
                <Route path="tickets/:id" element={<TicketDetails />} />
              </Route>
            </Route>
            
            {/* Support routes */}
            <Route path="/" element={<SupportRoute />}>
              <Route path="/" element={<SupportLayout />}>
                <Route path="support" element={<SupportDashboard />} />
                <Route path="support/tickets/:id" element={<TicketDetails />} />
                <Route path="profile" element={<UserProfile />} />
              </Route>
            </Route>
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="tickets" element={<TicketManagement />} />
                <Route path="tickets/:id" element={<AdminTicketDetails />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="users/:id" element={<UserDetails />} />
                <Route path="stats" element={<Statistics />} />
                <Route path="role-management" element={<RoleManagement />} />
              </Route>
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

// Private route component
const PrivateRoute = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) return <div className="loading">Loading...</div>;
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

// Support protected route
const SupportRoute = () => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  
  if (loading) return <div className="loading">Loading...</div>;
  
  if (isAuthenticated && (user?.role === '1. linje' || user?.role === '2. linje')) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
};

// Admin protected route
const AdminRoute = () => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  
  if (loading) return <div className="loading">Loading...</div>;
  
  if (isAuthenticated && user?.role === 'admin') {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
};

export default App;
